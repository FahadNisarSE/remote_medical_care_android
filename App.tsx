import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import React, {useEffect, useState} from 'react';
import {Alert, Platform} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import PushNotification from 'react-native-push-notification';
import SplashScreen from 'react-native-splash-screen';
import {StethoScopeProvider} from './src/nativemodules/SmarthoStethoScope/useStethoScope';
import AppNavigation from './src/utils/AppNavigation';
import Toast from 'react-native-toast-message';
import {hideMeetingNotification} from './src/utils/pushNotification';
import NetInfo from '@react-native-community/netinfo';
import SpInAppUpdates, {
  IAUUpdateKind,
  StartUpdateOptions,
} from 'sp-react-native-in-app-updates';

const inAppUpdates = new SpInAppUpdates(true);

const checkUpdates = async () => {
  try {
    const result = await inAppUpdates.checkNeedsUpdate();
    if (result.shouldUpdate) {
      let updateOptions: StartUpdateOptions = {};
      if (Platform.OS === 'android') {
        updateOptions = {
          updateType: IAUUpdateKind.FLEXIBLE,
        };
      }
      await inAppUpdates.startUpdate(updateOptions);
      inAppUpdates.installUpdate()
    }
  } catch (error) {
    console.log('In app update: ', error);
  }
};

export const queryClient = new QueryClient();

export default function App() {
  const [isConnected, setConnected] = useState(true);

  const createNotificationChannels = () => {
    PushNotification.createChannel(
      {
        channelId: 'meeting-channel',
        channelName: 'meeting_channel',
      },
      result => {},
    );
  };

  useEffect(() => {
    createNotificationChannels();
    if (Platform.OS === 'android') SplashScreen.hide();

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

  // In app updates
  useEffect(() => {
    checkUpdates();
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
      <Toast />
    </GestureHandlerRootView>
  );
}
