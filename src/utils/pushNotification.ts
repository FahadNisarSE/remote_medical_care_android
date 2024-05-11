import PushNotification from 'react-native-push-notification';

const showMeetingNotification = () => {
  PushNotification.localNotification({
    channelId: 'meeting-channel', // Optional if using channels
    title: 'Meeting in Progress',
    message: 'You are currently in a meeting.',
    allowWhileIdle: true,
    ongoing: true, // Key for Android "permanent" notification
    priority: 'high', // Optional priority (Android)
    visibility: 'public', // Optional visibility (Android)
    actions: ['Join now']
  });
};

const hideMeetingNotification = () => {
  PushNotification.cancelAllLocalNotifications();
};

export {showMeetingNotification, hideMeetingNotification};
