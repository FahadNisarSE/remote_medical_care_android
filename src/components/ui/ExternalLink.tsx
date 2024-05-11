import React from 'react';
import {
  GestureResponderEvent,
  Linking,
  StyleProp,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
import globalStyles from '../../styles/style';

interface ExternalLinkProps {
  url: string;
  buttonText: string;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  className?: string;
  onPress?: (event: GestureResponderEvent) => void;
}

const ExternalLink: React.FC<ExternalLinkProps> = ({
  url,
  buttonText,
  textStyle,
  onPress,
  ...props
}) => {
  const handlePress = async () => {
    if (!url) return;
    const supported = true;

    if (supported) {
      await Linking.openURL(url);
    } else {
      console.error(`Don't know how to open this URL: ${url}`);
    }
  };

  return (
    <Text
      onPress={onPress ? onPress : handlePress}
      className={`underline text-primmary ${props.className}`}
      style={[globalStyles.fontRegular, textStyle]}>
      {buttonText}
    </Text>
  );
};

export default ExternalLink;
