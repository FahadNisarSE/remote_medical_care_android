import React from 'react';
import {View, Image} from 'react-native';

const BatteryIndicator = ({percentage}: {percentage: number}) => {
  let batteryImage;

  // Determine which image to display based on the percentage
  if (percentage >= 75) {
    batteryImage = require('../assets/icons/battery-full.png');
  } else if (percentage >= 25) {
    batteryImage = require('../assets/icons/battery-medium.png');
  } else {
    batteryImage = require('../assets/icons/battery-warning.png');
  }

  return (
    <View className="flex items-center justify-center">
      <Image source={batteryImage} className="w-6" />
    </View>
  );
};

export default BatteryIndicator;
