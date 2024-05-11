import React, {useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  TouchableOpacity,
  View,
} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {FlatList} from 'react-native-gesture-handler';
import CustomTextRegular from '../components/ui/CustomTextRegular';
import CustomTextSemiBold from '../components/ui/CustomTextSemiBold';
import {
  SmarthoInstruction,
  TSmarthoInstuction,
} from '../constant/SmarthoInstrunction';
import {HomeStackNavigatorParamList} from '../utils/AppNavigation';
import MeetingOngoing from '../components/MeetingOngoing';
import {DrawerToggleButton} from '@react-navigation/drawer';
import Carousel from 'react-native-reanimated-carousel';
import AppUpdating from '../components/AppUpdating';

const {width, height} = Dimensions.get('window');

export default function StethoScopeInstruction() {
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackNavigatorParamList>>();
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <>
      <AppUpdating />
      <MeetingOngoing />
      <View className="flex-1 mt-2">
        <View className="flex-row items-center p-4 mb-2">
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Image
              source={require('../assets/icons/chevron-left.png')}
              alt="Go back"
              className="w-5 h-5"
            />
          </TouchableOpacity>
          <CustomTextSemiBold className="mx-auto text-lg text-text">
            StehtoScope Instructions
          </CustomTextSemiBold>
          <DrawerToggleButton />
        </View>
        <Carousel
          width={width}
          loop={false}
          height={height * 0.9}
          pagingEnabled={true}
          data={SmarthoInstruction}
          scrollAnimationDuration={250}
          mode="parallax"
          onSnapToItem={index => setActiveIndex(index)}
          renderItem={({index}) => (
            <SingleInstrunction {...SmarthoInstruction[index]} />
          )}
        />
        <Pagination
          length={SmarthoInstruction.length}
          currentIndex={activeIndex}
        />
      </View>
    </>
  );
}

function SingleInstrunction({
  description,
  image,
  title,
}: TSmarthoInstuction[0]) {
  return (
    <View className="flex items-center justify-center flex-1 w-full">
      <Image
        source={image}
        alt={title}
        style={{
          objectFit: 'scale-down',
          width: width * 0.7,
          height: height * 0.8,
        }}
      />
      <View style={{width}} className="my-8">
        <CustomTextSemiBold
          style={{maxWidth: width * 0.8}}
          className="mx-auto text-lg text-center text-primmary">
          {title}
        </CustomTextSemiBold>
        <CustomTextRegular
          style={{maxWidth: width * 0.8}}
          className="mx-auto mt-4 text-center text-text">
          {description}
        </CustomTextRegular>
      </View>
    </View>
  );
}

function Pagination({
  length,
  currentIndex,
}: {
  length: number;
  currentIndex: number;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 8,
        width: '100%',
      }}>
      {Array.from({length}).map((_, index) => {
        const isActive = index === currentIndex;
        const backgroundColor = isActive ? '#374151' : '#d1d5db';
        const dotWidth = isActive ? 20 : 8;

        return (
          <View
            key={index}
            style={{
              width: dotWidth,
              height: 8,
              marginHorizontal: 4,
              borderRadius: 4,
              backgroundColor,
            }}
          />
        );
      })}
    </View>
  );
}
