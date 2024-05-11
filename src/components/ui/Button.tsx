import {TouchableOpacity, TouchableOpacityProps, ViewStyle} from 'react-native';
import CustomTextSemiBold from './CustomTextSemiBold';
import Spinner from './Spinner';

interface ButtonProps extends TouchableOpacityProps {
  text: string;
  style?: ViewStyle;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({text, style, onPress, ...rest}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className={`bg-primmary ${rest.className}`}
      style={[
        {
          borderRadius: 8,
          padding: 10,
        },
        style,
      ]}
      {...rest}>
      <CustomTextSemiBold
        style={{
          fontSize: 16,
          fontWeight: '600',
          textAlign: 'center',
          color: 'white',
        }}>
        {text}
      </CustomTextSemiBold>
    </TouchableOpacity>
  );
};

export default Button;
