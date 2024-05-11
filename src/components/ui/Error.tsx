import {View, Text, Image} from 'react-native';
import React from 'react';
import CustomTextRegular from './CustomTextRegular';
import Button from './Button';

export default function Error({callback}: {callback?: () => void}) {
  return (
    <View className="items-center justify-center flex-1">
      <Image
        source={require('../../assets/images/error.png')}
        className="w-40 h-40"
        resizeMode="contain"
        alt="Something went wrong."
      />
      <CustomTextRegular className="mt-2 text-base text-center text-text">
        Oops! Something went wrong.
      </CustomTextRegular>
      {callback && (
        <Button
          text="Try Again"
          onPress={() => callback()}
          className="w-1/2 mt-4"
        />
      )}
    </View>
  );
}
