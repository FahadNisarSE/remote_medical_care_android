import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useRef, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Video from 'react-native-video';
import WebView from 'react-native-webview';

import {AppointmentTest} from '../api/schema/Appointment';
import {meetingStyles} from '../styles/style';
import {HomeStackNavigatorParamList} from '../utils/AppNavigation';
import {BASE_IMG_URL} from '../utils/config';
import {useAppointmentDetailStore} from '../utils/store/useAppointmentDetailStore';
import {useSmarthoInitialization} from '../utils/store/useSmarthoInitalization';
import {useTestResultModalStore} from '../utils/store/useTestResultModalStore';
import CustomTextRegular from './ui/CustomTextRegular';
import CustomTextSemiBold from './ui/CustomTextSemiBold';
import Loader from './ui/Loader';
import NoRecommendedTests from './ui/NoRecommendedTests';
import { useMinttiVisionStore } from '../utils/store/useMinttiVisionStore';

const {width, height} = Dimensions.get('window');

const RECOMMENDED_TESTS_IMAGES: {
  [key: string]: any;
  'Oxygen Saturation': any;
  'Blood Pressure': any;
  'Heart Rate': any;
  Temprature: any;
  'Respiratory Rate': any;
  'Blood Glucose': any;
  'Heart Sound': any;
  'Lung Sound': any;
  'Self Test': any;
} = {
  'Oxygen Saturation': require('../assets/icons/devices/oxygen_level.png'),
  'Blood Pressure': require('../assets/icons/devices/blood_pressure.png'),
  'Heart Rate': require('../assets/icons/devices/blood_pressure.png'),
  Temprature: require('../assets/icons/devices/temperature.png'),
  'Respiratory Rate': require('../assets/icons/devices/lung_wave.png'),
  'Blood Glucose': require('../assets/icons/devices/sugar_level.png'),
  'Heart Sound': require('../assets/icons/devices/blood_pressure.png'),
  'Lung Sound': require('../assets/icons/devices/lung_wave.png'),
  'Self Test': require('../assets/icons/devices/self_assessment.png'),
};

const mapTestUrl = (testname: string) => {
  switch (testname) {
    case 'Oxygen Saturation':
      return 'BloodOxygen';
    case 'Blood Pressure':
      return 'BloodPressure';
    case 'Heart Rate':
      return 'ECG';
    case 'Temprature':
      return 'BodyTemperature';
    case 'Respiratory Rate':
      return 'ECG';
    case 'Blood Glucose':
      return 'BloodGlucose';
    default:
      return 'MinttiInitalization';
  }
};

