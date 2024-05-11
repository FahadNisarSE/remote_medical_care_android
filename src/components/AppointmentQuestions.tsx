import { TouchableOpacity } from '@gorhom/bottom-sheet';
import React from 'react';
import { Image, ScrollView, View } from 'react-native';
import Animated, {
  measure,
  runOnUI,
  useAnimatedRef,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { AppointmentAnswer } from '../api/schema/Appointment';
import { BASE_IMG_URL } from '../utils/config';
import { useAppointmentDetailStore } from '../utils/store/useAppointmentDetailStore';
import CustomTextRegular from './ui/CustomTextRegular';

export default function AppointmentQuestions() {
  const {appointmentDetail} = useAppointmentDetailStore()


  if (!appointmentDetail || appointmentDetail?.questions.length === 0)
    return (
      <View className="items-center justify-center flex-1">
        <Image
          className="w-40 h-40"
          resizeMode="contain"
          source={require('../assets/images/no_data.png')}
          alt="No Appointment to show"
        />
        <CustomTextRegular className="mt-2 text-base text-center text-text">
          Nothing to show!
        </CustomTextRegular>
      </View>
    );

  return (
    <View className="flex-1 px-4">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {appointmentDetail.questions.map((item, index) => (
          <QuestionCard {...item} key={item.AppointmentId + index} />
        ))}
      </ScrollView>
    </View>
  );
}

function QuestionCard({
  Answer,
  AnswerImage,
  AppointmentAnswerId,
  AppointmentId,
  Question,
  QuestionImage,
}: AppointmentAnswer) {
  const listRef = useAnimatedRef<Animated.View>();
  const heightValue = useSharedValue(0);
  const open = useSharedValue(false);
  const progress = useDerivedValue(() =>
    open.value ? withTiming(1) : withTiming(0),
  );
  const heightAnimationStyle = useAnimatedStyle(() => ({
    height: heightValue.value,
  }));

  const iconsStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${progress.value * 90}deg`,
      },
    ],
  }));

  return (
    <View className="px-2 py-3 mb-2 bg-white rounded-lg">
      <TouchableOpacity
        onPress={() => {
          if (heightValue.value === 0) {
            runOnUI(() => {
              'worklet';
              heightValue.value = withTiming(measure(listRef)!.height);
            })();
          } else {
            heightValue.value = withTiming(0);
          }
          open.value = !open.value;
        }}
        activeOpacity={0.7}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <View className="w-11/12">
          <CustomTextRegular className="text-sm text-text">
            {Question}
          </CustomTextRegular>
        </View>
        <Animated.View style={iconsStyle} className="ml-auto">
          <Image
            source={require('../assets/icons/chevron-right.png')}
            className="w-5 h-5"
            alt="Show Detail"
          />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View style={heightAnimationStyle} className="overflow-hidden">
        <Animated.View ref={listRef} className="absolute top-0 w-full">
          <View className="flex-row items-center p-2 mt-2 bg-gray-100 border-l-4 border-gray-500 rounded">
            <CustomTextRegular className="flex-1 text-text">
              {Answer}
            </CustomTextRegular>
            {AnswerImage && (
              <Image
                source={{uri: BASE_IMG_URL + AnswerImage}}
                className="w-1/4 rounded"
                resizeMode="cover"
                style={{aspectRatio: 1}}
                alt="Answer Image"
              />
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}
