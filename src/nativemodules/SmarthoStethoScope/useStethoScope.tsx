import {ReactNode, createContext, useEffect, useRef, useState} from 'react';
import {
  NativeEventEmitter,
  NativeModules,
  ToastAndroid,
  UIManager,
  findNodeHandle,
  requireNativeComponent,
} from 'react-native';
import {
  AndroidLocationEnablerResult,
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';
import BluetoothStateManager from 'react-native-bluetooth-state-manager';
import Toast from 'react-native-toast-message';
import {useSmarthoInitialization} from '../../utils/store/useSmarthoInitalization';
import {StethoScopeContextType, TBluetoothDevice} from './StethoScope.type';

export const MeasurementViewManager =
  requireNativeComponent('SmarthoViewManager');

const {SmarthoModule} = NativeModules;

// Creating native graph
const createMeasurementFragment = (viewId: number) =>
  UIManager.dispatchViewManagerCommand(
    viewId,
    // @ts-ignore (optional, explained later)
    UIManager.MeasurementViewManager.Commands.create.toString(),
    [viewId],
  );

// Updating native graph
export const updateWaveData = (viewId: number, updateData: number[]) =>
  UIManager.dispatchViewManagerCommand(
    viewId,
    // @ts-ignore
    UIManager.MeasurementViewManager.Commands.updateWaveData.toString(),
    [viewId, updateData],
  );

export const StethoScopeContext = createContext<
  StethoScopeContextType | undefined
>(undefined);

export const StethoScopeProvider = ({children}: {children: ReactNode}) => {
  const stethoScope = useStethoScope();

  return (
    <StethoScopeContext.Provider value={stethoScope}>
      {children}
    </StethoScopeContext.Provider>
  );
};

export function useStethoScope(): StethoScopeContextType {
  const [deviceList, setDeviceList] = useState<TBluetoothDevice[]>([]);
  const [heartRate, setHeartRate] = useState(0);
  const [heartRateArray, setHeartRateArray] = useState<Array<number>>([]);
  const [echoMode, setEchoMode] = useState<'lungs' | 'heart'>('heart');
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [battery, setBattery] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const {isConnected, setIsConnected} = useSmarthoInitialization();

  const ref = useRef(null); // refrence for native graph
  const isMeasurementViewManagerCreatedRef = useRef(false);

  const initalizeMeasurementGraph = () => {
    if (!isMeasurementViewManagerCreatedRef.current) {
      const viewId = findNodeHandle(ref.current);
      createMeasurementFragment(viewId!);
      isMeasurementViewManagerCreatedRef.current = true;
    }
  };

  // Setting up event listeners
  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(NativeModules.SmarthoModule);
    const eventListener = eventEmitter.addListener('onReady', event => {
      console.log(event.eventProperty); // "someValue"
    });

    const scanEventListener = eventEmitter.addListener(
      'onScanResult',
      event => {
        addToDeviceList(event);
      },
    );

    const batteryListener = eventEmitter.addListener('onBattery', event => {
      setBattery(event);
    });

    const spkListener = eventEmitter.addListener('onSpkData', event => {
      console.log(event);
    });
    const micListener = eventEmitter.addListener('onMicData', event => {
      console.log(event);
    });
    const processDataListener = eventEmitter.addListener(
      'onProcessData',
      async event => {
        const viewId = findNodeHandle(ref.current);
        if (viewId) updateWaveData(viewId, event.onProcessData);
      },
    );
    const heartRateListener = eventEmitter.addListener('onHeartRate', event => {
      setHeartRate(event.heartRate);
      setHeartRateArray(prev => [...prev, event.heartRate]);
    });

    const modeSwitchListener = eventEmitter.addListener(
      'onModeSwitch',
      event => {
        setEchoMode(event.mode);
      },
    );

    const disconnectEventListener = eventEmitter.addListener(
      'onDisconnected',
      event => {
        setIsConnected(false);
        setIsConnecting(false);
        setIsMeasuring(false);
        Toast.show({
          type: 'error',
          text1: 'Oops! Digital Stethoscope has been disconnected.',
        });
      },
    );

    // Removes the listener once unmounted
    return () => {
      eventListener.remove();
      scanEventListener.remove();
      batteryListener.remove();
      spkListener.remove();
      micListener.remove();
      processDataListener.remove();
      heartRateListener.remove();
      modeSwitchListener.remove();
      disconnectEventListener.remove();
    };
  }, []);

  function addToDeviceList(device: TBluetoothDevice) {
    setDeviceList(devices => {
      if (device.mac === devices[0]?.mac) return devices;
      return [...devices, device];
    });
  }

  async function connectToDevice(device: TBluetoothDevice, cb: () => void) {
    try {
      setIsConnecting(true);
      stopScan();
      const result = await SmarthoModule.connectToDevice({...device});
      await getEchoMode();
      await getBattery();
      setIsConnected(true);
      setDeviceList([]);
      cb();
      setIsConnecting(false);
      ToastAndroid.show('Connect to device \n' + result, 1000);
    } catch (error: any) {
      setIsConnecting(false);
      ToastAndroid.show('Error connecting to device \n' + error, 1000);
    }
  }

  async function getEchoMode() {
    try {
      const mode = await SmarthoModule.getMode();
      setEchoMode(mode);
    } catch (error: any) {
      ToastAndroid.show(error.toString(), 1000);
    }
  }

  async function toggleEchoMode(mode: 'heart' | 'lungs') {
    try {
      console.log('Echo mode: ', mode);
      const response = await SmarthoModule.setMode(mode);
      setEchoMode(mode);
    } catch (error: any) {
      ToastAndroid.show(error.toString(), 1000);
    }
  }

  async function getBattery() {
    try {
      const battery = await SmarthoModule.getBattery();
      setBattery(battery);
      console.log('Device Battery: ', battery);
    } catch (error: any) {
      ToastAndroid.show(error.toString(), 1000);
    }
  }

  async function startScan() {
    try {
      let resultBle: Boolean = new Boolean(true);
      let resultLoc: AndroidLocationEnablerResult = 'enabled';

      BluetoothStateManager.getState()
        .then(async bluetoothState => {
          switch (bluetoothState) {
            case 'Unknown':
            case 'Resetting':
            case 'Unsupported':
            case 'Unauthorized':
            case 'PoweredOff':
              resultBle = await BluetoothStateManager.requestToEnable();
              break;
            case 'PoweredOn':
            default:
              break;
          }
        })
        .catch(error => {
          Toast.show({
            type: 'error',
            text1: 'Bluetooth is Required',
            text2: 'Please enable bluetooth.',
          });

          return;
        });

      const isLocationEnable = await isLocationEnabled();
      if (!isLocationEnable) {
        try {
          resultLoc = await promptForEnableLocationIfNeeded();
        } catch (error) {
          console.log('Error occured...');
          Toast.show({
            type: 'error',
            text1: 'Location is Required',
            text2: 'Please enable location.',
          });
          return;
        }
      }

      setIsScanning(true);
      // FIX SO THAT DEVICES APPEAR IN INITAL SCAN
      setTimeout(
        () => SmarthoModule.startDeviceScan('Sending data from React Native'),
        500,
      );
    } catch (error: any) {
      setIsScanning(false);
      ToastAndroid.show(error.toString(), 1000);
    }
  }

  async function startMeasurement() {
    try {
      if (isMeasuring) return;
      setHeartRateArray([]);
      await SmarthoModule.startMeasurements();
      setIsMeasuring(true);
    } catch (error: any) {
      ToastAndroid.show('Error Starting Measurement ' + error, 1000);
    }
  }

  async function isBluetoothEnabled() {
    try {
      return await SmarthoModule.isBluetoothEnabled();
    } catch (e: any) {
      ToastAndroid.show(e.toString(), 1000);
    }
  }

  async function stopMeasurements() {
    try {
      if (!isMeasuring) return;
      const result = await SmarthoModule.stopMeasurements();
      setIsMeasuring(false);
      return result.absolutePath;

      // console.log('Audio Wave: ', audioWav);
    } catch (error: any) {
      ToastAndroid.show('Error stopping measurement' + error, 1000);
    }
  }

  async function stopScan() {
    try {
      await SmarthoModule.stopScan();
      setIsScanning(false);
    } catch (error) {}
  }

  async function getPCMFilePath() {
    const paths = await SmarthoModule.getPCMFilePath();
    return paths;
  }

  return {
    ref,
    heartRate,
    isConnecting,
    echoMode,
    deviceList,
    isMeasuring,
    heartRateArray,
    battery,
    isScanning,
    isConnected,
    startScan,
    stopScan,
    toggleEchoMode,
    connectToDevice,
    startMeasurement,
    stopMeasurements,
    initalizeMeasurementGraph,
    setHeartRateArray,
    setHeartRate,
    isBluetoothEnabled,
    getPCMFilePath,
  };
}
