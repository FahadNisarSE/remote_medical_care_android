import {isAfter, isBefore} from 'date-fns';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Alert,
  BackHandler,
  Dimensions,
  Image,
  Modal,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AudioAinsMode,
  CameraDirection,
  ChannelProfileType,
  ClientRoleType,
  ExternalVideoSourceType,
  IRtcEngineEx,
  LocalVideoStreamState,
  RenderModeType,
  RtcSurfaceView,
  VideoPixelFormat,
  VideoSourceType,
  createAgoraRtcEngine,
} from 'react-native-agora';

import {useIsFocused} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import useGetAppointmentDetails from '../api/query/useGetAppointmentDetails';
import useGetAppointmentToken, {
  TokenData,
} from '../api/query/useGetAppointmentToken';
import useUpdateAppointmentStatus from '../api/query/useUpdateAppointmentStatus';
import CameraandMicrophonePermissionError from '../components/CameraandMicrophonePermissionError';
import ChatConversation from '../components/ChatConversation';
import CustomSafeArea from '../components/CustomSafeArea';
import DermatoScope from '../components/DermatoScope';
import InviteModal from '../components/InviteModal';
import MeetingOtherOptions from '../components/MeetingOtherOptions';
import MeetingTimer from '../components/MeetingTimer';
import RemoteUserContainer from '../components/RemoteUserContainer';
import Button from '../components/ui/Button';
import CustomTextRegular from '../components/ui/CustomTextRegular';
import CustomTextSemiBold from '../components/ui/CustomTextSemiBold';
import Error from '../components/ui/Error';
import Loader from '../components/ui/Loader';
import {agoraConfig, screenSharingConfig} from '../constant/agoraConfig';
import {meetingStyles} from '../styles/style';
import {HomeStackNavigatorParamList} from '../utils/AppNavigation';
import {BASE_IMG_URL} from '../utils/config';
import useCameraAndMicPermission from '../utils/hook/useCameraAndMicPermission';
import {
  hideMeetingNotification,
  showMeetingNotification,
} from '../utils/pushNotification';
import {useAppointmentDetailStore} from '../utils/store/useAppointmentDetailStore';
import {useMeetingOngoingStore} from '../utils/store/useMeetingOgoingStore';
import {useSignInStore} from '../utils/store/useSignInStore';

type LiveMeetingProps = NativeStackScreenProps<
  HomeStackNavigatorParamList,
  'LiveMeeting'
>;

const dimensions = Dimensions.get('window');

