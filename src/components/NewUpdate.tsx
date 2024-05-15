import {
  View,
  Text,
  Modal,
  Image,
  useWindowDimensions,
  Pressable,
} from 'react-native';
import React from 'react';
import CustomTextSemiBold from './ui/CustomTextSemiBold';
import CustomTextRegular from './ui/CustomTextRegular';
import {TouchableOpacity} from '@gorhom/bottom-sheet';

type NewUpdateProps = {
  showModal: boolean;
};

export default function NewUpdate({showModal}: NewUpdateProps) {
  return (
    <Modal visible={showModal}>
      <View className="flex items-center justify-center flex-1 px-8">
        <View
          className="items-center justify-center mt-auto bg-gray-200 rounded-full"
          style={{
            width: useWindowDimensions().width * 0.8,
            height: useWindowDimensions().width * 0.8,
          }}>
          <Image
            source={require('../assets/images/update_available.png')}
            alt="New Update Available"
            style={{
              objectFit: 'contain',
              width: useWindowDimensions().width * 0.7,
              height: useWindowDimensions().width * 0.7,
            }}
          />
        </View>

        <View className="my-6">
          <CustomTextSemiBold className="text-lg text-center text-Xl text-text">
            Update Required
          </CustomTextSemiBold>
          <CustomTextRegular className="mt-4 text-center text-gray-500">
            Please update app for improved experience. This version is no longer
            supported.
          </CustomTextRegular>
        </View>

        <Pressable
          onPress={() => {}}
          className="w-full px-5 py-4 mt-auto mb-8 rounded bg-primmary">
          <CustomTextSemiBold className="mx-auto text-white">
            Upgrade Now
          </CustomTextSemiBold>
        </Pressable>
      </View>
    </Modal>
  );
}
