import {DrawerToggleButton} from '@react-navigation/drawer';
import {useIsFocused} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  AppState,
  BackHandler,
  Dimensions,
  Image,
  Modal,
  PixelRatio,
  Pressable,
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
  View,
  findNodeHandle,
  useWindowDimensions,
} from 'react-native';
import Draggable from 'react-native-draggable';
import RecordScreen, {
  RecordingResponse,
  RecordingResult,
} from 'react-native-record-screen';
import Toast from 'react-native-toast-message';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import {queryClient} from '../../App';
import useSaveSelfAssessment from '../api/action/useSaveSelfAssesment';
import useSaveTestResults from '../api/action/useSaveTestResult';
import AppUpdating from '../components/AppUpdating';
import BatteryIndicator from '../components/BatteryIndicatory';
import MeetingOngoing from '../components/MeetingOngoing';
import Button from '../components/ui/Button';
import CustomTextRegular from '../components/ui/CustomTextRegular';
import CustomTextSemiBold from '../components/ui/CustomTextSemiBold';
import {defaultValue} from '../nativemodules/SmarthoStethoScope/StethoScope.type';
import {
  MeasurementViewManager,
  StethoScopeContext,
} from '../nativemodules/SmarthoStethoScope/useStethoScope';
import {meetingStyles} from '../styles/style';
import {HomeStackNavigatorParamList} from '../utils/AppNavigation';
import {useAppointmentDetailStore} from '../utils/store/useAppointmentDetailStore';
import {useMeetingOngoingStore} from '../utils/store/useMeetingOgoingStore';
import {useSmarthoInitialization} from '../utils/store/useSmarthoInitalization';
import useSaveStethoScopeResult from '../api/action/useSaveStethoScopeResult';

// SmarthoViewManager

type StethoScopeMeasurementProps = NativeStackScreenProps<
  HomeStackNavigatorParamList,
  'StethoScopeMeasurement'
>;

const {width, height} = Dimensions.get('window');