const AppointmentMeeting = ({navigation}: LiveMeetingProps) => {
  const {userData} = useSignInStore();
  const {
    setIsOngoingMeeting,
    isOngoingMeeting,
    appointmentId,
    setAppointmentId,
  } = useMeetingOngoingStore();
  const {data, isError, isLoading, refetch} = useGetAppointmentDetails( appointmentId!,
  );
  const {mutate} = useGetAppointmentToken();
  const current_time = new Date().toISOString();
  const {mutate: updateAppointmentStatus} = useUpdateAppointmentStatus();
  const {setAppointmentDetail} = useAppointmentDetailStore();
  const [isFrontCameraActive, setIsFrontCameraActive] = useState(true);

  const agoraEngineRef = useRef<IRtcEngineEx>();
  const [remoteUid, setRemoteUid] = useState< {uid: number; audio: boolean; video: boolean}[] >([]);
  const [activeVideo, setActiveVideo] = useState<number | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const {getAgoraPermission, cameraAndMicrophonePermissions} = useCameraAndMicPermission();
  const token = useRef<undefined | TokenData>();
  const isScreenFocues = useIsFocused();

  const [microphone, setMicrophone] = useState(true);
  const [enableVideo, setEnableVideo] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [muteRemoteAudio, setMuteRemoteAudio] = useState(false);
  const [demoVideo, setDemoVideo] = useState(false);
  const [modalType, setModalType] = useState< 'other-options' | 'chat' | 'invite' | 'dermatoscope' >('other-options');

  const [chat, setChat] = useState(false);
  const [dermatoScopeEnabled, setDermatoScopeEnabled] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (data) setAppointmentDetail(data);
  }, [data]);

  useEffect(() => {
    setupVideoSDKEngine();
    setTimeout(() => setDemoVideo(prev => !prev), 1000);

    return () => {
      agoraEngineRef.current?.removeAllListeners();
      setIsOngoingMeeting(false);
      stopScreenSharing();
    };
  }, []);

  useEffect(() => {
    if (isJoined && !isOngoingMeeting) {
      setIsOngoingMeeting(true);
      showMeetingNotification();
    }
  }, [isJoined]);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', function () {
      if (!isJoined) agoraEngineRef.current?.stopPreview();
      navigation.goBack();
      return true;
    });

    BackHandler.removeEventListener('hardwareBackPress', () => null);
  }, []);

  useEffect(() => {
    if (isScreenFocues) agoraEngineRef.current?.startPreview();
  }, [isScreenFocues]);

  const setupVideoSDKEngine = useCallback(async () => {
    try {
      if (Platform.OS === 'android') {
        await getAgoraPermission();
      }
      agoraEngineRef.current = createAgoraRtcEngine() as IRtcEngineEx;

      agoraEngineRef.current.registerEventHandler({
        onError: (errorCode, message) => {
          console.log({errorCode, message});
        },
        onLocalVideoStateChanged(source, state, _error) {
          if (source === VideoSourceType.VideoSourceScreen) {
            switch (state) {
              case LocalVideoStreamState.LocalVideoStreamStateStopped:
                stopScreenSharing();
                break;
              case LocalVideoStreamState.LocalVideoStreamStateFailed:
                stopScreenSharing();
                break;
              case LocalVideoStreamState.LocalVideoStreamStateCapturing:
              case LocalVideoStreamState.LocalVideoStreamStateEncoding:
                setScreenSharing(true);
                break;
            }
          }
        },
        onJoinChannelSuccess: connection => {
          connection.localUid === agoraConfig.uid2
            ? agoraEngineRef.current?.muteAllRemoteAudioStreamsEx(
                true,
                connection,
              )
            : null;

          setIsJoining(false);
          setIsJoined(true);

          if (data?.AppointmentStatus === 'Joined' && data.AppointmentId) {
            updateAppointmentStatus({appointmentId: data.AppointmentId});
          }
        },
        onStreamMessageError(
          connection,
          remoteUid,
          streamId,
          code,
          missed,
          cached,
        ) {
          console.log('Error  : ', {
            connection,
            remoteUid,
            streamId,
            code,
            missed,
            cached,
          });
        },
        onUserOffline: (_connection, Uid) => {
          setRemoteUid(prevUser => prevUser.filter(item => item.uid !== Uid));
          if (Uid === activeVideo) setActiveVideo(null);
        },
        onUserJoined: (_connection, Uid) => {
          if (Uid === Number(userData?.Id)) return;

          // If it is screen sharing track mute the audio of screen sharing
          if (Uid === agoraConfig.uid2) {
            agoraEngineRef.current?.muteRemoteAudioStreamEx(
              Uid,
              true,
              _connection,
            );
          }

          setRemoteUid(prev => {
            const existingUserIndex = prev.findIndex(item => item.uid === Uid);

            if (existingUserIndex === -1) {
              return [...prev, {uid: Uid, audio: true, video: true}];
            } else {
              return prev;
            }
          });
        },
        onConnectionLost: connection => {
          Alert.alert('Connection Lost', 'Retrying...');
        },
        onRemoteVideoStateChanged: (
          connection,
          remoteUid,
          state,
          reason,
          elapsed,
        ) => {
          if (reason === 5) {
            setRemoteUid(prev => {
              const prevUsers = prev.filter(user => user.uid !== remoteUid);
              const user = prev.find(user => user.uid === remoteUid);

              return user ? [...prevUsers, {...user, video: false}] : prev;
            });
          } else if (reason === 6) {
            setRemoteUid(prev => {
              const prevUsers = prev.filter(user => user.uid !== remoteUid);
              const user = prev.find(user => user.uid === remoteUid);

              return user ? [...prevUsers, {...user, video: true}] : prev;
            });
          }
        },
      });

      const channelProfile = ChannelProfileType.ChannelProfileLiveBroadcasting;

      agoraEngineRef.current.initialize({
        appId: agoraConfig.appId,
        channelProfile: channelProfile,
      });

      agoraEngineRef.current
        .getMediaEngine()
        .setExternalVideoSource(
          true,
          false,
          ExternalVideoSourceType.VideoFrame,
        );

      agoraEngineRef.current.enableVideo();
      agoraEngineRef.current?.startPreview();

      const rest = agoraEngineRef.current.enableMultiCamera(true, {
        cameraDirection: CameraDirection.CameraRear,
        followEncodeDimensionRatio: true,
        format: {
          width: 1280,
          height: 720,
          fps: 15,
        },
      });

      if (Platform.OS === 'android') {
        agoraEngineRef.current.loadExtensionProvider(
          'agora_screen_capture_extension',
        );

        agoraEngineRef.current.setAINSMode(
          true,
          AudioAinsMode.AinsModeBalanced,
        );
      }
    } catch (e) {
      console.log(e);
    }
  }, []);

  // const joinChannelFromNative = (
  //   accessToken: string,
  //   channelName: string,
  //   uid: number,
  // ) => {
  //   otgCameraRef.current?.joinChannel(accessToken, channelName, uid);
  // };

  const join = async () => {
    if (isJoining) {
      return;
    }

    if (isJoined) {
      return;
    }
    try {
      agoraEngineRef.current?.setChannelProfile(
        ChannelProfileType.ChannelProfileLiveBroadcasting,
      );

      if (data?.MeetingChannel && appointmentId && userData?.Id) {
        setIsJoining(true);
        mutate(
          {
            channel_name: data?.MeetingChannel,
            user_id: userData?.Id,
            appointment_id: appointmentId,
          },
          {
            onError: () => {
              Toast.show({
                type: 'error',
                text1: 'Ooops!',
                text2: 'Something went wrong. Please try again.',
              });
              setIsJoining(false);
            },
            onSuccess: tokenData => {
              token.current = tokenData;

              const res = agoraEngineRef.current?.joinChannel(
                tokenData.token,
                data?.MeetingChannel!,
                Number(userData?.Id),

                {
                  clientRoleType: ClientRoleType.ClientRoleBroadcaster,
                },
              );
            },
          },
        );
      }
    } catch (e) {
      console.log(e);
    }
  };

  const leave = () => {
    try {
      if (screenSharing) stopScreenSharing();

      agoraEngineRef.current?.leaveChannel();
      setRemoteUid([]);
      setActiveVideo(null);
      setIsJoined(false);
      setMuteRemoteAudio(false);
      setMicrophone(true);
      setEnableVideo(true);
      setIsOngoingMeeting(false);
      hideMeetingNotification();
      setAppointmentId(null);
      !isFrontCameraActive && switchCamera();

      // @ts-ignore
      navigation.navigate('Home');
    } catch (e) {
      console.log(e);
    }
  };

  const startScreenCapture = () => {
    agoraEngineRef.current?.startScreenCapture({
      captureVideo: screenSharingConfig.captureVideo,
      captureAudio: screenSharingConfig.captureAudio,
      videoParams: {
        dimensions: {
          width: screenSharingConfig.width,
          height: screenSharingConfig.height,
        },
        frameRate: screenSharingConfig.frameRate,
        bitrate: screenSharingConfig.frameRate,
        contentHint: screenSharingConfig.contentHint,
      },
      audioParams: {
        sampleRate: screenSharingConfig.sampleRate,
        channels: screenSharingConfig.channels,
        captureSignalVolume: screenSharingConfig.captureSignalVolume,
      },
    });

    const res2 = agoraEngineRef.current?.joinChannelEx(
      token?.current?.token || '',
      {
        channelId: data?.MeetingChannel!,
        localUid: agoraConfig.uid2,
      },
      {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
        publishMicrophoneTrack: false,
        publishCameraTrack: false,
        publishScreenCaptureAudio: microphone ? true : false,
        publishScreenCaptureVideo: true,
      },
    );

    if (res2 === 0) {
      setScreenSharing(true);
    }
  };

  const stopScreenSharing = () => {
    agoraEngineRef.current?.stopScreenCapture();
    agoraEngineRef.current?.leaveChannelEx({
      channelId: data?.MeetingChannel!,
      localUid: agoraConfig.uid2,
    });
    setScreenSharing(false);
  };

  const startDermatoScope = () => {
    setShowModal(false);
    setModalType('dermatoscope');
    setChat(false);
    setTimeout(() => setShowModal(true), 200);
  };

  const stopDermatoScope = () => {
    !isFrontCameraActive && switchCamera();
    setDermatoScopeEnabled(false);
    setShowModal(false);
  };

  const toggleMicrophone = () => {
    if (microphone) {
      agoraEngineRef.current?.muteLocalAudioStream(true);
      if (screenSharing)
        agoraEngineRef.current?.updateChannelMediaOptionsEx(
          {
            publishScreenCaptureAudio: false,
          },
          {
            channelId: data?.MeetingChannel!,
            localUid: agoraConfig.uid2,
          },
        );
      setMicrophone(false);
    } else {
      agoraEngineRef.current?.muteLocalAudioStream(false);
      if (screenSharing)
        agoraEngineRef.current?.updateChannelMediaOptionsEx(
          {
            publishScreenCaptureAudio: false,
          },
          {
            channelId: data?.MeetingChannel!,
            localUid: agoraConfig.uid2,
          },
        );
      setMicrophone(true);
    }
  };

  const toggleLocalVideo = () => {
    if (enableVideo) {
      agoraEngineRef.current?.muteLocalVideoStream(true);
      setEnableVideo(false);
    } else {
      agoraEngineRef.current?.muteLocalVideoStream(false);
      setEnableVideo(true);
    }
  };

  const switchCamera = () => {
    setIsFrontCameraActive(prev => !prev);
    agoraEngineRef.current?.switchCamera();
  };

  const toggleRemoteAudio = () => {
    if (!muteRemoteAudio) {
      agoraEngineRef.current?.muteAllRemoteAudioStreams(true);
      setMuteRemoteAudio(true);
    } else {
      agoraEngineRef.current?.muteAllRemoteAudioStreams(false);
      setMuteRemoteAudio(false);
    }
  };

  function openChat() {
    setModalType('chat');
    setChat(true);
    setShowModal(true);
  }

  function closeChat() {
    setChat(false);
    setShowModal(false);
  }

  if (isLoading) return <Loader size={50} />;

  if (isError) return <Error />;

  return (
    <CustomSafeArea stylesClass="flex-1 justify-end relative">
      {/* <OTGCamera
        onPreviewData={data => {
          console.log('onPreviewData');
          // console.log('onPreviewData>>', Buffer.from(data, 'base64'));crrrrr
          // pushFrame(Buffer.from(data, 'base64'), videoTrackId);
          // pushFrame(data, videoTrackId);
        }}
        ref={otgCameraRef}
      /> */}
      {/* Header */}
      {isJoined && (
        <View className="absolute top-0 z-30 flex-1 w-full p-2 h-fit">
          <View className='flex-row items-center justify-between flex-1 w-full p-2 mx-auto rounded-md bg-black/40'>
          <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
            disabled={!isJoined}
            className="flex items-center justify-center w-10 h-10 mr-2 rounded-xl bg-secondary">
            <Image
              className="w-5 h-5"
              source={require('../assets/icons/home.png')}
              alt="toggle remote audio"
            />
            <CustomTextRegular
              className={`text-white text-[8px] mt-[1px] text-center`}>
              Invite
            </CustomTextRegular>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setModalType('invite');
              setChat(false);
              setShowModal(true);
            }}
            disabled={!isJoined}
            className="flex items-center justify-center w-10 h-10 mr-2 rounded-xl bg-secondary">
            <Image
              className="w-5 h-5"
              source={require('../assets/icons/user-plus.png')}
              alt="toggle remote audio"
            />
            <CustomTextRegular
              className={`text-white text-[8px] mt-[1px] text-center`}>
              Invite
            </CustomTextRegular>
          </TouchableOpacity>
          <MeetingTimer meetingEndTime={new Date(data?.IsoEndTime!)} />
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => toggleRemoteAudio()}
              disabled={!isJoined}
              className={`flex items-center justify-center mr-2 w-10 h-10 rounded-xl ${
                muteRemoteAudio ? 'bg-white' : 'bg-primmary'
              }`}>
              <Image
                className="w-5 h-5"
                source={
                  muteRemoteAudio
                    ? require('../assets/icons/volume-x.png')
                    : require('../assets/icons/volume-2.png')
                }
                alt="toggle remote audio"
              />
              <CustomTextRegular
                className={`${
                  muteRemoteAudio ? 'text-text' : 'text-white'
                } text-[8px] mt-[1px] text-center`}>
                {muteRemoteAudio ? 'Unmute' : 'Mute'}
              </CustomTextRegular>
            </TouchableOpacity>
            {dermatoScopeEnabled ? (
              <TouchableOpacity
                onPress={() => stopDermatoScope()}
                className={`flex-row items-center justify-center p-2 rounded-xl bg-amber-500`}>
                <Image
                  className="w-5 h-5"
                  source={require('../assets/icons/dermatology_lens.png')}
                  alt="Close dermatology lesn"
                />
                <CustomTextRegular className="text-white text-[10px] ml-1">
                  Stop Lens
                </CustomTextRegular>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => switchCamera()}
                disabled={!isJoined}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-primmary">
                <Image
                  className="w-5 h-5"
                  source={require('../assets/icons/switch-camera.png')}
                  alt="toggle remote audio"
                />
                <CustomTextRegular
                  className={`text-white text-[8px] mt-0.5 text-center`}>
                  Switch
                </CustomTextRegular>
              </TouchableOpacity>
            )}
          </View>
          </View>
        </View>
      )}

      {/* Join Button */}
      {!isJoined && (
        <View className="absolute top-0 z-30 items-center justify-center flex-1 w-full h-full px-5 py-4 bg-white">
          {/* Permission Error */}
          {!cameraAndMicrophonePermissions ? (
            <CameraandMicrophonePermissionError dimensions={dimensions} />
          ) : (
            <>
              <CustomTextSemiBold className="text-2xl text-text">
                Appointment Meeting
              </CustomTextSemiBold>
              <CustomTextRegular className="mt-2 text-text">
                Time: {data?.AppointmentStartTime} - {data?.AppointmentEndTime}
              </CustomTextRegular>
              <CustomTextRegular className="mt-1 text-xs text-text">
                Date: {data?.AppointmentDate}
              </CustomTextRegular>
              <View className="mt-4 overflow-hidden bg-slate-500 rounded-2xl">
                <RtcSurfaceView
                  key={demoVideo}
                  canvas={{
                    sourceType: VideoSourceType.VideoSourceCamera,
                    renderMode: RenderModeType.RenderModeAdaptive,
                  }}
                  style={{
                    width: 150,
                    height: 250,
                    opacity: enableVideo ? 1 : 0,
                  }}
                />
              </View>
              <View className="flex-row items-center my-4">
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => toggleMicrophone()}
                  className={`flex items-center justify-center w-12 h-12 rounded-2xl ${
                    microphone ? 'bg-primmary' : 'bg-white'
                  }`}>
                  <Image
                    source={
                      microphone
                        ? require('../assets/icons/mic.png')
                        : require('../assets/icons/mic-off.png')
                    }
                    className="w-5 h-5"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => toggleLocalVideo()}
                  className={`flex items-center justify-center w-12 h-12 rounded-2xl ml-4 ${
                    enableVideo ? 'bg-primmary' : 'bg-white'
                  }`}>
                  <Image
                    source={
                      enableVideo
                        ? require('../assets/icons/video.png')
                        : require('../assets/icons/video-off.png')
                    }
                    className="w-5 h-5"
                  />
                </TouchableOpacity>
              </View>

              <CustomTextRegular
                className="mx-auto mb-6 text-center text-text"
                style={{width: dimensions.width * 0.7}}>
                {isBefore(current_time, data?.IsoStartTime!)
                  ? `The meeting will start at sharp \n ${data?.AppointmentStartTime} - ${data?.AppointmentDate}`
                  : isAfter(current_time, data?.IsoEndTime!)
                  ? 'This meeting has already concluded.'
                  : isJoining
                  ? 'You are currently being connected to the meeting.'
                  : 'Click to enter the meeting.'}
              </CustomTextRegular>

              <Button
                disabled={
                  isBefore(current_time, data?.IsoStartTime!) ||
                  isAfter(current_time, data?.IsoEndTime!) ||
                  isJoining
                }
                text={
                  isBefore(current_time, data?.IsoStartTime!)
                    ? 'Join Soon'
                    : isAfter(current_time, data?.IsoEndTime!)
                    ? 'Expired'
                    : isJoining
                    ? 'Joining...'
                    : 'Join Now'
                }
                className="min-w-[200px] bg-[#416d6d]"
                onPress={() => join()}
              />
            </>
          )}
        </View>
      )}

      {/* User Video */}
      {isJoined && (
        <View
          className={`items-center justify-center bg-white rounded-lg ${
            remoteUid.length > 0 ? 'border-2 border-white' : ''
          }`}
          style={
            remoteUid.length === 0
              ? meetingStyles.selfVideoContainer
              : meetingStyles.selfVideoContainerFloat
          }>
          <Image
            source={{uri: BASE_IMG_URL + userData?.ProfileImg}}
            alt={`${userData?.Firstname} ${userData?.ProfileImg}}`}
            className={`absolute rounded-full ${
              remoteUid.length === 0 ? 'w-36 h-36' : 'w-16 h-16'
            }`}
          />
          <RtcSurfaceView
            canvas={{
              uid: Number(userData?.Id),
              sourceType: VideoSourceType.VideoSourceCamera,
              renderMode: RenderModeType.RenderModeHidden,
            }}
            zOrderMediaOverlay={true}
            style={
              remoteUid.length === 0
                ? {
                    ...meetingStyles.selfVideoPlayer,
                    opacity: enableVideo ? 1 : 0,
                  }
                : {
                    ...meetingStyles.selfVideoPlayerFloat,
                    opacity: enableVideo ? 1 : 0,
                  }
            }
          />
        </View>
      )}

      {/* Remote Users Videos */}
      <View
        className={`flex flex-row flex-wrap justify-center ${
          remoteUid.length > 1 && !activeVideo ? 'h-4/5 my-auto' : 'flex-1'
        }`}
        style={{columnGap: 10}}>
        {remoteUid?.map((item, index) =>
          activeVideo && activeVideo !== item.uid ? null : (
            <RemoteUserContainer
              id={item.uid}
              agoraEngineRef={agoraEngineRef}
              activeVideo={activeVideo}
              shareScreen={item.uid === agoraConfig.uid2}
              numberOfElements={remoteUid.length}
              setActiveVideo={setActiveVideo}
              audio={item.audio}
              video={item.video}
              key={item.uid}
              stopScreenSharing={stopScreenSharing}
            />
          ),
        )}
      </View>

      {/*  Control Options */}
      {isJoined && (
        <View className="absolute bottom-0 z-30 p-2 h-fit">
          <View className='flex-row items-center justify-between flex-1 w-full p-2 mx-auto rounded-md bg-black/40'>
          <TouchableOpacity
            activeOpacity={0.7}
            // onPress={
            //   // joinChannelFromNative(token.current, data?.MeetingChannel!, 123)
            // }
            onPress={() => toggleMicrophone()}
            className={`flex items-center justify-center w-12 h-12 rounded-2xl ${
              microphone ? 'bg-primmary' : 'bg-white'
            }`}>
            <Image
              source={
                microphone
                  ? require('../assets/icons/mic.png')
                  : require('../assets/icons/mic-off.png')
              }
              className="w-5 h-5"
            />
            <CustomTextRegular className="text-white text-[8px] mt-[1px] text-center">
              Mic
            </CustomTextRegular>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => toggleLocalVideo()}
            className={`flex items-center justify-center w-12 h-12 rounded-2xl ${
              enableVideo ? 'bg-primmary' : 'bg-white'
            }`}>
            <Image
              source={
                enableVideo
                  ? require('../assets/icons/video.png')
                  : require('../assets/icons/video-off.png')
              }
              className="w-5 h-5"
            />
            <CustomTextRegular className="text-white text-[8px] mt-[1px] text-center">
              Camera
            </CustomTextRegular>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => leave()}
            className={`flex items-center justify-center w-16 h-16 rounded-full ${
              isJoined ? 'bg-red-500' : 'bg-primmary'
            }`}>
            <Image
              source={require('../assets/icons/phone.png')}
              className="w-6 h-6"
            />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => openChat()}
            className="flex items-center justify-center w-12 h-12 bg-white rounded-2xl">
            <Image
              source={require('../assets/icons/message.png')}
              className="w-5 h-5"
            />
            <CustomTextRegular className="text-text text-[8px] mt-[1px] text-center">
              Chat
            </CustomTextRegular>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {
              setModalType('other-options');
              setChat(false);
              setShowModal(true);
            }}
            className="flex items-center justify-center w-12 h-12 bg-white rounded-2xl">
            <Image
              source={require('../assets/icons/menu.png')}
              className="w-5 h-5"
            />
            <CustomTextRegular className="text-text text-[8px] mt-[1px] text-center">
              Menu
            </CustomTextRegular>
          </TouchableOpacity>
          </View>
        </View>
      )}

      {/* MODAL HERE */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowModal(false);
        }}>
        <Pressable
          onPress={() => setShowModal(false)}
          className="w-full h-full bg-black opacity-25"></Pressable>
        <View
          style={{
            ...meetingStyles.modal,
            backgroundColor: 'white',
            height:
              modalType === 'other-options'
                ? '45%'
                : modalType === 'chat'
                ? '90%'
                : dimensions.height * 0.5,
          }}
          className="p-4 bg-slate-100">
          {modalType === 'chat' ? (
            <ChatConversation
              goback={() => closeChat()}
              doctor={data?.doctor!}
            />
          ) : modalType === 'other-options' ? (
            <MeetingOtherOptions
              screenSharing={screenSharing}
              setActiveVideo={setActiveVideo}
              activeVideo={activeVideo}
              dermatoScopeEnabled={dermatoScopeEnabled}
              stopDermatoScope={stopDermatoScope}
              setShowModal={setShowModal}
              refetch={refetch}
              startDermatoScope={startDermatoScope}
              startScreenCapture={startScreenCapture}
              stopScreenSharing={stopScreenSharing}
            />
          ) : modalType === 'invite' ? (
            <InviteModal setShowModal={setShowModal} />
          ) : (
            <DermatoScope
              switchCamera={switchCamera}
              setShowModal={setShowModal}
              setDermatoScopeEnabled={setDermatoScopeEnabled}
              isFrontCameraActive={isFrontCameraActive}
            />
          )}
        </View>
      </Modal>
    </CustomSafeArea>
  );
};

export default AppointmentMeeting;