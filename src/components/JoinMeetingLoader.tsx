import {View, Text, ActivityIndicator} from 'react-native';
import React from 'react';
import CustomTextRegular from './ui/CustomTextRegular';
import CustomTextSemiBold from './ui/CustomTextSemiBold';

export default function JoinMeetingLoader({
  dimensions,
}: {
  dimensions: {height: number; width: number};
}) {
  return (
    <View
      className="absolute top-0 bottom-0 left-0 right-0 items-center justify-center flex-1"
      style={{height: dimensions.height}}>
      <ActivityIndicator size={'large'} color="#46B98D" />
      <CustomTextSemiBold className="mt-2 text-xl text-text">
        Please wait!
      </CustomTextSemiBold>
      <CustomTextRegular className="mt-1 text-center text-text">
        Trying to join...
      </CustomTextRegular>
    </View>
  );
}