export default function StethoScopeMeasurement({
  route,
  navigation,
}: StethoScopeMeasurementProps) {
  const {hasPermission, requestPermission} = useCameraPermission();
  const isFocused = useIsFocused();
  const isActive = isFocused && AppState.currentState === 'active';
  const device = useCameraDevice('front');
  const cameraRef = useRef<Camera>(null);
  const [videoRecord, setVideoRecord] = useState<RecordingResponse>();
  const [allowedPermission, setAllowedPermission] = useState(hasPermission);
  const [consentModal, setConsentModal] = useState(true);
  const {isOngoingMeeting} = useMeetingOngoingStore();

  const {
    battery,
    getPCMFilePath,
    ref,
    initalizeMeasurementGraph,
    startMeasurement,
    stopMeasurements,
    heartRateArray,
    isMeasuring,
    heartRate,
    toggleEchoMode,
    setHeartRate,
    setHeartRateArray,
  } = useContext(StethoScopeContext) || defaultValue;
  const {mutate, isPending} = useSaveStethoScopeResult();
  const {isConnected} = useSmarthoInitialization();
  const [showModal, setShowModal] = useState(false);
  const {appointmentDetail} = useAppointmentDetailStore();
  const {testName, appointmentTestId} = route.params;
  const [timeoutId, setTimeoutId] = useState<any>(null);
  const audioUrl = useRef('');

  async function requestCameraPermissions() {
    const result = await requestPermission();
    setAllowedPermission(result);
  }

  useEffect(() => {
    if (isMeasuring) {
      const id = setTimeout(() => handleStopMeasurement(), 30000); // 0.5 minute
      setTimeoutId(id);
    }
  }, [isMeasuring]);

  useEffect(() => {
    if (!isConnected) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
      navigation.navigate('StethoScopeInitilization', {
        testName,
        appointmentTestId: appointmentTestId!,
      });
      setHeartRate(0);
      setHeartRateArray([]);
      setShowModal(false);
    }
  }, [isConnected]);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', function () {
      if (isMeasuring) {
        handleTestInProgress();
      } else {
        navigation.goBack();
      }
      return true;
    });
  }, [isMeasuring]);

  useCallback(() => {
    testName === 'Heart Sound'
      ? toggleEchoMode('heart')
      : toggleEchoMode('lungs');
  }, [testName])();

  const memoizedInitializeMeasurementGraph = useCallback(() => {
    initalizeMeasurementGraph();
  }, []);

  useEffect(() => {
    setHeartRate(0);
    setHeartRateArray([]);
    setShowModal(false);
    memoizedInitializeMeasurementGraph();
  }, []);

  async function startRecording() {
    try {
      const res = await RecordScreen.startRecording();
      if (res === RecordingResult.PermissionError) {
        console.log('Permission Denied.....');
      }
    } catch (error) {
      console.log('Something went wrong while recording video....');
    }
  }

  async function stopRecording() {
    try {
      const res = await RecordScreen.stopRecording();
      setVideoRecord(res);
    } catch (error) {
      console.log('Someting went wrong while stopping recording: ', error);
    }
  }

  const handleStopMeasurement = async () => {
    try {
      !isOngoingMeeting && (await stopRecording());
      clearTimeout(timeoutId);
      setTimeoutId(timeoutId);
      audioUrl.current = await stopMeasurements();
      toggleModal(true);
    } catch (error) {
      console.log('Error in file: ', error);
    }
  };

  const handleStartMeasurement = async () => {
    !isOngoingMeeting && (await startRecording());
    startMeasurement();
  };

  function handleTestInProgress() {
    Alert.alert(
      'Test in Progress',
      `${testName} Test is in progress. Please wait for it to complete or stop the test and then go back.`,
      [
        {
          text: 'Stop Test and Exit',
          onPress: async () => {
            await handleStopMeasurement();
            stopMeasurements();
            setHeartRate(0);
            setHeartRateArray([]);
            setShowModal(false);
            navigation.navigate('AppointmentDetail', {
              id: appointmentDetail?.AppointmentId!,
            });
          },
          style: 'destructive',
        },
        {
          text: 'Cancel',
          isPreferred: true,
          style: 'default',
        },
      ],
    );
  }

  function heartRateStats(heartbeats: Array<number>): {
    minRate: number;
    maxRate: number;
    avgRate: string;
  } {
    const validHeartbeats = heartbeats.filter(heartbeat => heartbeat > 0);

    if (validHeartbeats.length === 0) {
      return {minRate: 0, maxRate: 0, avgRate: '0'};
    }

    const minRate = Math.min(...validHeartbeats);
    const maxRate = Math.max(...validHeartbeats);
    const avgRate =
      validHeartbeats.reduce((sum, current) => sum + current, 0) /
      validHeartbeats.length;

    return {minRate, maxRate, avgRate: avgRate.toFixed(2)};
  }

  function TestResultDisplay() {
    const {minRate, maxRate, avgRate} = heartRateStats(heartRateArray);

    return (
      <>
        <CustomTextRegular className="text-gray-600">
          Average: {avgRate} bpm
        </CustomTextRegular>
        <CustomTextRegular className="text-gray-600">
          Min: {minRate} bpm
        </CustomTextRegular>
        <CustomTextRegular className="text-gray-600">
          Max: {maxRate} bpm
        </CustomTextRegular>
      </>
    );
  }

  function retakeTestHandler() {}

  const toggleModal = (status: boolean) => setShowModal(status);

  function saveResult() {
    const {minRate, maxRate, avgRate} = heartRateStats(heartRateArray);

    if (testName === 'Heart Sound') {
      mutate(
        {
          appointmentTestId,
          video: videoRecord
            ? {
                uri: videoRecord?.result.outputURL,
                filename: `video_${appointmentTestId}.mp4`,
                type: 'video/mp4',
              }
            : undefined,
          audio: {
            uri: audioUrl.current,
            filename: 'audioData.pcm',
            type: 'audio/pcm',
          },
          VariableName: [
            'Min Heart Sound',
            'Max Heart Sound',
            'Avg. Heart Sound',
          ],
          VariableValue: [minRate + ' bpm', maxRate + ' bpm', avgRate + ' bpm'],
        },
        {
          onError: error => {
            console.log('Error: ', error);
            Toast.show({
              type: 'error',
              text1: 'Something went wrong!',
            });
          },
          onSuccess: () => {
            Toast.show({
              type: 'success',
              text1: 'Save Result',
              text2: 'Heart Sound result save successfully. 👍',
            });
            queryClient.invalidateQueries({
              queryKey: [
                `get_appointment_details_${appointmentDetail?.AppointmentId}`,
              ],
            });
            if (isOngoingMeeting) {
              toggleModal(false);
              setHeartRate(0);
              setHeartRateArray([]);
              navigation.navigate('AppointmentDetail', {
                id: appointmentDetail?.AppointmentId!,
              });
            }
          },
        },
      );
    } else {
      mutate(
        {
          appointmentTestId,
          video: videoRecord
            ? {
                uri: videoRecord?.result.outputURL,
                filename: `video_${appointmentTestId}.mp4`,
                type: 'video/mp4',
              }
            : undefined,
          audio: {
            uri: audioUrl.current,
            filename: 'audioData.pcm',
            type: 'audio/pcm',
          },
          VariableName: ['Min Lung Sound', 'Max Lung Sound', 'Avg. Lung Sound'],
          VariableValue: [minRate + ' bpm', maxRate + ' bpm', avgRate + ' bpm'],
        },
        {
          onError: error => {
            console.log('Error: ', error);
            ToastAndroid.show('Whoops! Something went wrong', 5000);
          },
          onSuccess: () => {
            Toast.show({
              type: 'success',
              text1: 'Save Result',
              text2: 'Lung sound result save successfully. 👍',
            });
            queryClient.invalidateQueries({
              queryKey: [
                `get_appointment_details_${appointmentDetail?.AppointmentId}`,
              ],
            });
            if (isOngoingMeeting) {
              toggleModal(false);
              setHeartRate(0);
              setHeartRateArray([]);
              navigation.navigate('AppointmentDetail', {
                id: appointmentDetail?.AppointmentId!,
              });
            }
          },
        },
      );
    }
  }

  return (
    <>
      <AppUpdating />
      <MeetingOngoing />
      <View className="flex-1 px-5 bg-white">
        <View className="flex-row items-center py-5">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() =>
              isMeasuring ? handleTestInProgress() : navigation.goBack()
            }
            className="p-1">
            <Image
              source={require('../assets/icons/back_arrow.png')}
              alt="Go back"
            />
          </TouchableOpacity>
          <CustomTextRegular className="mx-auto text-xl text-text">
            {testName === 'Heart Sound'
              ? 'Heart Sound Monitor'
              : 'Lungs Sound Monitor'}
          </CustomTextRegular>
          <DrawerToggleButton />
        </View>

        <View
          style={{
            height: 240,
            start: 0,
            width: useWindowDimensions().width,
          }}>
          <MeasurementViewManager
            style={{
              // converts dpi to px, provide desired height
              height: PixelRatio.getPixelSizeForLayoutSize(200),
              // converts dpi to px, provide desired width
              width: PixelRatio.getPixelSizeForLayoutSize(
                useWindowDimensions().width,
              ),
              marginTop: 200,
            }}
            ref={ref}
          />
        </View>

        <View className="flex flex-row justify-between mt-10">
          <View
            className={`flex flex-row items-center px-4 py-2 mr-auto rounded-full ${
              isConnected ? 'bg-primmary' : 'bg-rose-400'
            }`}>
            <Image
              className="w-3 h-3"
              source={
                isConnected
                  ? require('../assets/icons/bluetooth.png')
                  : require('../assets/icons/bluetooth-off.png')
              }
              alt="Connection status"
            />
            <CustomTextSemiBold className={`ml-2 text-xs text-white`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </CustomTextSemiBold>
          </View>
          <View className="flex flex-row items-center px-3 py-1 rounded-full bg-primmary">
            <BatteryIndicator percentage={battery} />
            <CustomTextSemiBold className="ml-2 text-xs text-white">
              {battery} %
            </CustomTextSemiBold>
          </View>
        </View>
        <View className="items-center my-auto">
          <CustomTextSemiBold className="mb-4 text-text">
            {testName === 'Heart Sound' ? 'Heart Rate' : 'Respiratory Rate'}
          </CustomTextSemiBold>
          <CustomTextRegular className="text-text text-7xl">
            {heartRate}
          </CustomTextRegular>
          <CustomTextRegular className="text-base text-text">
            BPM
          </CustomTextRegular>
        </View>

        <Button
          text={isMeasuring ? 'Stop Test' : 'Start Test'}
          className="mt-auto mb-5"
          onPress={() =>
            isMeasuring ? handleStopMeasurement() : handleStartMeasurement()
          }
        />
        {/* Draggable Camera View */}
        {isOngoingMeeting ? (
          <></>
        ) : (
          <Draggable
            x={20}
            y={height * 0.64}
            onShortPressRelease={() => Alert.alert('touched!!')}>
            <View
              style={{
                position: 'absolute',
                elevation: 20,
                zIndex: 3000,
                borderRadius: 20,
                backgroundColor: 'white',
                overflow: 'hidden',
              }}>
              <Camera
                className="flex-1"
                ref={cameraRef}
                style={{
                  width: width * 0.3,
                  height: width * 0.5,
                }}
                video={true}
                audio={false}
                onError={error => {
                  Toast.show({
                    type: 'error',
                    text1: "Couldn't access camera",
                    text2: error.message,
                  });

                  console.log('first', error);
                }}
                device={device!}
                onInitialized={() => console.log('Camera Initialized...')}
                isActive={isActive}
              />
            </View>
          </Draggable>
        )}
      </View>

      {/* Save Result Modal Here */}
      <Modal
        visible={consentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={async () => {
          if (isPending) return;
          toggleModal(false);
          await retakeTestHandler();
        }}>
        <Pressable
          onPress={() => toggleModal(false)}
          className="w-full h-full bg-black opacity-25"></Pressable>
        <View
          style={{
            ...meetingStyles.modal,
            height: '55%',
          }}
          className="p-4 bg-white">
          <View className="flex-row items-center justify-between w-full mb-auto">
            <CustomTextSemiBold className="mx-auto text-lg font-semibold text-text">
              Test Recording
            </CustomTextSemiBold>
          </View>
          <View className="flex-1 mt-4">
            <Image
              source={require('../assets/icons/video_recording.png')}
              className="w-20 h-20 mx-auto"
              style={{objectFit: 'contain'}}
              alt="Screen Recording"
            />
            <View className="flex-1 my-auto">
              <CustomTextRegular className="my-auto text-sm text-center text-text">
                Your test will be recorded and shared with{' '}
                {appointmentDetail?.doctor.Firstname}{' '}
                {appointmentDetail?.doctor.Lastname} for your upcoming
                appointment on {appointmentDetail?.AppointmentDate}. This video
                recording will only be shared with your doctor and no one else.
                If you need more information, please click on the privacy policy
                for further details.
              </CustomTextRegular>
              <View className="flex flex-row justify-end">
                <TouchableOpacity
                  onPress={() => setConsentModal(false)}
                  disabled={isPending}
                  className="flex-1 px-4 py-3 ml-2 border rounded-md bg-primmary border-primmary">
                  <CustomTextSemiBold className="text-center text-white">
                    OK
                  </CustomTextSemiBold>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Save Result Modal Here */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          if (isPending) return;
          toggleModal(false);
        }}>
        <Pressable
          onPress={() => {
            if (isPending) return;
            toggleModal(false);
          }}
          className="w-full h-full bg-black opacity-25"></Pressable>
        <View
          style={{
            ...meetingStyles.modal,
            height: '65%',
          }}
          className="p-4 bg-white">
          <View className="flex-row items-center justify-between w-full mb-auto">
            <CustomTextSemiBold className="mx-auto text-lg font-semibold text-text">
              Test Result
            </CustomTextSemiBold>
          </View>
          <View className="flex-1 mt-4">
            <View className="flex-1 my-auto">
              <View className="flex-row items-center">
                <View className="p-2 rounded-full bg-primmary">
                  <Image
                    className="w-5 h-5"
                    source={require('../assets/icons/devices/blood_pressure.png')}
                  />
                </View>
                <CustomTextSemiBold className="ml-4 text-lg text-primmary">
                  {testName === 'Heart Sound' ? 'Heart Sound' : 'Lungs Sound'}
                </CustomTextSemiBold>
              </View>
              <View className="mt-4">
                <View>
                  <CustomTextSemiBold className="text-text">
                    {testName === 'Heart Sound'
                      ? 'Heart Rate'
                      : 'Respiratory Rate'}
                  </CustomTextSemiBold>
                  <TestResultDisplay />
                </View>
              </View>
              <CustomTextRegular className="mt-4 text-text">
                By pressing "Save Result", your test results will be securely
                saved and will be shared with{' '}
                {appointmentDetail?.doctor.Firstname}{' '}
                {appointmentDetail?.doctor.Lastname} for your upcoming
                appointment on {appointmentDetail?.AppointmentDate}. If you
                wish, you have the option to retake the test in case you are not
                satisfied with the results.
              </CustomTextRegular>
              <View className="flex flex-row justify-end mt-auto">
                <TouchableOpacity
                  onPress={() => {
                    setHeartRate(0);
                    setHeartRateArray([]);
                    setShowModal(false);
                  }}
                  disabled={isPending}
                  className="px-4 py-2 border rounded-md border-text">
                  <CustomTextRegular className="text-center text-text">
                    Retake Test
                  </CustomTextRegular>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => saveResult()}
                  disabled={isPending}
                  className="px-4 py-2 ml-2 border rounded-md bg-primmary border-primmary">
                  <CustomTextRegular className="text-center text-white">
                    {isPending || uploadingVideo ? 'Saving...' : 'Save Result'}
                  </CustomTextRegular>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
