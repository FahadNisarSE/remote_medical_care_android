import {DrawerToggleButton} from '@react-navigation/drawer';
import {useNavigation} from '@react-navigation/native';
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import React from 'react';
import {FlatList, Image, TouchableOpacity, View} from 'react-native';
import useGetAppointmentHistory from '../api/query/useGetAppointmentHistory';
import {Appointment} from '../api/schema/Appointment';
import CustomSafeArea from '../components/CustomSafeArea';
import MeetingOngoing from '../components/MeetingOngoing';
import CustomTextRegular from '../components/ui/CustomTextRegular';
import CustomTextSemiBold from '../components/ui/CustomTextSemiBold';
import Error from '../components/ui/Error';
import Loader from '../components/ui/Loader';
import NoAppointmentFound from '../components/ui/NoAppointmentFound';
import {HomeStackNavigatorParamList} from '../utils/AppNavigation';
import {BASE_IMG_URL} from '../utils/config';
import {useToggleStore} from '../utils/store/useToggleClinicStore';

type AppointmentHistoryProps = NativeStackScreenProps<
  HomeStackNavigatorParamList,
  'History'
>;

export default function AppointmentHistory({
  navigation,
}: AppointmentHistoryProps) {
  const {setShowModal, clinicId} = useToggleStore();
  const {isLoading, isError, data, refetch} =
    useGetAppointmentHistory(clinicId);

  return (
    <>
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
            Appointment History
          </CustomTextSemiBold>
          <DrawerToggleButton />
        </View>
        <View className="flex-row mx-5">
          <TouchableOpacity
            activeOpacity={0.7}
            className="p-2 px-3 my-2 ml-auto text-sm rounded-md w-fit bg-primmary"
            onPress={() => setShowModal(true)}>
            <CustomTextRegular className="text-xs text-white">
              Change Clinic
            </CustomTextRegular>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <Loader size={50} />
        ) : data?.length === 0 ? (
          <NoAppointmentFound callback={refetch} />
        ) : isError ? (
          <Error callback={refetch} />
        ) : (
          <FlatList
            className="mx-5"
            showsVerticalScrollIndicator={false}
            data={data}
            keyExtractor={item => item.AppointmentId}
            renderItem={({item}) => <AppointmentListCard {...item} />}
          />
        )}
      </CustomSafeArea>
    </>
  );
}

function AppointmentListCard(item: Appointment) {
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackNavigatorParamList>>();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate('AppointmentDetail', {id: item.AppointmentId})
      }
      className="px-2 py-3 mt-2 bg-white rounded-lg">
      <View className="flex-row items-center">
        <Image
          className="w-16 h-full rounded-2xl bg-slate-400"
          source={{uri: BASE_IMG_URL + item.ProfileImg}}
          alt={item.Firstname}
        />
        <View className="ml-2">
          <View className="">
            <CustomTextSemiBold className="mb-1 text-text">
              {item.Firstname} {item.Lastname}
            </CustomTextSemiBold>
            <CustomTextRegular className="text-xs text-text">
              {item?.Symptoms
                ? item.Symptoms.length > 18
                  ? `${item.Symptoms.substring(0, 18)}...`
                  : item.Symptoms
                : ''}
            </CustomTextRegular>
          </View>
          <View className="flex-row items-end mt-2">
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('AppointmentDetail', {
                  id: item.AppointmentId,
                })
              }
              activeOpacity={0.8}
              className="flex items-center justify-center p-2 my-auto ml-2 bg-transparent rounded bg-secondary">
              <CustomTextSemiBold className="text-xs text-white">
                View Details
              </CustomTextSemiBold>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View className="flex-row items-center justify-between mt-2 border-t-[1px] border-gray-200">
        <CustomTextSemiBold className="px-2 py-1 text-[10px] text-gray-600 rounded">
          {item.AppointmentStatus}
        </CustomTextSemiBold>
        <CustomTextSemiBold className="px-2 py-1 text-[10px] text-gray-600 rounded">
          {item.AppointmentDate} | {item.AppointmentStartTime} -{' '}
          {item.AppointmentEndTime}
        </CustomTextSemiBold>
      </View>
    </TouchableOpacity>
  );
}