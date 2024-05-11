import {Image, TouchableOpacity, View} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {HomeStackNavigatorParamList} from '../utils/AppNavigation';
import CustomTextSemiBold from './ui/CustomTextSemiBold';

export default function Instruction() {
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackNavigatorParamList>>();
  return (
    <View className="flex-1 mt-2">
      <View className="flex-row items-center px-2 py-3 mt-2 bg-white rounded-lg">
        <Image
          className="mr-4 rounded-lg w-14 h-14"
          source={require('../assets/images/stethoscope.jpg')}
        />
        <CustomTextSemiBold className="text-text">
          Electronic Stehtoscope
        </CustomTextSemiBold>
        <TouchableOpacity
          onPress={() => navigation.navigate('StethoScopeDemo')}
          activeOpacity={0.8}
          className="flex items-center justify-center p-2 my-auto ml-auto rounded-lg bg-primmary">
          <Image
            source={require('../assets/icons/play.png')}
            className='w-5 h-5'
            alt="start demo"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
