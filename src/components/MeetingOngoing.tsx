import React from 'react';
import {Pressable} from 'react-native';
import {useMeetingOngoingStore} from '../utils/store/useMeetingOgoingStore';
import CustomTextSemiBold from './ui/CustomTextSemiBold';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {HomeStackNavigatorParamList} from '../utils/AppNavigation';
import {formatTime} from './MeetingTimer';

export default function MeetingOngoing() {
  const {remaingingTime, isOngoingMeeting} = useMeetingOngoingStore();
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackNavigatorParamList>>();

  if (isOngoingMeeting)
    return (
      <Pressable
        onPress={() => navigation.navigate('LiveMeeting')}
        className="absolute top-0 left-0 right-0 z-30 flex-row items-center p-4 text-center bg-secondary">
        <CustomTextSemiBold className='text-white'>Meeting is in progress...</CustomTextSemiBold>
        <CustomTextSemiBold className="ml-auto text-white">
          {formatTime(remaingingTime)}
        </CustomTextSemiBold>
      </Pressable>
    );
  else return <></>;
}
