import {DrawerToggleButton} from '@react-navigation/drawer';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useState} from 'react';
import {
  Alert,
  BackHandler,
  Image,
  Modal,
  Pressable,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {queryClient} from '../../App';
import useSaveTestResults from '../api/action/useSaveTestResult';
import BatteryIndicator from '../components/BatteryIndicatory';
import Button from '../components/ui/Button';
import CustomTextRegular from '../components/ui/CustomTextRegular';
import CustomTextSemiBold from '../components/ui/CustomTextSemiBold';
import ResultIdicatorBar from '../components/ui/ResultIdicatorBar';
import useMinttiVision from '../nativemodules/MinttiVision/useMinttiVision';
import {meetingStyles} from '../styles/style';
import {HomeStackNavigatorParamList} from '../utils/AppNavigation';
import {useAppointmentDetailStore} from '../utils/store/useAppointmentDetailStore';
import {useMinttiVisionStore} from '../utils/store/useMinttiVisionStore';
import AppUpdating from '../components/AppUpdating';

type BloodOxygenProps = NativeStackScreenProps<
  HomeStackNavigatorParamList,
  'BloodPressure'
>;

export default function BloodPressure({navigation}: BloodOxygenProps) {
  const [showModal, setShowModal] = useState(false);
  const {appointmentDetail, appointmentTestId} = useAppointmentDetailStore();
  const {mutate, isPending} = useSaveTestResults();
  const [appliedPressure, setAppliedPressure] = useState(0);
  const {bp, setBp, isConnected, battery, isMeasuring, setIsMeasuring} =
    useMinttiVisionStore();
  const {measureBp} = useMinttiVision({
    onBp: event => {
      if (event?.error) {
        Toast.show({
          type: 'error',
          text1: 'Blood Pressure Test',
          text2: event.error ?? 'Something went wrong',
        });
        setIsMeasuring(false);
        setAppliedPressure(0);
        setBp(null);
        return;
      }

      setBp(event);

      if (event.result) {
        setAppliedPressure(0);
        setIsMeasuring(false);
        toggleModal(true);
      }
    },
    onBpRaw: event => {
      setAppliedPressure(
        prev =>
          Number(event.decompressionData) ||
          Number(event.pressurizationData) ||
          prev,
      );
    },
  });

  // Reset all values
  useEffect(() => {
    setBp(null);
    setAppliedPressure(0);
  }, []);

  function handleTestInProgress() {
    Alert.alert(
      'Test in Progress',
      'Body Pressure test is in progress. Please wait for it to complete.',
      [
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

  function normalizePressure(pressureValue: number) {
    const maxPressureValue = 17000;
    return Math.round((pressureValue / maxPressureValue) * 180);
  }

  function bloodPressureResult() {
    let systolic = bp?.result?.systolic as number;
    let diastolic = bp?.result?.diastolic as number;

    if (!systolic && !diastolic) return 'Invalid Reading';

    if (systolic < 60 || diastolic < 40) {
      return 'Severe Hypotension';
    } else if (systolic < 90 && diastolic < 60) {
      return 'Low Blood Pressure';
    } else if (systolic < 120 && diastolic < 90) {
      return 'Normal Blood Pressure';
    } else if (systolic < 130 && diastolic < 100) {
      return 'Elevated Blood Pressure';
    } else if (systolic < 140 && diastolic < 110) {
      return 'Stage 1 Hypertension';
    } else if (systolic < 180 && diastolic <= 120) {
      return 'Stage 2 Hypertension';
    } else {
      return 'Hypertensive Crisis';
    }
  }

  function saveResult() {
    mutate(
      {
        AppointmentTestId: appointmentTestId!,
        VariableName: ['Systolic', 'Diastolic', 'Heart Rate'],
        VariableValue: [
          `${bp?.result?.systolic} mmHg`,
          `${bp?.result?.diastolic} mmHg`,
          `${bp?.result?.heartRate} bpm`,
        ],
      },
      {
        onError: () => {
          ToastAndroid.show('Whoops! Something went wrong', 5000);
        },
        onSuccess: () => {
          toggleModal(false),
            setBp(null),
            Toast.show({
              type: 'success',
              text1: 'Save Result',
              text2: 'Blood Pressure result saved successfully. 👍',
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
    setBp(null);
    setAppliedPressure(0);
    setShowModal(false);
  }

  return (
    <>
      <AppUpdating />
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
            Blood Pressure
          </CustomTextRegular>
          <DrawerToggleButton />
        </View>

        {/* Pressure Statistics */}
        <View className="items-center justify-between p-4 border border-gray-200 rounded-md">
          <View className="items-center mx-auto">
            <CustomTextRegular className="text-5xl text-text">
              {normalizePressure(appliedPressure)}
            </CustomTextRegular>
            {/* {bp?.result ? (
              <CustomTextRegular className="px-2 py-1 text-[10px] border rounded-full text-secondary border-secondary">
                {bloodPressureResult()}
              </CustomTextRegular>
            ) : (
              <CustomTextRegular className="px-2 py-1 text-[10px] border rounded-full text-secondary border-secondary">
                No Data
              </CustomTextRegular>
            )} */}
          </View>
        </View>

        {/* Result here */}
        <View className="items-center justify-between p-4 my-3 border border-gray-200 rounded-md">
          <View className="flex-row">
            <View className="items-center flex-1 mx-auto">
              <CustomTextRegular className="mb-4 text-xs text-center text-text">
                Systolic{`\n`}pressure
              </CustomTextRegular>
              <View className="items-center">
                <CustomTextRegular className="text-3xl text-text">
                  {bp ? bp?.result?.systolic : 0}
                </CustomTextRegular>
                <CustomTextRegular className="text-xs text-text">
                  mmHg
                </CustomTextRegular>
              </View>
            </View>
            <View className="items-center flex-1 mx-auto">
              <CustomTextRegular className="mb-4 text-xs text-center text-text">
                Diastolic{`\n`}pressure
              </CustomTextRegular>
              <View className="items-center">
                <CustomTextRegular className="text-3xl text-text">
                  {bp ? bp?.result?.diastolic : 0}
                </CustomTextRegular>
                <CustomTextRegular className="text-xs text-text">
                  mmHg
                </CustomTextRegular>
              </View>
            </View>
            <View className="items-center flex-1 mx-auto">
              <CustomTextRegular className="mb-4 text-xs text-center text-text">
                Heart{`\n`}rate
              </CustomTextRegular>
              <View className="items-center">
                <CustomTextRegular className="text-3xl text-text">
                  {bp ? bp?.result?.heartRate : 0}
                </CustomTextRegular>
                <CustomTextRegular className="text-xs text-text">
                  bpm
                </CustomTextRegular>
              </View>
            </View>
          </View>
        </View>

        {/* Normal Blood Pressure here */}
        <View className="p-4 mt-4 border border-gray-300 rounded-mdd">
          <View>
            <CustomTextSemiBold className="text-xs text-center text-text">
              Systolic Pressure
            </CustomTextSemiBold>
            <CustomTextRegular className="text-[10px] text-center text-text">
              90 mmHg - 120 mmHg
            </CustomTextRegular>
            <View
              className="flex-row items-center my-4 rounded"
              style={{opacity: bp?.result?.systolic ? 100 : 0}}>
              <ResultIdicatorBar
                lowThreshold={90}
                highThreshold={140}
                lowestLimit={60}
                highestLimit={180}
                value={bp?.result?.systolic ?? 0}
              />
            </View>
          </View>
          <View>
            <CustomTextSemiBold className="text-xs text-center text-text">
              Distolic Pressure
            </CustomTextSemiBold>
            <CustomTextRegular className="text-[10px] text-center text-text">
              60 mmHg - 90 mmHg
            </CustomTextRegular>
            <View
              className="flex-row items-center my-4 rounded"
              style={{opacity: bp?.result?.systolic ? 100 : 0}}>
              <ResultIdicatorBar
                lowThreshold={60}
                highThreshold={90}
                lowestLimit={40}
                highestLimit={120}
                value={bp?.result?.diastolic ?? 0}
              />
            </View>
          </View>
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
        <Button
          text={isMeasuring ? 'Measuring' : 'Start Test'}
          className="mt-auto mb-5"
          disabled={isMeasuring}
          onPress={() => measureBp()}
        />
      </View>

      {/* Save Result Modal */}
      <Modal
        visible={
          showModal &&
          navigation.getState().routes[navigation.getState().index].name ===
            'BloodPressure'
        }
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          if (isPending) return;
          setBp(null);
          toggleModal(false);
        }}>
        <Pressable
          onPress={() => {
            if (isPending) return;
            setBp(null);
            toggleModal(false);
          }}
          className="w-full h-full bg-black opacity-25"></Pressable>
        <View
          style={{
            ...meetingStyles.modal,
            height: '90%',
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
                  Blood Pressure
                </CustomTextSemiBold>
              </View>
              <View className="mt-4">
                <CustomTextSemiBold className="text-text">
                  Blood Pressure
                </CustomTextSemiBold>
                <CustomTextRegular className="text-gray-600">
                  Systolic pressure: {bp?.result?.systolic} mmHg
                </CustomTextRegular>
                <CustomTextRegular className="text-gray-600">
                  Diastolic pressure: {bp?.result?.diastolic} mmHg
                </CustomTextRegular>
                <CustomTextRegular className="text-gray-600">
                  Heart Rate: {bp?.result?.heartRate} bpm
                </CustomTextRegular>
              </View>

              {/* Normal Blood Pressure here */}
              <View className="p-4 my-8 border border-gray-300 rounded-md">
                <View>
                  <CustomTextSemiBold className="text-xs text-center text-text">
                    Systolic Pressure
                  </CustomTextSemiBold>
                  <CustomTextRegular className="text-[10px] text-center text-text">
                    90 mmHg - 120 mmHg
                  </CustomTextRegular>
                  <View
                    className="flex-row items-center my-4 rounded"
                    style={{opacity: bp?.result?.systolic ? 100 : 0}}>
                    <ResultIdicatorBar
                      lowThreshold={90}
                      highThreshold={140}
                      lowestLimit={60}
                      highestLimit={180}
                      value={bp?.result?.systolic ?? 0}
                    />
                  </View>
                </View>
                <View>
                  <CustomTextSemiBold className="text-xs text-center text-text">
                    Distolic Pressure
                  </CustomTextSemiBold>
                  <CustomTextRegular className="text-[10px] text-center text-text">
                    60 mmHg - 90 mmHg
                  </CustomTextRegular>
                  <View
                    className="flex-row items-center my-4 rounded"
                    style={{opacity: bp?.result?.systolic ? 100 : 0}}>
                    <ResultIdicatorBar
                      lowThreshold={60}
                      highThreshold={90}
                      lowestLimit={40}
                      highestLimit={120}
                      value={bp?.result?.diastolic ?? 0}
                    />
                  </View>
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
                  onPress={reTakeTesthandler}
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
