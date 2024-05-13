import {ActivityIndicator, Image, View} from 'react-native';
import Button from './ui/Button';
import CustomTextRegular from './ui/CustomTextRegular';

export default function BloodGlucoseIntructionMap(
  event_name: string,
  callback: any,
) {
  switch (event_name) {
    case 'bgEventWaitPagerInsert':
      return (
        <>
          <View className="flex-row items-center justify-between w-full mb-auto">
            <CustomTextRegular className="mx-auto text-lg font-semibold text-text">
              Blood Glucose Measurement
            </CustomTextRegular>
          </View>
          <View className="flex-1 mt-4">
            <Image
              className="w-4/6 mx-auto"
              style={{objectFit: 'contain'}}
              source={require('../assets/images/sugar_strips.png')}
              alt="sugar strips"
            />
            <View className="mt-auto mb-4">
              <CustomTextRegular className="text-center text-text">
                Please insert the blood glucose test strip into the blood
                glucose test port of the device.
              </CustomTextRegular>
            </View>
            <Button text="Cancel" onPress={callback} />
          </View>
        </>
      );
    case 'bgEventPaperUsed':
    case 'bgEventWaitDripBlood':
      return (
        <>
          <View className="flex-row items-center justify-between w-full mb-auto">
            <CustomTextRegular className="mx-auto text-lg font-semibold text-text">
              Blood Glucose Measurement
            </CustomTextRegular>
          </View>
          <View className="flex-1 mt-4">
            <Image
              className="w-1/2 mx-auto"
              style={{objectFit: 'contain'}}
              source={require('../assets/images/sugar_strip_2.png')}
              alt="sugar strips"
            />
            <View className="mt-auto mb-4">
              <CustomTextRegular className="text-center text-text">
                Wait for blood sample, please contact blood glucose test strip
                with blood.
              </CustomTextRegular>
            </View>
            <Button text="Cancel" onPress={callback} />
          </View>
        </>
      );
    case 'bgEventBloodSampleDetecting':
      return (
        <>
          <View className="flex-row items-center justify-between w-full mb-auto">
            <CustomTextRegular className="mx-auto text-lg font-semibold text-text">
              Blood Glucose Measurement
            </CustomTextRegular>
          </View>
          <View className="flex-1 mt-4">
            <View className="items-center justify-center flex-1">
              <ActivityIndicator color="#46b98d" size={50} />
            </View>

            <View className="mt-auto mb-4">
              <CustomTextRegular className="text-center text-text">
                A blood sample has been collected, please wait
              </CustomTextRegular>
            </View>
            <Button text="Measuring" onPress={() => {}} />
          </View>
        </>
      );
    case 'bgEventGetBgResultTimeout':
    case 'bgEventCalibrationFailed':
      return (
        <>
          <View className="flex-row items-center justify-between w-full mb-auto">
            <CustomTextRegular className="mx-auto text-lg font-semibold text-text">
              Blood Glucose Measurement
            </CustomTextRegular>
          </View>
          <View className="flex-1 mt-4">
            <Image
              className="w-1/2 mx-auto"
              style={{objectFit: 'contain'}}
              source={require('../assets/images/sugar_strip_2.png')}
              alt="sugar strips"
            />
            <View className="mt-auto mb-4">
              <CustomTextRegular className="text-center text-text">
                Sorry! But it seems that someting went wrong. Please restart the
                test again.
              </CustomTextRegular>
            </View>
            <Button text="Restart" onPress={callback} />
          </View>
        </>
      );
    default:
      return (
        <>
          <View className="flex-row items-center justify-between w-full mb-auto">
            <CustomTextRegular className="mx-auto text-lg font-semibold text-text">
              Blood Glucose Measurement
            </CustomTextRegular>
          </View>
          <View className="flex-1 mt-4">
            <View className="items-center justify-center flex-1">
              <Image
                className="w-1/2 h-40 m-auto"
                style={{objectFit: 'contain'}}
                source={require('../assets/images/error.png')}
                alt="Error Image"
              />
            </View>
            <View className="mt-auto mb-4">
              <CustomTextRegular className="text-center text-text">
                Sorry! But it seems that someting went wrong. Please restart the
                test again.
              </CustomTextRegular>
            </View>
            <Button text="Restart" onPress={callback} />
          </View>
        </>
      );
  }
}
