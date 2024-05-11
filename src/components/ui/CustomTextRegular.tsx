// CustomText.tsx

import React, {ReactNode} from 'react';
import {Text as RNText, StyleSheet, TextStyle} from 'react-native';

interface CustomTextProps {
  style?: TextStyle;
  children: ReactNode;
  className?: string;
}

const CustomTextRegular: React.FC<CustomTextProps> = props => {
  return (
    <RNText
      allowFontScaling={false}
      style={[styles.text, props.style]}
      className={props.className}>
      {props.children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: 'Inter-Regular',
  },
});

export default CustomTextRegular;
