import {useState} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';

interface CameraAndMicrophonePermission {
  getAgoraPermission: () => Promise<void>;
  cameraAndMicrophonePermissions: boolean;
}

export default function useCameraAndMicPermission() {
  const [cameraAndMicrophonePermissions, setCameraAndMicrophonePermissions] =
    useState(true);

  async function getAgoraPermission(): Promise<void> {
    if (Platform.OS === 'android') {
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.CAMERA,
      ]);

      setCameraAndMicrophonePermissions(
        result[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] ===
          PermissionsAndroid.RESULTS.GRANTED &&
          result[PermissionsAndroid.PERMISSIONS.CAMERA] ===
            PermissionsAndroid.RESULTS.GRANTED,
      );
    }
  }

  return {
    getAgoraPermission,
    cameraAndMicrophonePermissions,
  } as CameraAndMicrophonePermission;
}
