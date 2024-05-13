import React, {useCallback, useEffect, useState} from 'react';
import {
  Alert,
  BackHandler,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import useSaveTestResults from '../api/action/useSaveTestResult';
import CustomTextRegular from '../components/ui/CustomTextRegular';
import CustomTextSemiBold from '../components/ui/CustomTextSemiBold';
import useMinttiVision from '../nativemodules/MinttiVision/useMinttiVision';
import {meetingStyles} from '../styles/style';
import {useAppointmentDetailStore} from '../utils/store/useAppointmentDetailStore';
import {useMinttiVisionStore} from '../utils/store/useMinttiVisionStore';
import Button from '../components/ui/Button';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackNavigatorParamList} from '../utils/AppNavigation';
import {queryClient} from '../../App';
import BloodGlucoseIntructionMap from '../components/BloodGlucoseTestSteps';
import BatteryIndicator from '../components/BatteryIndicatory';
import {DrawerToggleButton} from '@react-navigation/drawer';
import ResultIdicatorBar from '../components/ui/ResultIdicatorBar';
import AppUpdating from '../components/AppUpdating';

type BloodOxygenProps = NativeStackScreenProps<
  HomeStackNavigatorParamList,
  'BloodGlucose'
>;

export default function BloodGlucose({navigation}: BloodOxygenProps) {
  const [showModal, setShowModal] = useState(false);
  const {appointmentDetail, appointmentTestId} = useAppointmentDetailStore();
  const {mutate, isPending} = useSaveTestResults();
  const {
    bgEvent,
    bgResult,
    setBgResult,
    setBgEvent,
    isConnected,
    battery,
    isMeasuring,
    setIsMeasuring,
  } = useMinttiVisionStore();
  const {getBattery, measureBg} = useMinttiVision({
    onBgEvent: event => {
      console.log('Event: ', event);
      setBgEvent(event);
      if (event.event === 'bgEventMeasureEnd') {
        setShowModal(true);
      }
    },
    onBgResult: event => {
      console.log('on Measrung result', event);
      setIsMeasuring(false);
      setBgResult(event);
    },
  });

  // Reset all test data
  useEffect(() => {
    setBgEvent(null);
    setBgResult(null);
  }, []);

  function toggleModal(status: boolean) {
    setShowModal(status);
  }

  function handleTestInProgress() {
    Alert.alert(
      'Test in Progress',
      'Body Glucose test is in progress. Please wait for it to complete.',
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

  const MeasruementStepsModal = () => {
    return (
      <Modal
        visible={
          bgEvent?.event !== 'bgEventMeasureEnd' &&
          bgEvent !== null &&
          navigation.getState().routes[navigation.getState().index].name ===
            'BloodGlucose'
        }
        animationType="slide"
        transparent={true}
        style={{
          position: 'relative',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
        }}
        onRequestClose={() => {
          toggleModal(false);
        }}>
        <View className="absolute w-full h-full bg-black opacity-25"></View>
        <View
          style={{
            height: '70%',
          }}
          className="p-4 mx-5 mt-auto mb-10 bg-white rounded-3xl">
          {BloodGlucoseIntructionMap(bgEvent?.event ?? '', () => {
            if (
              bgEvent?.event === 'bgEventGetBgResultTimeout' ||
              bgEvent?.event === 'bgEventCalibrationFailed'
            ) {
              setIsMeasuring(false);
              setBgResult({bg: 0});
              setBgEvent(null);
            } else {
              setIsMeasuring(false);
              setBgResult({bg: 0});
              setBgEvent(null);
              navigation.navigate('AppointmentDetail', {
                id: appointmentDetail?.AppointmentId!,
              });
            }
          })}
        </View>
      </Modal>
    );
  };

  function saveResult() {
    mutate(
      {
        AppointmentTestId: appointmentTestId!,
        VariableName: ['Blood Glucose'],
        VariableValue: [`${bgResult?.bg} mmol/L`],
      },
      {
        onError: () => {
          Toast.show({
            type: 'error',
            text1: 'Someting went wrong while saving test!',
            text2: 'Plese try again.',
          });
        },
        onSuccess: () => {
          toggleModal(false);
          setBgResult({bg: 0});
          setBgEvent(null);

          Toast.show({
            type: 'success',
            text1: 'Save Result',
            text2: 'Blood Glucose result saved successfully. 👍',
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
    setBgResult({bg: 0});
    setBgEvent(null);
    setShowModal(false);
  }

  return (
    <>
      <AppUpdating />
      <View className="flex-1 px-5 bg-white">
        <View className="flex-row items-center py-5">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              isMeasuring ? handleTestInProgress() : navigation.goBack();
            }}
            className="p-1">
            <Image
              source={require('../assets/icons/back_arrow.png')}
              alt="Go back"
            />
          </TouchableOpacity>
          <CustomTextRegular className="mx-auto text-xl text-text">
            Blood Glucose
          </CustomTextRegular>
          <DrawerToggleButton />
        </View>

        {/* Blood Glucose Result */}
        <View className="items-center justify-between p-4 py-8 border border-gray-300 rounded-md">
          <View className="items-center mx-auto">
            <CustomTextRegular className="text-5xl text-text">
              {bgResult?.bg ?? 0}
            </CustomTextRegular>
            <CustomTextRegular className="text-xs text-text">
              mmol/L
            </CustomTextRegular>
            {/* <CustomTextRegular className="px-2 py-1 mt-2 text-[10px] border rounded-full text-secondary border-secondary">
              Normal
            </CustomTextRegular> */}
          </View>
        </View>

        {/* Normal Blood Glucose here */}
        <View className="p-4 mt-4 border border-gray-300 rounded-md">
          <View>
            <CustomTextSemiBold className="text-xs text-center text-text">
              Normal Blood Glucose
            </CustomTextSemiBold>
            <CustomTextRegular className="text-[10px] text-center text-text mt-3">
              3.9 mmol/L - 6.1 mmol/L
            </CustomTextRegular>
            <View
              className="flex-row items-center my-4 rounded"
              style={{opacity: bgResult?.bg ? 100 : 0}}>
              <ResultIdicatorBar
                lowThreshold={3.9}
                highThreshold={6.1}
                lowestLimit={0}
                highestLimit={10}
                value={bgResult?.bg ?? 0}
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
          text={isMeasuring ? 'Measuring...' : 'Start Test'}
          className="mt-auto mb-5"
          disabled={isMeasuring}
          onPress={() => measureBg()}
        />
      </View>
      <MeasruementStepsModal />

      {/* Save Result Modal */}

      <Modal
        visible={
          showModal &&
          navigation.getState().routes[navigation.getState().index].name ===
            'BloodGlucose'
        }
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          if (isPending) return;
          reTakeTesthandler();
          toggleModal(false);
        }}>
        <Pressable
          onPress={() => {
            if (isPending) return;
            reTakeTesthandler();
            toggleModal(false);
          }}
          className="w-full h-full bg-black opacity-25"></Pressable>
        <View
          style={{
            ...meetingStyles.modal,
            height: '75%',
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
                  Blood Glucose
                </CustomTextSemiBold>
              </View>
              <View className="mt-4">
                <View className="flex-row items-center">
                  <CustomTextSemiBold className="text-text">
                    Blood Glucose
                  </CustomTextSemiBold>
                  <CustomTextRegular className="ml-2 text-gray-600">
                    {bgResult?.bg} mmol / L
                  </CustomTextRegular>
                </View>
              </View>

              {/* Normal Blood Glucose here */}
              <View className="p-4 my-8 border border-gray-300 rounded-md">
                <View>
                  <CustomTextSemiBold className="text-xs text-center text-text">
                    Normal Blood Glucose
                  </CustomTextSemiBold>
                  <CustomTextRegular className="text-[10px] text-center text-text mt-3">
                    3.9 mmol/L - 6.1 mmol/L
                  </CustomTextRegular>
                  <View
                    className="flex-row items-center my-4 rounded"
                    style={{opacity: bgResult?.bg ? 100 : 0}}>
                    <ResultIdicatorBar
                      lowThreshold={3.9}
                      highThreshold={6.1}
                      lowestLimit={0}
                      highestLimit={10}
                      value={bgResult?.bg ?? 0}
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
