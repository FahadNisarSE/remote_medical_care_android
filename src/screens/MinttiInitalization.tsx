import {DrawerToggleButton} from '@react-navigation/drawer';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useContext, useEffect, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import AppUpdating from '../components/AppUpdating';
import CustomTextRegular from '../components/ui/CustomTextRegular';
import CustomTextSemiBold from '../components/ui/CustomTextSemiBold';
import Spinner from '../components/ui/Spinner';
import useMinttiVision from '../nativemodules/MinttiVision/useMinttiVision';
import {HomeStackNavigatorParamList} from '../utils/AppNavigation';
import useBluetoothPermissions from '../utils/hook/useBluetoothPermission';
import {useMinttiVisionStore} from '../utils/store/useMinttiVisionStore';
import {defaultValue} from '../nativemodules/SmarthoStethoScope/StethoScope.type';
import {StethoScopeContext} from '../nativemodules/SmarthoStethoScope/useStethoScope';

const dimension = Dimensions.get('window');

function buttonText(permission: boolean, isScanning: boolean) {
  if (!permission) return 'Request permission';
  if (isScanning) return 'Stop scanning';
  return 'Scan for devices';
}

type MinttiInitalizationProps = NativeStackScreenProps<
  HomeStackNavigatorParamList,
  'MinttiInitalization'
>;

export default function MinttiInitalization({
  navigation,
  route,
}: MinttiInitalizationProps) {
  const testRoute = route.params.testRoute;

  const [bluetoothPermissions, setBluetoothPermissions] = useState(false);
  const {requestPermissions} = useBluetoothPermissions();
  const {discoverDevices, connectToDevice, stopScan} = useMinttiVision({});
  const {bleDevices, isConnecting, isScanning, isConnected, setIsConnecting} =
    useMinttiVisionStore();
  const {disconnectStethoScope} =
    useContext(StethoScopeContext) || defaultValue;

  useEffect(() => {
    // @ts-ignore
    if (isConnected) navigation.navigate(testRoute);
    if (isConnected) setIsConnecting(false);
  }, [isConnected]);

  useEffect(() => {
    requestPermissions((result: boolean) => setBluetoothPermissions(result));
    setIsConnecting(false);
  }, []);

  const onPressHandler = () => {
    if (bluetoothPermissions) isScanning ? stopScan() : discoverDevices();
    else
      requestPermissions((result: boolean) => setBluetoothPermissions(result));
  };

  return (
    <>
      <AppUpdating />

      <View className="flex-1 px-5 bg-white">
        <View className="flex-row items-center py-5">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.goBack()}
            className="p-1">
            <Image
              source={require('../assets/icons/back_arrow.png')}
              alt="Go back"
            />
          </TouchableOpacity>
          <CustomTextRegular className="mx-auto text-xl text-text">
            Mintti Vision
          </CustomTextRegular>
          <DrawerToggleButton />
        </View>
        <Image
          className="mx-auto my-8"
          style={styles.deviceImage}
          source={require('../assets/images/vital_sign_monitor.jpg')}
          alt="Electronic Stethoscope"
        />
        {!bluetoothPermissions && (
          <View>
            <CustomTextRegular className="text-center text-text">
              If the button above doesn't function as expected, please navigate
              to your phone settings, then proceed to App Management, and grant
              the necessary permissions for location and Bluetooth.
            </CustomTextRegular>
          </View>
        )}
        <FlatList
          data={bleDevices}
          keyExtractor={item => item.mac}
          renderItem={({item}) =>
            item.name === 'Mintti-Vision' ? (
              <View className="flex-row flex-1 px-2 py-3 mt-2 rounded-lg bg-background">
                <View className="items-center justify-center p-2 mr-2 overflow-hidden rounded-full bg-primmary">
                  <Image
                    className="w-5 h-5"
                    source={require('../assets/icons/activity.png')}
                  />
                </View>
                <View className="flex-1">
                  <CustomTextSemiBold className="text-text">
                    {item.name}
                  </CustomTextSemiBold>
                  <CustomTextRegular className="text-text">
                    {item.mac}
                  </CustomTextRegular>
                </View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={isConnecting}
                  onPress={() => {
                    disconnectStethoScope();
                    connectToDevice(item);
                  }}
                  className="flex items-center justify-center p-2 my-auto rounded bg-primmary">
                  <CustomTextRegular className="text-xs text-white">
                    {isConnecting ? 'Connecting' : 'Connect'}
                  </CustomTextRegular>
                </TouchableOpacity>
              </View>
            ) : (
              <></>
            )
          }
        />
        <View className="p-4 my-5 mt-auto rounded-xl bg-primmary">
          <CustomTextSemiBold className="mb-2 text-xl text-center text-white">
            Pair Device
          </CustomTextSemiBold>
          <CustomTextRegular className="text-sm text-center text-background">
            Make sure your device is turned on and located within connection
            range. Make sure to turn on Bluetooth and location beforehand.
          </CustomTextRegular>
          <TouchableOpacity
            onPress={onPressHandler}
            style={styles.pairDeviceBtn}
            className="flex-row items-center p-1.5 mt-4 rounded-full">
            <View
              style={{backgroundColor: 'rgb(26 49 54)'}}
              className="p-2 rounded-full">
              {isScanning ? (
                <Spinner width={20} height={20} />
              ) : (
                <Image
                  className="w-5 h-5"
                  source={require('../assets/icons/bluetooth.png')}
                  alt="Bluetooth image"
                />
              )}
            </View>
            <CustomTextSemiBold className="mx-auto text-xl text-text">
              {buttonText(bluetoothPermissions, isScanning)}
            </CustomTextSemiBold>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  deviceImage: {
    height: dimension.height * 0.3,
    width: dimension.width * 0.9,
    objectFit: 'contain',
  },
  pairDeviceBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
});
