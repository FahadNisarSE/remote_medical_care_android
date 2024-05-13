import {Image, TouchableOpacity, View} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {HomeStackNavigatorParamList} from '../utils/AppNavigation';
import CustomTextSemiBold from './ui/CustomTextSemiBold';
import {FlatList} from 'react-native-gesture-handler';
import {
  BloodPressureInstruction,
  ECGInstructions,
  TemperatureInstruction,
  oxygernSaturationInstruction,
  SmarthoInstruction,
} from '../constant/Instructions';
import {useInstuctionsStore} from '../utils/store/useIntructionsStore';

const InstunctionList = [
  {
    image: require('../assets/icons/devices/temperature.png'),
    name: 'Body Temperature',
    list: TemperatureInstruction,
  },
  {
    image: require('../assets/icons/devices/blood_pressure.png'),
    name: 'Blood Pressure',
    list: BloodPressureInstruction,
  },
  {
    image: require('../assets/icons/devices/oxygen_level.png'),
    name: 'Oxygen Saturation',
    list: oxygernSaturationInstruction,
  },
  {
    image: require('../assets/icons/devices/blood_pressure.png'),
    name: 'ECG',
    list: ECGInstructions,
  },
  {
    image: require('../assets/icons/devices/stethoscope.png'),
    name: 'Stethoscope',
    list: SmarthoInstruction,
  },
];

export default function Instruction() {
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackNavigatorParamList>>();
  return (
    <View className="flex-1 mt-2">
      <FlatList
        data={InstunctionList}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item.name}
        renderItem={({item}) => (
          <View className="flex-row items-center px-2 py-3 mt-2 bg-white rounded-lg">
            <View className="p-2 mr-2 overflow-hidden rounded-xl bg-primmary">
              <Image
                source={item.image}
                alt={item.name}
                className="w-6 h-6"
                style={{objectFit: 'contain'}}
              />
            </View>
            <View className="flex-row items-center justify-center flex-1 px-2">
              <CustomTextSemiBold className="flex-1 text-text">
                {item.name}
              </CustomTextSemiBold>
            </View>
            <TouchableOpacity
              onPress={() => {
                useInstuctionsStore.setState({instructionList: item.list});
                navigation.navigate('Instructions', {testType: item.name});
              }}
              activeOpacity={0.8}
              className="flex items-center justify-center p-2 my-auto ml-auto rounded-lg bg-primmary">
              <Image
                source={require('../assets/icons/play.png')}
                className="w-5 h-5"
                alt="start demo"
              />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
