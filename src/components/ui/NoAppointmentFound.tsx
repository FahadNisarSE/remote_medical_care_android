import {View, Text, Image} from 'react-native';
import React from 'react';
import CustomTextRegular from './CustomTextRegular';
import Button from './Button';

export default function NoAppointmentFound({callback}: {callback: () => void}) {
  return (
    <View className="items-center justify-center flex-1">
      <Image
        className="w-40 h-40"
        resizeMode="contain"
        source={require('../../assets/images/no_data.png')}
        alt="No Appointment to show"
      />
      <CustomTextRegular className="mt-2 text-base text-center text-text">
        You have no appointments!
      </CustomTextRegular>
      <Button
        text="Try Again"
        onPress={() => callback()}
        className="w-1/2 mt-4"
      />
    </View>
  );
}
