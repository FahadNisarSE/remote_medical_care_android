import React from 'react';
import { Image, View } from 'react-native';
import CustomTextRegular from './CustomTextRegular';

export default function NoRecommendedTests() {
  return (
    <View className="items-center justify-center flex-1">
      <Image
        className="w-40 h-40"
        resizeMode="contain"
        source={require('../../assets/images/no_data.png')}
        alt="No Appointment to show"
      />
      <CustomTextRegular className="mt-2 text-base text-center text-text">
        You have no tests!
      </CustomTextRegular>
    </View>
  );
}