function Item({
  DeviceName,
  AppointmentTestId,
  PlaystoreLink,
  Result,
  TestName,
  testAttemptable,
  TestType,
  setShowModal,
  testExpired,
}: AppointmentTest & {
  testAttemptable: boolean;
  testExpired: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackNavigatorParamList>>();
  const {isConnected} = useSmarthoInitialization();
  const {isConnected: isMinttiConnected} = useMinttiVisionStore();
  const {setAudioAndVideoUrl} = useTestResultModalStore();

  const onPressHanlder = () => {
    if (DeviceName === 'Digital Stethoscope') {
      if (isConnected) {
        console.log('Navigation to measuremnt: ', TestName);
        navigation.navigate('StethoScopeMeasurement', {
          appointmentTestId: AppointmentTestId,
          testName: TestName,
        });
      } else {
        navigation.navigate('StethoScopeInitilization', {
          appointmentTestId: AppointmentTestId,
          testName: TestName,
        });
      }
    } else if (DeviceName === 'Self Assessment') {
      navigation.navigate('SelfAssessment', {
        appointmentTestId: AppointmentTestId,
        testName: TestName,
      });
    } else if (DeviceName === 'Dermatoscope') {
      navigation.navigate('DermatoScope', {
        appointmentTestId: AppointmentTestId,
        testName: TestName,
      });
    } else if (DeviceName === 'Vital Signs Monitor') {
      useAppointmentDetailStore.setState({
        appointmentTestId: AppointmentTestId,
      });
      const screen = mapTestUrl(TestName);
      console.log('Screen: ', {screen, isMinttiConnected});
      if (!isMinttiConnected || screen === 'MinttiInitalization')
        navigation.navigate('MinttiInitalization', {
          testRoute: mapTestUrl(TestName),
        });
      else if (isMinttiConnected) navigation.navigate(screen);
      else
        navigation.navigate('MinttiInitalization', {
          testRoute: mapTestUrl(TestName),
        });
    } else {
      Linking.openURL(PlaystoreLink);
    }
  };

  if (TestType === '1' && !Result && !testExpired) return <></>;

  return (
    <View className="px-2 py-3 mb-2 bg-white rounded-lg">
      <View className="flex-row items-center">
        <View className="p-2 mr-2 overflow-hidden rounded-xl bg-primmary">
          <Image
            source={
              RECOMMENDED_TESTS_IMAGES[TestName] ??
              require('../assets/icons/devices/self_assessment.png')
            }
            alt={TestName}
            className="w-6 h-6"
            style={{objectFit: 'contain'}}
          />
        </View>
        <View className="flex-1">
          <CustomTextSemiBold className="text-text">
            {TestName}
          </CustomTextSemiBold>
          <CustomTextRegular className="mt-1 text-xs text-text">
            {DeviceName}
          </CustomTextRegular>
        </View>
        {Result || !testAttemptable ? (
          <></>
        ) : (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPressHanlder}
            className="flex items-center justify-center p-2 my-auto rounded bg-accent">
            <CustomTextRegular className="text-xs text-white">
              Start Test
            </CustomTextRegular>
          </TouchableOpacity>
        )}
      </View>

      {/* Render Result for all test other than dermatoscope */}
      {TestName !== 'DermatoScope' && Result ? (
        <View className="p-2 mt-2 bg-gray-100 rounded-lg">
          {Result.map((result, index) => (
            <React.Fragment key={result.TestResultId}>
              <View className="flex-row items-center gap-x-2">
                {result?.Variables?.map(
                  (item, itemIndex) =>
                    (item.VariableName === 'Patient Video' ||
                      item.VariableName === 'StethoScope Audio') && (
                      <React.Fragment key={item.TestResultVariableId}>
                        {item.VariableName === 'StethoScope Audio' && (
                          <Pressable
                            className="w-fit flex-row items-center bg-primmary rounded px-2 py-1.5 ml-2"
                            onPress={() => {
                              setAudioAndVideoUrl(
                                item.VariableValue,
                                '',
                                'StethoScope Audio',
                                TestName,
                              );
                              setShowModal(true);
                            }}>
                            <Image
                              source={require('../assets/icons/audio_file.png')}
                              className="w-4 h-4"
                              alt="Audio"
                            />
                            <CustomTextSemiBold className="ml-1 text-white">
                              Play
                            </CustomTextSemiBold>
                          </Pressable>
                        )}
                        {item.VariableName === 'Patient Video' && (
                          <Pressable
                            className="w-fit flex-row items-center bg-secondary rounded px-2 py-1.5 ml-2"
                            onPress={() => {
                              setAudioAndVideoUrl(
                                '',
                                item.VariableValue,
                                item.VariableName,
                                TestName,
                              );
                              setShowModal(true);
                            }}>
                            <Image
                              source={require('../assets/icons/play.png')}
                              className="w-4 h-4"
                              alt="Audio"
                            />
                            <CustomTextSemiBold className="ml-1 text-white">
                              Play
                            </CustomTextSemiBold>
                          </Pressable>
                        )}
                      </React.Fragment>
                    ),
                )}
              </View>
              <View className="flex mt-2">
                {result?.Variables?.map(
                  (item, itemIndex) =>
                    item.VariableName !== 'Patient Video' &&
                    item.VariableName !== 'StethoScope Audio' &&
                    (item.VariableName === 'Self Assessment' ? (
                      <View
                        key={item.VariableName + itemIndex}
                        className="flex">
                        <CustomTextRegular className="capitalize text-text">
                          {item.VariableName}:
                        </CustomTextRegular>
                        <View className="mt-2">
                          <Image
                            source={{uri: BASE_IMG_URL + item.VariableValue}}
                            alt="Self Assessment"
                            className="object-cover w-40 h-40 rounded-lg"
                          />
                        </View>
                      </View>
                    ) : (
                      <View
                        key={item.VariableName + itemIndex}
                        className="flex-row items-center">
                        <CustomTextRegular className="capitalize text-text">
                          {item.VariableName}:
                        </CustomTextRegular>
                        <CustomTextRegular className="ml-2 text-xs text-text">
                          {item.VariableValue}
                        </CustomTextRegular>
                      </View>
                    )),
                )}
              </View>
              {result.DoctorComments && (
                <View
                  className="p-2 mt-4 bg-gray-600 rounded"
                  key={'doc-comments'}>
                  <CustomTextRegular className="text-white">
                    Doctor Comments: {result.DoctorComments}
                  </CustomTextRegular>
                </View>
              )}
            </React.Fragment>
          ))}
        </View>
      ) : // Render Result for DermatoScope
      TestName === 'DermatoScope' && Result ? (
        <View className="p-2 mt-2 ml-2 bg-gray-100 rounded-lg">
          {Result?.map((result, index) => (
            <React.Fragment key={result.TestResultId}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className=" gap-x-2">
                {result?.Variables?.map((item, itemIndex) => (
                  <View key={item.VariableName + itemIndex} className="flex">
                    <View className="mt-2">
                      <Image
                        source={{uri: BASE_IMG_URL + item.VariableValue}}
                        alt="Self Assessment"
                        style={{objectFit: 'contain'}}
                        className="object-cover w-40 h-48 bg-gray-400 rounded-lg"
                      />
                    </View>
                  </View>
                ))}
              </ScrollView>
              {result.DoctorComments && (
                <View
                  className="p-2 mt-4 bg-gray-600 rounded"
                  key={'doc-comments'}>
                  <CustomTextRegular className="text-white">
                    Doctor Comments: {result.DoctorComments}
                  </CustomTextRegular>
                </View>
              )}
            </React.Fragment>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default function RecommendedTestsList() {
  const {appointmentDetail} = useAppointmentDetailStore();
  const {audioUrl, videoUrl, variableName, testName} =
    useTestResultModalStore();
  const [showModal, setShowModal] = useState(false);
  const navigation = useNavigation();
  const videoRef = useRef(null);
  const [controls, setControls] = useState(false);

  if (appointmentDetail === undefined) return <></>;

  if (!appointmentDetail || appointmentDetail?.Tests.length === 0)
    return <NoRecommendedTests />;

  const numberofItemHavingResult =
    appointmentDetail?.Tests?.filter(item => item.Result).length || 0;

  const testAttemptable =
    appointmentDetail.AppointmentStatus === 'Accepted' ||
    appointmentDetail.AppointmentStatus === 'On-going' ||
    appointmentDetail.AppointmentStatus === 'Joined';

  const testExpired =
    appointmentDetail.AppointmentStatus.toLowerCase() === 'completed' ||
    appointmentDetail.AppointmentStatus.toLowerCase() === 'canceled';

  return (
    <View className="flex-1 px-4">
      <FlatList
        showsVerticalScrollIndicator={false}
        data={appointmentDetail?.Tests}
        key={appointmentDetail.Tests.length + numberofItemHavingResult}
        keyExtractor={item => item.TestId}
        renderItem={({item}) => (
          <Item
            {...item}
            setShowModal={setShowModal}
            testAttemptable={testAttemptable}
            testExpired={testExpired}
          />
        )}
      />
      {/* Recording Consent Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        style={{justifyContent: 'center', alignItems: 'center'}}
        transparent={true}
        onRequestClose={() => {
          navigation.goBack();
        }}>
        <Pressable
          onPress={() => setShowModal(false)}
          className="w-full h-full bg-black opacity-50"></Pressable>
        <View
          style={{
            ...meetingStyles.modal,
            width: '90%',
            borderTopEndRadius: 15,
            borderTopStartRadius: 15,
            borderBottomStartRadius: 15,
            borderBottomEndRadius: 15,
            height: '60%',
          }}
          className="p-4 m-4 mb-8 bg-white border border-gray-200">
          <View className="flex-1 w-full mt-4">
            {testName === 'Patient Video' ? (
              <View className="flex flex-1 pb-8">
                <View className="flex-row items-center justify-center pb-1.5 mb-1 gap-x-2">
                  <CustomTextSemiBold className="text-base font-semibold text-primmary">
                    {variableName} Result
                  </CustomTextSemiBold>
                </View>
                <Pressable
                  onPress={() => setControls(true)}
                  className="w-full h-full mt-2 overflow-hidden bg-gray-500 rounded-xl">
                  <Video
                    ref={videoRef}
                    controls={controls}
                    paused={true}
                    source={{uri: BASE_IMG_URL + videoUrl}}
                    onBuffer={() => console.log('Video is buffering')}
                    onError={() => console.log('Someting went wrong')}
                    style={styles.backgroundVideo}
                  />
                </Pressable>
              </View>
            ) : (
              <View className="flex flex-1 pb-8">
                <View className="flex-row items-center justify-center pb-1.5 mb-1 gap-x-2">
                  <CustomTextSemiBold className="text-base font-semibold text-primmary">
                    {variableName} Result
                  </CustomTextSemiBold>
                </View>
                <View
                  style={{
                    height: height * 0.3,
                    marginTop: 'auto',
                    borderRadius: 30,
                    overflow: 'hidden',
                    marginBottom: height * 0.025,
                    backgroundColor: 'rgb(229 231 235)',
                  }}>
                  <WebView
                    style={{
                      width: '100%',
                      borderRadius: 20,
                      backgroundColor: 'rgb(229 231 235)',
                    }}
                    originWhitelist={[
                      'https://663d9e1c125be096b2a121bc--majestic-panda-939cbc.netlify.app',
                    ]}
                    source={{
                      uri: 'https://663d9e1c125be096b2a121bc--majestic-panda-939cbc.netlify.app/',
                    }}
                    startInLoadingState
                    renderLoading={() => <Loader size={50} />}
                  />
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});
