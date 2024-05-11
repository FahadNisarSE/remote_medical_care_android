import {
  findNodeHandle,
  PixelRatio,
  requireNativeComponent,
  Text,
  TouchableOpacity,
  UIManager,
  useWindowDimensions,
  View,
} from 'react-native';
import {NativeEventEmitter, NativeModules} from 'react-native';
const {OTGCameraModule} = NativeModules;

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

let OTGCameraViewManager;

try {
  OTGCameraViewManager = requireNativeComponent('OTGCameraViewManager');
} catch (e) {}

const createOTGCameraFragment = (viewId: number) => {
  try {
    UIManager.dispatchViewManagerCommand(
      viewId,
      // we are calling the 'create' command
      UIManager.OTGCameraViewManager.Commands.create.toString(),
      [viewId],
    );
  } catch (e) {
    console.log(e);
  }
};

const joinChannelFromNative = (
  viewId: number,
  accessToken: string,
  channelName: string,
  uid: number,
) => {
  console.log({accessToken, channelName, uid});

  UIManager.dispatchViewManagerCommand(
    viewId,
    // we are calling the 'create' command
    UIManager.OTGCameraViewManager.Commands.joinChannel.toString(),
    // [viewId],
    [viewId, accessToken.token, channelName, uid],
  );
};

const OTGCamera = forwardRef((props, ref) => {
  const OTGCameraRef = useRef(null);
  const OTGCameraCreated = useRef<boolean>(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(NativeModules.OTGCameraModule);
    const scanEventListener = eventEmitter.addListener(
      'onPreviewData',
      event => {
        // Uint8Array.from(Buffer.from(event.data, 'base64'));
        props.onPreviewData(event.data);
        // console.log('onPreviewData ', event);
      },
    );
  }, []);

  useEffect(() => {
    const viewId = findNodeHandle(OTGCameraRef.current);
    if (viewId && !OTGCameraCreated.current) {
      createOTGCameraFragment(viewId);
      OTGCameraCreated.current = true;
    }
  }, []);

  function joinChannel(accessToken: string, channelName: string, uid: number) {
    const viewId = findNodeHandle(OTGCameraRef.current);
    if (viewId) joinChannelFromNative(viewId, accessToken, channelName, uid);
  }

  useImperativeHandle(ref, () => ({
    joinChannel,
  }));

  return (
    <View
      style={{
        height: '100%',
        start: 0,
        width: useWindowDimensions().width,
      }}>
      <OTGCameraViewManager
        style={{
          // converts dpi to px, provide desired height
          height: PixelRatio.getPixelSizeForLayoutSize(
            useWindowDimensions().width,
          ),
          // converts dpi to px, provide desired width
          width: PixelRatio.getPixelSizeForLayoutSize(
            useWindowDimensions().width,
          ),
          marginTop: 240,
        }}
        ref={OTGCameraRef}
        onPreviewData={event => {
          console.log('onPreviewData>>', event);
        }}
      />
    </View>
  );
});

export default OTGCamera;
