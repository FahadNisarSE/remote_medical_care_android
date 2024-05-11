/**
 * @format
 */
import 'react-native-gesture-handler';
import {AppRegistry, Platform} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import PushNotification from 'react-native-push-notification';
import {navigate} from './src/utils/AppNavigation';
import { showMeetingNotification } from './src/utils/pushNotification';

PushNotification.configure({
  onNotification: function (notification) {
    if (notification.action === 'Join now' || notification.channelId === "meeting-channel") {
      showMeetingNotification()
      navigate('LiveMeeting');
    }
  },
  requestPermissions: Platform.OS === 'ios',
});

AppRegistry.registerComponent(appName, () => App);
