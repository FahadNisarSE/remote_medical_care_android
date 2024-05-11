import {View, Text, StyleSheet} from 'react-native';
import React, {useEffect, useState} from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Toast from 'react-native-toast-message';

interface ResultIndicatorBarProps {
  value: number;
  lowestLimit: number;
  highestLimit: number;
  lowThreshold: number;
  highThreshold: number;
}

export default function ResultIdicatorBar({
  value,
  lowestLimit,
  highThreshold,
  lowThreshold,
  highestLimit,
}: ResultIndicatorBarProps) {
  const width = useSharedValue(0);
  const [invalidTemperatureValue, setinvalidTemperatureValue] = useState(false);

  useEffect(() => {
    if (value < lowestLimit || value > highestLimit) {
      setinvalidTemperatureValue(true);

      return;
    }
    setinvalidTemperatureValue(false);
    let percentage;
    if (value === 0) percentage = 0;
    else
      percentage = ((value - lowestLimit) / (highestLimit - lowestLimit)) * 100;
    if (percentage < 10) percentage = 10;
    width.value = withTiming(percentage, {duration: 1000});
  }, [value]);

  let color = '#ff4e44';
  if (value >= lowThreshold && value <= highThreshold) {
    color = '#09d261';
  } else if (value >= lowestLimit && value < lowThreshold) {
    color = '#ffd279';
  }

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
    backgroundColor: color,
  }));

  return invalidTemperatureValue ? (
    <View style={styles.container} className="bg-gray-200">
      <Animated.View style={[styles.bar]} />
    </View>
  ) : (
    <View style={styles.container} className="bg-gray-200">
      <Animated.View style={[styles.bar, barStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 8,
    borderRadius: 10,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 10,
  },
});
