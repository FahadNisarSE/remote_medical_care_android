import {DrawerToggleButton} from '@react-navigation/drawer';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Image,
  Modal,
  Pressable,
  ToastAndroid,
  TouchableOpacity,
  View,
  BackHandler,
  Alert,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {queryClient} from '../../App';
import useSaveTestResults from '../api/action/useSaveTestResult';
import BatteryIndicator from '../components/BatteryIndicatory';
import Button from '../components/ui/Button';
import CustomTextRegular from '../components/ui/CustomTextRegular';
import CustomTextSemiBold from '../components/ui/CustomTextSemiBold';
import EcgChart from '../nativemodules/MinttiVision/EcgChart';
import useMinttiVision from '../nativemodules/MinttiVision/useMinttiVision';
import {meetingStyles} from '../styles/style';
import {HomeStackNavigatorParamList} from '../utils/AppNavigation';
import {useAppointmentDetailStore} from '../utils/store/useAppointmentDetailStore';
import {useMinttiVisionStore} from '../utils/store/useMinttiVisionStore';
import {calculateAverage} from '../utils/utilityFunctions';
import {useFocusEffect} from '@react-navigation/native';
import AppUpdating from '../components/AppUpdating';

type BloodOxygenProps = NativeStackScreenProps<
  HomeStackNavigatorParamList,
  'ECG'
>;

