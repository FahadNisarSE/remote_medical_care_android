import React, {useEffect, useRef} from 'react';
import {Animated, Image, View} from 'react-native';

export default function Spinner({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const rotateAnimation = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    );

    rotateAnimation.start();

    return () => {
      rotateAnimation.stop();
    };
  }, [rotation]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={{transform: [{rotate: spin}]}}>
      <Image source={require('../../assets/icons/loader.png')} alt="loading" style={{width, height}} />
    </Animated.View>
  );
}
