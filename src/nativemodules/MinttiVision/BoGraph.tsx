import {
  findNodeHandle,
  PixelRatio,
  requireNativeComponent,
  UIManager,
  useWindowDimensions,
  View,
} from 'react-native';
import {forwardRef, useEffect, useImperativeHandle, useRef} from 'react';

const BoGraphViewManager = requireNativeComponent('BoGraphViewManager');

const createBoGraphFragment = (viewId: number) => {
  try {
    UIManager.dispatchViewManagerCommand(
      viewId,
      // we are calling the 'create' command
      UIManager.BoGraphViewManager.Commands.create.toString(),
      [viewId],
    );
  } catch (e) {}
};

const updateWaveData = (viewId: number, updateData: number) =>
  UIManager.dispatchViewManagerCommand(
    viewId,
    // we are calling the 'create' command
    UIManager.BoGraphViewManager.Commands.updateWaveData.toString(),
    [viewId, updateData],
  );

const BoGraph = forwardRef((props, ref) => {
  const boGraphRef = useRef(null);

  useEffect(() => {
    const viewId = findNodeHandle(boGraphRef.current);
    if (viewId) createBoGraphFragment(viewId);
  }, []);

  function updateData(updatedData: number) {
    const viewId = findNodeHandle(boGraphRef.current);
    if (viewId) updateWaveData(viewId, updatedData);
  }

  useImperativeHandle(ref, () => ({
    updateData,
  }));

  return (
    <View
      className="border border-gray-200"
      style={{
        height: 220,
        start: 0,
        width: useWindowDimensions().width,
      }}>
      <BoGraphViewManager
        style={{
          // converts dpi to px, provide desired height
          height: PixelRatio.getPixelSizeForLayoutSize(200),
          // converts dpi to px, provide desired width
          width: PixelRatio.getPixelSizeForLayoutSize(
            useWindowDimensions().width,
          ),
          marginTop: 30,
        }}
        ref={boGraphRef}
      />
    </View>
  );
});

export default BoGraph;