export default function ECG({navigation}: BloodOxygenProps) {
  const ecgChartRef = useRef();
  const [showModal, setShowModal] = useState(false);
  const {appointmentDetail, appointmentTestId} = useAppointmentDetailStore();
  const [respiratoryRateArray, setrespiratoryRateArray] = useState<number[]>(
    [],
  );
  const [heartRateArray, setHeartRateArray] = useState<number[]>([]);

  const [heartRate, setHeartRate] = useState(0);
  const [respiratoryRate, setRespiratoryRate] = useState(0);
  const [ecgResult, setEcgResult] = useState<
    {rrMax: number; rrMin: number; hrv: number} | undefined
  >();
  const [duration, setDuration] = useState(0);
  const {mutate, isPending} = useSaveTestResults();

  const {isConnected, battery, isMeasuring} = useMinttiVisionStore();
  const {measureECG, stopECG} = useMinttiVision({
    onEcg: event => {
      // @ts-ignore
      ecgChartRef.current?.updateEcgData(event.wave);
    },
    onEcgResult: event => {
      setEcgResult(event.results);
    },
    onEcgRespiratoryRate: event => {
      if (event.respiratoryRate) {
        // @ts-ignore
        setrespiratoryRateArray(prev => [...prev, event?.respiratoryRate]);
        setRespiratoryRate(event.respiratoryRate);
      }
    },
    onEcgHeartRate: event => {
      if (event.heartRate) {
        // @ts-ignore
        setHeartRateArray(prev => [...prev, event.heartRate]);
        setHeartRate(event.heartRate);
      }
    },
    onEcgDuration: event => {
      if (event.duration?.duration) {
        setDuration(event.duration?.duration);
      }
    },
  });

  async function startECGTest() {
    await measureECG();
    setTimeout(async () => {
      await stopECG();
      toggleModal(true);
    }, 90 * 1000); // 1.5 min
  }

  function handleTestInProgress() {
    Alert.alert(
      'Test in Progress',
      'ECG Test is in progress. Please wait for it to complete or stop the test and then go back.',
      [
        {
          text: 'Stop Test and Exit',
          onPress: () => {
            stopECG();
            resetSate();
            navigation.goBack();
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

  function toggleModal(status: boolean) {
    setShowModal(status);
  }

  function resetSate() {
    setHeartRate(0);
    setRespiratoryRate(0);
    setEcgResult(undefined);
    setHeartRateArray([]);
    setrespiratoryRateArray([]);
    setDuration(0);
  }

  function saveResult() {
    mutate(
      {
        AppointmentTestId: appointmentTestId!,
        VariableName: [
          'Heart Rate Variablity',
          'RR min',
          'RR max',
          'Average Heart Rate',
          'Respiratory Rate',
        ],
        VariableValue: [
          `${ecgResult?.hrv} ms`,
          `${ecgResult?.rrMin ?? 0} ms`,
          `${ecgResult?.rrMax} ms`,
          `${calculateAverage(heartRateArray)} bpm`,
          `${calculateAverage(respiratoryRateArray)} bpm`,
        ],
      },
      {
        onError: () => {
          Toast.show({
            type: 'error',
            text1: 'Something went wrong while saving test!',
            text2: 'Plese try again.',
          });
        },
        onSuccess: () => {
          resetSate();
          toggleModal(false),
            Toast.show({
              type: 'success',
              text1: 'Save Result',
              text2: 'ECG result saved successfully. 👍',
            });
          queryClient.invalidateQueries({
            queryKey: [
              `get_appointment_details_${appointmentDetail?.AppointmentId}`,
            ],
          }),
            navigation.navigate('AppointmentDetail', {
              id: appointmentDetail?.AppointmentId!,
            });
        },
      },
    );
  }

  function reTakeTesthandler() {
    setShowModal(false);
    resetSate();
  }

  return (
    <>
      <AppUpdating />
      <View className="flex-1 bg-white">
        <View className="flex-row items-center py-5 mx-5">
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
            ECG
          </CustomTextRegular>
          <DrawerToggleButton />
        </View>

        <EcgChart ref={ecgChartRef} />

        {/* ECG CHART */}
        <View className="items-start justify-between p-4 mx-5 mt-4 border border-gray-200 rounded-md">
          <View>
            <CustomTextRegular className="text-xs text-left text-text">
              Paper Speed: 25 mm/s
            </CustomTextRegular>
            <CustomTextRegular className="text-xs text-left text-text">
              Gain: 10 mm/mv
            </CustomTextRegular>
          </View>
        </View>

        {/* Result here */}
        <View className="items-center justify-between p-4 mx-5 my-3 border border-gray-200 rounded-md">
          <View className="flex-row">
            <View className="flex-col items-start">
              <CustomTextRegular className="text-xs text-text">
                RRI maximum: {ecgResult?.rrMax ?? 0} ms
              </CustomTextRegular>
              <CustomTextRegular className="mt-1 text-xs text-text">
                Heart rate: {heartRate} bpm
              </CustomTextRegular>
              <CustomTextRegular className="mt-1 text-xs text-text">
                Respiratory rate: {respiratoryRate} bpm
              </CustomTextRegular>
            </View>
            <View className="flex-col items-start ml-4">
              <CustomTextRegular className="text-xs text-text">
                RRI minimum: {ecgResult?.rrMin ?? 0} ms
              </CustomTextRegular>
              <CustomTextRegular className="mt-1 text-xs text-text">
                HRV: {ecgResult?.hrv ?? 0} ms
              </CustomTextRegular>
              <CustomTextRegular className="mt-1 text-xs text-text">
                Duration rate: {duration} s
              </CustomTextRegular>
            </View>
          </View>
        </View>

        <View className="flex flex-row justify-between mx-5 mt-4">
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
        <Button
          text={isMeasuring ? 'Measuring' : 'Start Test'}
          className="mx-5 mt-auto mb-5"
          disabled={isMeasuring}
          onPress={() => startECGTest()}
        />
      </View>

      {/* Save Result Modal */}

      <Modal
        visible={
          showModal &&
          navigation.getState().routes[navigation.getState().index].name ===
            'ECG'
        }
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          resetSate();
          toggleModal(false);
        }}>
        <Pressable
          onPress={() => {
            resetSate();
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
                    source={require('../assets/icons/devices/temperature.png')}
                  />
                </View>
                <CustomTextSemiBold className="ml-4 text-lg text-primmary">
                  ECG
                </CustomTextSemiBold>
              </View>
              <View className="mt-4">
                <CustomTextRegular className="ml-2 text-gray-600">
                  Heart Rate: {heartRate} bpm
                </CustomTextRegular>
                <CustomTextRegular className="ml-2 text-gray-600">
                  Average Heart Rate: {calculateAverage(heartRateArray)} bpm
                </CustomTextRegular>
                <CustomTextRegular className="ml-2 text-gray-600">
                  Respiratory Rate: {calculateAverage(respiratoryRateArray)} bpm
                </CustomTextRegular>
                <CustomTextRegular className="ml-2 text-gray-600">
                  RRI Minimum: {ecgResult?.rrMin ?? 0} ms
                </CustomTextRegular>
                <CustomTextRegular className="ml-2 text-gray-600">
                  RRI Maximum: {ecgResult?.rrMax ?? 0} ms
                </CustomTextRegular>
                <CustomTextRegular className="ml-2 text-gray-600">
                  HRV: {ecgResult?.hrv ?? 0} ms
                </CustomTextRegular>
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
                  onPress={reTakeTesthandler}
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
                    {isPending ? 'Saving...' : 'Save Result'}
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
