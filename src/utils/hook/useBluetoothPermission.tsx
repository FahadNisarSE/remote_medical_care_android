import {PermissionsAndroid, Platform, ToastAndroid} from 'react-native';

type VoidCallback = (result: boolean) => void;

interface BluetoothPermissions {
  requestPermissions: (cb: VoidCallback) => Promise<void>;
  checkPermissions: () => Promise<boolean>;
}

export default function useBluetoothPermissions(): BluetoothPermissions {
  const requestPermissions = async (cb: VoidCallback): Promise<void> => {
    if (Platform.OS === 'android') {
      const apiLevel = Platform.Version;

      if (apiLevel < 31) {
        // Request ACCESS_FINE_LOCATION for Android versions below 31
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission',
              message: 'This device needs location access to use Bluetooth.',
              buttonNeutral: 'Ask me later',
              buttonNegative: '',
              buttonPositive: 'OK',
            },
          );

          cb(granted === PermissionsAndroid.RESULTS.GRANTED);
        } catch (error) {
          console.log('Error: ', JSON.stringify(error));
          ToastAndroid.show('Permission Denied', 1000);
        }
      } else {
        try {
          // Request required permissions for Android versions 31 and above
          const result = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ]);

          console.log('Result: ', result);
          const isGranted =
            result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
              PermissionsAndroid.RESULTS.GRANTED &&
            result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
              PermissionsAndroid.RESULTS.GRANTED &&
            result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
              PermissionsAndroid.RESULTS.GRANTED;

          cb(isGranted);
        } catch (error) {
          console.log('Error: ', JSON.stringify(error));
          ToastAndroid.show('Permission Denied', 1000);
        }
      }
    } else {
      // Assume permissions granted on platforms other than Android
      cb(true);
    }
  };

  const checkPermissions = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      const apiLevel = Platform.Version;

      if (apiLevel < 31) {
        // Check ACCESS_FINE_LOCATION for Android versions below 31
        return await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
      } else {
        // Check required permissions for Android versions 31 and above
        const bluetoothScanGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        );
        const bluetoothConnectGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        );
        const locationGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        return (
          bluetoothScanGranted && bluetoothConnectGranted && locationGranted
        );
      }
    } else {
      // Assume permissions granted on platforms other than Android
      return true;
    }
  };

  return {requestPermissions, checkPermissions};
}
