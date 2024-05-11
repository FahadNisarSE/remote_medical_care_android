import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useMemo, useState} from 'react';
import {Image, Pressable, TouchableOpacity, View} from 'react-native';
import {meetingStyles} from '../styles/style';
import {HomeStackNavigatorParamList} from '../utils/AppNavigation';
import {useAppointmentDetailStore} from '../utils/store/useAppointmentDetailStore';
import {useSmarthoInitialization} from '../utils/store/useSmarthoInitalization';
import CustomTextRegular from './ui/CustomTextRegular';
import CustomTextSemiBold from './ui/CustomTextSemiBold';
import {RefetchOptions, QueryObserverResult} from '@tanstack/react-query';
import {AppointmentDetail} from '../api/schema/Appointment';

interface MeetingOtherOptionsProps {
  setShowModal: (value: boolean) => void;
  setActiveVideo: (value: number | null) => void;
  screenSharing: boolean;
  activeVideo: number | null;
  stopScreenSharing: () => void;
  startScreenCapture: () => void;
  startDermatoScope: () => void;
  stopDermatoScope: () => void;
  dermatoScopeEnabled: boolean;
  refetch: (
    options?: RefetchOptions | undefined,
  ) => Promise<QueryObserverResult<AppointmentDetail, Error>>;
}

export default function MeetingOtherOptions({
  setShowModal,
  refetch,
  setActiveVideo,
  activeVideo,
  stopDermatoScope,
  dermatoScopeEnabled,
  startDermatoScope,
  screenSharing,
  stopScreenSharing,
  startScreenCapture,
}: MeetingOtherOptionsProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackNavigatorParamList>>();
  const {appointmentDetail} = useAppointmentDetailStore();
  const {isConnected} = useSmarthoInitialization();
  const lungSoundTest = useMemo(
    () => appointmentDetail?.Tests.find(test => test.TestName === 'Lung Sound'),
    [appointmentDetail],
  );
  const heartSoundTest = useMemo(
    () =>
      appointmentDetail?.Tests.find(test => test.TestName === 'Heart Sound'),
    [appointmentDetail],
  );

  const [otherOptions, setOtherOptions] = useState([
    // {
    //   title: 'Dental Camera',
    //   imageUrl: () => require('../assets/icons/dental_camera.png'),
    //   onPress: () => console.log('Dermatology Lens Pressed..'),
    // },
    {
      title: 'Dermatology Lens',
      imageUrl: () => require('../assets/icons/focus.png'),
      onPress: () => {
        console.log('dermatoscope: ', dermatoScopeEnabled);
        !dermatoScopeEnabled ? startDermatoScope() : stopDermatoScope();
      },
      active: dermatoScopeEnabled,
    },
    {
      title: 'Screen Share',
      imageUrl: () => require('../assets/icons/cast.png'),
      onPress: () => {
        screenSharing ? stopScreenSharing() : startScreenCapture();
        setShowModal(false);
      },
      activeVideo: screenSharing,
    },
    {
      title: 'Exit full Screen',
      imageUrl: () => require('../assets/icons/minimize.png'),
      onPress: () => {
        setActiveVideo(null);
        setShowModal(false);
      },
      active: activeVideo,
    },
  ]);

  return (
    <>
      <View className="flex-row items-center justify-between w-full mb-auto">
        <CustomTextSemiBold className="mx-auto text-lg font-semibold text-primary">
          More Options
        </CustomTextSemiBold>
      </View>
      <View className="flex flex-row flex-wrap items-stretch justify-center mt-4 mb-auto">
        {otherOptions.map(option => (
          <TouchableOpacity
            style={meetingStyles.menuButton}
            key={option.title}
            onPress={option.onPress}
            activeOpacity={0.7}
            className={`flex items-center justify-center p-2 mx-1 mb-2 rounded-md ${
              option?.active ? 'border' : 'border border-gray-200'
            }`}>
            <Image
              className="w-6 h-6"
              source={option.imageUrl()}
              alt={option.title}
            />
            <CustomTextRegular className="mt-4 text-[10px] text-center text-text">
              {option.title}
            </CustomTextRegular>
          </TouchableOpacity>
        ))}
      </View>
      <View className="flex-1 w-full pt-4 mt-2 border-t border-gray-300">
        <Pressable
          onPress={() => refetch()}
          className="flex-row items-center px-4 py-2 ml-auto rounded-full bg-primmary">
          <Image
            className="w-3 h-3"
            source={require('../assets/icons/refresh.png')}
            alt="refetch tests"
          />
          <CustomTextRegular className="ml-2 text-[10px] text-white">
            Reload Tests
          </CustomTextRegular>
        </Pressable>
        <View className="flex flex-row flex-wrap items-stretch justify-center mt-4 mb-auto">
          {heartSoundTest &&
            (!heartSoundTest.Result || heartSoundTest.Result?.length === 0) && (
              <TouchableOpacity
                style={meetingStyles.menuButton}
                key={heartSoundTest.TestName}
                onPress={() => {
                  setShowModal(false);
                  !screenSharing && startScreenCapture();

                  isConnected
                    ? navigation.navigate('StethoScopeMeasurement', {
                        testName: heartSoundTest.TestName,
                        appointmentTestId: heartSoundTest.AppointmentTestId,
                      })
                    : navigation.navigate('StethoScopeInitilization', {
                        testName: heartSoundTest.TestName,
                        appointmentTestId: heartSoundTest.AppointmentTestId,
                      });
                }}
                activeOpacity={0.7}
                className={`flex items-center justify-center p-2 mx-1 mb-2 rounded-md border border-gray-200`}>
                <Image
                  className="w-6 h-6"
                  source={require('../assets/icons/heart_wave.png')}
                  alt={heartSoundTest.TestName}
                />
                <CustomTextRegular className="mt-4 text-[10px] text-center text-text">
                  {heartSoundTest.TestName}
                </CustomTextRegular>
              </TouchableOpacity>
            )}

          {lungSoundTest &&
            (!lungSoundTest.Result || lungSoundTest.Result?.length === 0) && (
              <TouchableOpacity
                style={meetingStyles.menuButton}
                key={lungSoundTest.TestName}
                onPress={() => {
                  setShowModal(false);
                  !screenSharing && startScreenCapture();

                  isConnected
                    ? navigation.navigate('StethoScopeMeasurement', {
                        testName: lungSoundTest.TestName,
                        appointmentTestId: lungSoundTest.AppointmentTestId,
                      })
                    : navigation.navigate('StethoScopeInitilization', {
                        testName: lungSoundTest.TestName,
                        appointmentTestId: lungSoundTest.AppointmentTestId,
                      });
                }}
                activeOpacity={0.7}
                className={`flex items-center justify-center p-2 mx-1 mb-2 rounded-md border border-gray-200`}>
                <Image
                  className="w-6 h-6"
                  source={require('../assets/icons/lung_wave.png')}
                  alt={lungSoundTest.TestName}
                />
                <CustomTextRegular className="mt-4 text-[10px] text-center text-text">
                  {lungSoundTest.TestName}
                </CustomTextRegular>
              </TouchableOpacity>
            )}
        </View>
      </View>
    </>
  );
}
