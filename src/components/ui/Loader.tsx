import React from 'react'
import { ActivityIndicator, View } from 'react-native'
import CustomTextRegular from './CustomTextRegular'

export default function Loader({size}: {size: number}) {
  return (
    <View className="items-center justify-center flex-1">
    <ActivityIndicator color="#46b98d" size={size} />
    <CustomTextRegular className="mt-4 text-base text-center text-text">
      Loading! Please wait...
    </CustomTextRegular>
  </View>
  )
}