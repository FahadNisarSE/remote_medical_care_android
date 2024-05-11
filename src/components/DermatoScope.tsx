import React from 'react';
import {Image, Pressable, View} from 'react-native';
import CustomTextRegular from './ui/CustomTextRegular';
import CustomTextSemiBold from './ui/CustomTextSemiBold';

interface DermatoScopeProps {
  isFrontCameraActive: boolean;
  switchCamera: () => void;
  setShowModal: (value: React.SetStateAction<boolean>) => void;
  setDermatoScopeEnabled: (value: React.SetStateAction<boolean>) => void;
}

export default function DermatoScope({
  switchCamera,
  isFrontCameraActive,
  setShowModal,
  setDermatoScopeEnabled,
}: DermatoScopeProps) {
  return (
    <View className="flex-1 w-full">
      <View className="flex-row items-center justify-center m6-4">
        <Image
          source={require('../assets/icons/dermatology_lens.png')}
          alt="Dermatology lens"
          className="w-8 h-8"
        />
        <CustomTextSemiBold className="ml-2 text-xl text-text">
          DermatoScope
        </CustomTextSemiBold>
      </View>
      <CustomTextRegular
        className="my-auto mx-4 text-[14px] text-text text-center"
        style={{lineHeight: 20}}>
        To use the dermatoscope, first, attach the dermatoscope lens to your
        mobile phone's rear (primary) camera. Then, connect the dermatoscope's
        USB cable to your mobile phone. You are all set to use dermatoscope,
        press below button to get started.
      </CustomTextRegular>
      <Pressable
        onPress={() => {
          setDermatoScopeEnabled(true);
          isFrontCameraActive ? switchCamera() : () => {};
          setShowModal(false);
        }}
        className="flex-row items-center p-1.5 mt-4 rounded-full bg-primmary">
        <View
          style={{backgroundColor: 'rgb(26 49 54)'}}
          className="p-2.5 rounded-full">
          <Image
            className="w-6 h-6"
            source={require('../assets/icons/switch_to_back.png')}
            alt="Bluetooth image"
          />
        </View>
        <CustomTextSemiBold className="mx-auto text-xl text-white">
          Start Lens
        </CustomTextSemiBold>
      </Pressable>
    </View>
  );
}
