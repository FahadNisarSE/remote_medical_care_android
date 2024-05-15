import NetInfo from '@react-native-community/netinfo';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import React, {useCallback, useEffect, useState} from 'react';
import {Alert, NativeEventEmitter, NativeModules, Platform} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import PushNotification from 'react-native-push-notification';
import SplashScreen from 'react-native-splash-screen';
import Toast from 'react-native-toast-message';
import SpInAppUpdates, {
  IAUUpdateKind,
  StartUpdateOptions,
} from 'sp-react-native-in-app-updates';

import {StethoScopeProvider} from './src/nativemodules/SmarthoStethoScope/useStethoScope';
import AppNavigation from './src/utils/AppNavigation';
import {hideMeetingNotification} from './src/utils/pushNotification';
import {useMinttiVisionStore} from './src/utils/store/useMinttiVisionStore';
import DeviceInfo from 'react-native-device-info';
import NewUpdate from './src/components/NewUpdate';

const inAppUpdates = new SpInAppUpdates(true);

export const queryClient = new QueryClient();

async function getCarrier() {
  const name = await DeviceInfo.getCarrier();
  const value = await NetInfo.fetch();

  console.log('Net info: ', value);

  console.log('Carrier Info: ', name);
}

export default function App() {
  const [connected, setConnected] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const {
    setIsConnected: setMinttiConnected,
    setIsConnecting: setMinttiConnecting,
  } = useMinttiVisionStore();

  const createNotificationChannels = useCallback(() => {
    PushNotification.createChannel(
      {
        channelId: 'meeting-channel',
        channelName: 'meeting_channel',
      },
      result => {},
    );
  }, []);

  useEffect(() => {
    const minttiEventEmitter = new NativeEventEmitter(
      NativeModules.VisionModule,
    );

    minttiEventEmitter.addListener('onDisconnected', event => {
      setMinttiConnected(false);
      setMinttiConnecting(false);
      console.log('This part ran.....');
      Toast.show({
        type: 'error',
        text1: 'Mitti Vision has been diconnected..',
      });
    });

    createNotificationChannels();
    if (Platform.OS === 'android') SplashScreen.hide();
    getCarrier();

    checkUpdates();
    hideMeetingNotification();
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) setConnected(state.isConnected);
      if (!state.isConnected) {
        showAlert();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const checkUpdates = useCallback(async () => {
    try {
      const result = await inAppUpdates.checkNeedsUpdate();
      if (result.shouldUpdate) {
        setShowModal(true);
      }
    } catch (error) {
      console.log('In app update: ', error);
    }
  }, []);

  const showAlert = () => {
    Alert.alert(
      'Internet Connection',
      'You are offline. Some features may not be available.',
    );
  };

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <QueryClientProvider client={queryClient}>
        <StethoScopeProvider>
          <AppNavigation />
        </StethoScopeProvider>
      </QueryClientProvider>
      <NewUpdate showModal={false} />
      <Toast />
    </GestureHandlerRootView>
  );
}
