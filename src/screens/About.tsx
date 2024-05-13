import { DrawerToggleButton } from '@react-navigation/drawer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  Platform,
  TouchableOpacity,
  View
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import SpInAppUpdates, {
  AndroidInstallStatus,
  IAUUpdateKind,
  StartUpdateOptions,
} from 'sp-react-native-in-app-updates';

import Button from '../components/ui/Button';
import CustomTextRegular from '../components/ui/CustomTextRegular';
import CustomTextSemiBold from '../components/ui/CustomTextSemiBold';
import { HomeStackNavigatorParamList } from '../utils/AppNavigation';

const {width, height} = Dimensions.get('window');

type AboutProps = NativeStackScreenProps<HomeStackNavigatorParamList, 'About'>;

const inAppUpdates = new SpInAppUpdates(true);

import axios from 'axios';

const fetchRemoteFile = async (url: string) => {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
    });
    console.log('REsponse: ', response);
    return Buffer.from(response.data, 'binary').toString('base64');
  } catch (error) {
    console.error('Error fetching remote file:', error);
    return null;
  }
};

export default function About({navigation}: AboutProps) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<AndroidInstallStatus>(0);

  const checkForUpdates = async () => {
    try {
      const result = await inAppUpdates.checkNeedsUpdate();
      if (result.shouldUpdate) {
        setUpdateAvailable(true);
      } else {
        setUpdateAvailable(false);
      }
    } catch (error) {
      console.log('In app update: ', error);
    }
  };

  const handleUpdateApp = async () => {
    if (updateAvailable) {
      let updateOptions: StartUpdateOptions = {};
      if (Platform.OS === 'android') {
        updateOptions = {
          updateType: IAUUpdateKind.FLEXIBLE,
        };
      }
      await inAppUpdates.startUpdate(updateOptions);
      inAppUpdates.installUpdate();
    }
  };

  useEffect(() => {
    checkForUpdates();

    inAppUpdates.addStatusUpdateListener(param => {
      const {status} = param;
      setUpdateStatus(status);
    });

    return inAppUpdates.removeStatusUpdateListener(() => {});
  }, []);

  return (
    <>
      <View className="flex-row items-center p-4">
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Image
            source={require('../assets/icons/chevron-left.png')}
            alt="Go back"
            className="w-5 h-5"
          />
        </TouchableOpacity>
        <CustomTextSemiBold className="mx-auto text-xl text-text">
          About Us
        </CustomTextSemiBold>
        <DrawerToggleButton />
      </View>
      <View className="items-center justify-center flex-1">
        <Image
          source={require('../assets/images/icon.png')}
          alt="Remote Examination Care"
          style={{
            width: width * 0.7,
            height: width * 0.1,
            objectFit: 'contain',
          }}
        />
        <CustomTextRegular className="my-6 text-center text-text">
          Current Version: {DeviceInfo.getVersion()}
        </CustomTextRegular>
        <Button
          onPress={async () => {
            console.log('On Pres callled..');
          }}
          disabled={
            !updateAvailable || updateStatus === 3 || updateStatus === 2
          }
          text={
            updateStatus === 2 || updateStatus === 3
              ? `Update in progress..`
              : updateAvailable
              ? 'Click to update'
              : 'No Updates Available'
          }
          className="px-5"
        />
        <Button onPress={() => navigation.navigate('BloodOxygen')} text='Blood Oxygen'/>
      </View>
    </>
  );
}
