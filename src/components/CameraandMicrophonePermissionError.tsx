import React from 'react';
import { View } from 'react-native';
import CustomTextRegular from './ui/CustomTextRegular';
import CustomTextSemiBold from './ui/CustomTextSemiBold';

export default function CameraandMicrophonePermissionError({
  dimensions,
}: {
  dimensions: {height: number; width: number};
}) {
  return (
    <View
      className="absolute top-0 bottom-0 left-0 right-0 items-center justify-center flex-1 mx-10"
      style={{height: dimensions.height}}>
      <View className="p-4 py-8 bg-white shadow rounded-xl">
        <CustomTextSemiBold className="text-2xl text-center text-accent">
          Permission Error!
        </CustomTextSemiBold>
        <CustomTextRegular
          className="mt-3 text-center text-text"
          style={{lineHeight: 25}}>
          Please allow microphone and camera permission from your mobile
          settings {'>'} App Management {'>'} Permission , and then restart app
          for permissions to take affect.
        </CustomTextRegular>
      </View>
    </View>
  );
}
