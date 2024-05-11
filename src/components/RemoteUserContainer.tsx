import {memo} from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  TouchableOpacity,
  View,
} from 'react-native';
import {IRtcEngineEx, RenderModeType, RtcSurfaceView} from 'react-native-agora';
import useGetUserById from '../api/query/useGetUserById';
import {BASE_IMG_URL} from '../utils/config';
import CustomTextSemiBold from './ui/CustomTextSemiBold';
import CustomTextRegular from './ui/CustomTextRegular';
import useGetAppointmentGuest from '../api/query/useGetAppointmentGuests';
import {useAppointmentDetailStore} from '../utils/store/useAppointmentDetailStore';

const dimensions = Dimensions.get('window');

const RemoteUserContainer = memo(
  ({
    id,
    activeVideo,
    numberOfElements,
    setActiveVideo,
    shareScreen,
    stopScreenSharing,
    agoraEngineRef,
    audio,
    video,
  }: {
    id: number;
    activeVideo: number | null;
    numberOfElements: number;
    setActiveVideo: (activeUserId: number) => void;
    shareScreen: boolean;
    stopScreenSharing: () => void;
    agoraEngineRef: React.MutableRefObject<IRtcEngineEx | undefined>;
    audio: boolean;
    video: boolean;
  }) => {
    const {appointmentDetail} = useAppointmentDetailStore();
    const {data} = useGetUserById(id.toString());
    const {data: guestData} = useGetAppointmentGuest(id);

    let containerStyles = {};

    switch (numberOfElements) {
      case 1:
        containerStyles = {
          height: '100%',
          width: dimensions.width,
        };
        break;

      case 2:
        containerStyles = {
          height: dimensions.height * 0.37,
          width: dimensions.width * 0.9,
        };
        break;

      case 3:
        containerStyles = {
          height: dimensions.height * 0.24,
          width: dimensions.width * 0.9,
        };
        break;

      case 4:
        containerStyles = {
          height: dimensions.height * 0.37,
          width: dimensions.width * 0.45,
        };
        break;

      default:
        break;
    }

    const activeContainerStyles = {
      width: dimensions.width,
      height: dimensions.height,
    };

    if (shareScreen) {
      return (
        <View
          style={{display: activeVideo ? 'none' : 'flex'}}
          className={`bg-slate-700 ${
            numberOfElements > 1 ? 'rounded-2xl overflow-hidden mt-2' : ''
          }`}>
          <View style={containerStyles} className="justify-center item-center">
            <Image
              className="w-10 h-10 mx-auto"
              source={require('../assets/icons/cast_white.png')}
              alt="Screen Sharing"
            />
            <CustomTextSemiBold className="mt-2 text-center text-white">
              You are sharing your screen.
            </CustomTextSemiBold>
            <Pressable
              onPress={() => stopScreenSharing()}
              className="px-5 py-1 mx-auto mt-2 rounded bg-primmary w-fit">
              <CustomTextSemiBold className="text-white">
                Stop
              </CustomTextSemiBold>
            </Pressable>
          </View>
        </View>
      );
    }

    let videoWrapperStyles = '';

    if (activeVideo && activeVideo === id) {
      videoWrapperStyles = 'absolute top-0 left-0 right-0 bottom-0';
    } else {
      videoWrapperStyles =
        numberOfElements > 1
          ? 'rounded-2xl overflow-hidden mt-2 relative border border-gray-100'
          : '';
    }
    
    return (
      <View
        className={`${videoWrapperStyles} items-center justify-center bg-white`}>
        {activeVideo !== id && numberOfElements > 1 ? (
          <TouchableOpacity
            onPress={() => setActiveVideo(id)}
            className="absolute z-30 p-2 bg-white rounded-full top-2 left-2">
            <Image
              className="w-5 h-5"
              source={
                id === activeVideo
                  ? require('../assets/icons/minimize.png')
                  : require('../assets/icons/maximize.png')
              }
            />
          </TouchableOpacity>
        ) : null}

        {data ? (
          <Image
            source={{uri: `${BASE_IMG_URL}${data?.ProfileImg}`}}
            alt={`${data?.Firstname} ${data?.Lastname}`}
            className={`absolute rounded-full bg-gray-500 ${
              activeVideo !== id ? 'w-36 h-36' : 'w-16 h-16'
            }`}
          />
        ) : (
          <Image
            source={require('../assets/images/user.png')}
            alt={`Guest user`}
            className={`absolute rounded-full bg-gray-500 ${
              activeVideo !== id ? 'w-36 h-36' : 'w-16 h-16'
            }`}
          />
        )}

        <RtcSurfaceView
          style={{
            ...(id === activeVideo ? activeContainerStyles : containerStyles),
            opacity: video ? 100 : 0,
          }}
          canvas={{
            uid: id,
            renderMode:
              activeVideo === id || numberOfElements === 1
                ? RenderModeType.RenderModeFit
                : RenderModeType.RenderModeFit,
          }}
        />
        <View
          className={`absolute z-30 p-2 bg-white rounded-md ${
            numberOfElements === 1 ? 'bottom-[90px] left-[25px]' : 'bottom-2 left-2'
          }`}>
          <CustomTextRegular className="text-xs text-text">
            {appointmentDetail?.doctor.UserId === id.toString()
              ? `${data?.Firstname} ${data?.Lastname}`
              : guestData
              ? `${guestData.guest_name}`
              : 'Guest User'}
          </CustomTextRegular>
        </View>
      </View>
    );
  },
);

export default RemoteUserContainer;
