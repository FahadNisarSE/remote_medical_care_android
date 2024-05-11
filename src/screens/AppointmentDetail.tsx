import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  TouchableOpacity,
  View,
} from 'react-native';
import useGetAppointmentDetails from '../api/query/useGetAppointmentDetails';
import {AppointmentAnswer, AppointmentTest} from '../api/schema/Appointment';
import {HomeStackNavigatorParamList} from '../utils/AppNavigation';
import {BASE_IMG_URL} from '../utils/config';
import {useAppointmentDetailStore} from '../utils/store/useAppointmentDetailStore';
import {useMeetingOngoingStore} from '../utils/store/useMeetingOgoingStore';
import AppointmentQuestions from '../components/AppointmentQuestions';
import CustomSafeArea from '../components/CustomSafeArea';
import MeetingOngoing from '../components/MeetingOngoing';
import RecommendedTestsList from '../components/RecommendedTestsList';
import CustomTextRegular from '../components/ui/CustomTextRegular';
import CustomTextSemiBold from '../components/ui/CustomTextSemiBold';
import Error from '../components/ui/Error';
import Loader from '../components/ui/Loader';
import {DrawerToggleButton} from '@react-navigation/drawer';
import AppUpdating from '../components/AppUpdating';

export type AppointmentDetailTab = {
  'Recom. tests': {appointmentTests: AppointmentTest[]};
  'App. Questions': {appointmentQuestions: AppointmentAnswer[]};
};

const Tab = createMaterialTopTabNavigator<AppointmentDetailTab>();

type AppointmentDetailProps = NativeStackScreenProps<
  HomeStackNavigatorParamList,
  'AppointmentDetail'
>;

const {width} = Dimensions.get('window');

export default function AppointmentDetail({
  navigation,
  route,
}: AppointmentDetailProps) {
  const appointmentId = route.params.id;
  const {setAppointmentDetail} = useAppointmentDetailStore();
  const {isLoading, isError, data, refetch} =
    useGetAppointmentDetails(appointmentId);
  const {setAppointmentId} = useMeetingOngoingStore();
  const [showAllSpecialTreatment, setShowAllSpecialTreatment] = useState(false);

  useEffect(() => {
    if (data) setAppointmentDetail(data);
  }, [data]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      refetch();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [refetch]);

  if (isLoading) return <Loader size={50} />;

  if (isError) return <Error />;

  return (
    <>
      <AppUpdating />
      <MeetingOngoing />
      <CustomSafeArea stylesClass="flex-1">
        <View className="flex-row items-center p-4">
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Image
              source={require('../assets/icons/chevron-left.png')}
              alt="Go back"
              className="w-5 h-5"
            />
          </TouchableOpacity>
          <CustomTextSemiBold className="mx-auto text-xl text-text">
            Appointment Details
          </CustomTextSemiBold>
          <DrawerToggleButton />
        </View>
        <View className="p-5 px-5 mx-4 overflow-hidden bg-white rounded-xl">
          {/* Doctor Information: 1st row */}
          <View className="flex-row items-start">
            <Image
              className="rounded-2xl"
              style={{width: width * 0.2, height: width * 0.2}}
              source={{uri: BASE_IMG_URL + data?.doctor.ProfileImg}}
              alt={`${data?.doctor.Firstname} ${data?.doctor.Lastname}`}
            />
            <View className="flex-1 ml-3">
              <CustomTextSemiBold className="text-lg text-text">
                {`${data?.doctor.Firstname} ${data?.doctor.Lastname}`}
              </CustomTextSemiBold>
              <Pressable
                disabled={data?.doctor?.SpecialTreatment?.length! <= 60}
                onPress={() => setShowAllSpecialTreatment(prev => !prev)}>
                <CustomTextRegular className="max-w-full mt-1 text-xs capitalize text-text">
                  {data?.doctor?.SpecialTreatment && (
                    <>
                      {data?.doctor.SpecialTreatment.length > 60 &&
                      !showAllSpecialTreatment
                        ? `${data?.doctor.SpecialTreatment.slice(0, 60)}...more`
                        : data?.doctor.SpecialTreatment}
                    </>
                  )}
                </CustomTextRegular>
              </Pressable>
            </View>
          </View>

          {/* Appointment Details */}
          <View className="mt-4">
            <View className="flex-row items-start">
              <CustomTextSemiBold className="text-sm text-text">
                Symptoms:
              </CustomTextSemiBold>
              <CustomTextRegular
                className="mt-1 ml-2 text-xs text-text w-fit"
                style={{maxWidth: width * 0.6}}>
                {data?.Symptoms}
              </CustomTextRegular>
            </View>

            <View className="flex-row items-start mt-1">
              <CustomTextSemiBold className="text-sm text-text">
                Datetime:
              </CustomTextSemiBold>
              <CustomTextRegular
                className="mt-1 ml-2 text-xs text-text w-fit"
                style={{maxWidth: width * 0.6}}>
                {data?.AppointmentDate} | {data?.AppointmentStartTime} -{' '}
                {data?.AppointmentEndTime}
              </CustomTextRegular>
            </View>
          </View>

          {/* Join Now Button */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              setAppointmentId(data?.AppointmentId!);
              navigation.navigate('LiveMeeting');
            }}
            className="flex-row items-center p-1.5 rounded-lg px-4 py-2 mt-5 bg-primmary">
            <CustomTextSemiBold
              className="mx-auto text-white"
              style={{fontSize: 14}}>
              Join Now
            </CustomTextSemiBold>
          </TouchableOpacity>
        </View>
        <AppointmentDetailTabs />
      </CustomSafeArea>
    </>
  );
}

const AppointmentDetailTabs = () => {
  return (
    <View className="flex-1 w-full h-full pb-2">
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            position: 'relative',
            backgroundColor: '#ffffff',
            borderRadius: 10,
            marginHorizontal: 16,
            marginVertical: 10,
            overflow: 'hidden',
            shadowColor: 'rgba(0, 0, 0, 0)',
          },
          tabBarIndicatorStyle: {backgroundColor: '#46b98d'},
          tabBarLabelStyle: {
            fontSize: 14,
            color: '#02200a',
            textTransform: 'capitalize',
            fontFamily: 'Inter-SemiBold',
          },
          tabBarAndroidRipple: {borderless: false},
          tabBarPressColor: 'rgba(0, 0, 0, 0.1)',
        }}>
        <Tab.Screen name="Recom. tests" component={RecommendedTestsList} />
        <Tab.Screen name="App. Questions" component={AppointmentQuestions} />
      </Tab.Navigator>
    </View>
  );
};
