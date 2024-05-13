import _ from 'lodash';
import {useEffect, useState} from 'react';
import {NativeEventEmitter, NativeModules, ToastAndroid} from 'react-native';
import {
  AndroidLocationEnablerResult,
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';
import BluetoothStateManager from 'react-native-bluetooth-state-manager';
import Toast from 'react-native-toast-message';
import {useMinttiVisionStore} from '../../utils/store/useMinttiVisionStore';

const {VisionModule} = NativeModules;

const useMinttiVision = ({
  onSpo2,
  onSpo2Result,
  onSpo2Ended,
  onScanResult,
  onEcg,
  onEcgResult,
  onEcgDuration,
  onEcgHeartRate,
  onEcgRespiratoryRate,
  onBp,
  onBpRaw,
  onBgEvent,
  onBgResult,
}: useMinttiVisionProps) => {
  const [discoveredDevices, setDiscoveredDevices] = useState<BleDevice[]>();
  const [connectedDevice, setConnectedDevice] = useState<BleDevice>();
  const {
    setTemperature,
    setBattery,
    setBleDevices,
    setIsConnecting,
    setIsScanning,
    setIsMeasuring,
    setIsConnected,
  } = useMinttiVisionStore();

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(NativeModules.VisionModule);

    const scanEventListener = eventEmitter.addListener(
      'onScanResult',
      event => {
        setDiscoveredDevices([event]);
        setBleDevices(event);
        onScanResult && onScanResult(event);
      },
    );
    const disconnectEventListener = eventEmitter.addListener(
      'onDisconnected',
      event => {
        setIsConnected(false);
        setIsConnecting(false);
        Toast.show({
          type: 'error',
          text1: 'Medical device has been diconnected..',
        });
      },
    );
    const batteryListener = eventEmitter.addListener('onBattery', event =>
      setBattery(event.battery),
    );
    const bodyTemperatureListener = eventEmitter.addListener(
      'onBodyTemperatureResult',
      event => {},
    );

    const bpListener = eventEmitter.addListener('onBp', event => {
      onBp && onBp(event);
    });

    type CallbackFunction = (event: any) => void;

    // @ts-ignore
    const throttledBpRawListener: CallbackFunction = _.throttle(
      (event: any) => {
        onBpRaw && onBpRaw(event);
      },
      250,
    );

    const bpRawListener = eventEmitter.addListener(
      'onBpRaw',
      throttledBpRawListener,
    );

    const spo2Listener = eventEmitter.addListener('onSpo2', event => {
      onSpo2 && onSpo2(event);
    });

    const spo2ResultListener = eventEmitter.addListener(
      'onSpo2Result',
      event => {
        onSpo2Result && onSpo2Result(event);
      },
    );

    const spo2EndedListener = eventEmitter.addListener('onSpo2Ended', event => {
      onSpo2Ended && onSpo2Ended(event);
    });

    const ecgListener = eventEmitter.addListener('onEcg', event => {
      onEcg && onEcg(event);
    });
    const ecgResultListener = eventEmitter.addListener('onEcgResult', event => {
      onEcgResult && onEcgResult(event);
    });
    const ecgRespiratoryRateListener = eventEmitter.addListener(
      'onEcgRespiratoryRate',
      event => {
        onEcgRespiratoryRate && onEcgRespiratoryRate(event);
      },
    );
    const ecgHeartRateListener = eventEmitter.addListener(
      'onEcgHeartRate',
      event => {
        onEcgHeartRate && onEcgHeartRate(event);
      },
    );
    const ecgDurationLisener = eventEmitter.addListener(
      'onEcgDuration',
      event => onEcgDuration && onEcgDuration(event),
    );
    const bgEventListener = eventEmitter.addListener(
      'onBgEvent',
      event => onBgEvent && onBgEvent(event),
    );
    const bgResultListener = eventEmitter.addListener(
      'onBgResult',
      event => onBgResult && onBgResult(event),
    );

    return () => {
      scanEventListener.remove();
      batteryListener.remove();
      bodyTemperatureListener.remove();
      bpListener.remove();
      bpRawListener.remove();
      spo2EndedListener.remove();
      spo2Listener.remove();
      spo2ResultListener.remove();
      ecgListener.remove();
      disconnectEventListener.remove();
      bgEventListener.remove();
      bgResultListener.remove();
      ecgResultListener.remove();
      ecgHeartRateListener.remove();
      ecgDurationLisener.remove();
      ecgRespiratoryRateListener.remove();
    };
  }, []);

  const discoverDevices = async () => {
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
      VisionModule.startDeviceScan('start scanning');
    } catch (e) {
      setIsScanning(false);
      console.log(e);
      ToastAndroid.show('Error' + e, 1000);
    }
  };

  async function connectToDevice(device: BleDevice) {
    try {
      setIsScanning(false);
      setIsConnecting(true);
      await VisionModule.connectToDevice({
        ...device,
      });
      await getBattery();
      setConnectedDevice(device);
      setIsConnecting(false);
      setIsConnected(true);
      Toast.show({
        type: 'success',
        text1: 'Connected to Mintti Vision Device',
      });
    } catch (e) {
      setIsConnected(false);
      setIsConnecting(false);
      Toast.show({
        type: 'error',
        text1: 'Error! Failed while connecting to device',
      });
    }
  }

  async function getBattery() {
    try {
      const battery = await VisionModule.getBattery();
      setBattery(battery);
      return battery;
    } catch (e) {
      console.log('Error getting battery');
    }
  }

  async function measureBodyTemperature() {
    try {
      setIsMeasuring(true);
      const bt = await VisionModule.measureBodyTemperature();
      setIsMeasuring(false);
      setTemperature(bt);
    } catch (e) {}
  }

  async function measureBp() {
    try {
      setIsMeasuring(true);
      await VisionModule.measureBloodPressure();
    } catch (e) {
      setIsMeasuring(false);
    }
  }

  async function measureBloodOxygen() {
    try {
      setIsMeasuring(true);
      await VisionModule.measureBloodOxygenSaturation();
    } catch (e) {
      setIsMeasuring(false);
    }
  }

  async function stopSpo2() {
    try {
      console.log('Stop sp02 called...');
      setIsMeasuring(false);
      await VisionModule.stopSpo2();
    } catch (error) {
      console.log('stop spo2 : ', error);
    }
  }

  async function measureECG() {
    setIsMeasuring(true);
    await VisionModule.measureECG();
  }
  async function stopECG() {
    setIsMeasuring(false);
    const result = await VisionModule.stopECG();
    console.log('Result: ', result);
  }

  async function stopBp() {
    await VisionModule.stopBp();
  }

  async function measureBg() {
    try {
      setIsMeasuring(true);
      const res = await VisionModule.measureBloodGlucose();
      console.log('mesareu bg call: ', res);
    } catch (error) {
      console.log('Error in bg: ', error);
    }
  }

  async function stopScan() {
    try {
      VisionModule.stopScan();
      setIsScanning(false);
    } catch (error) {
      console.log('Error: ', error);
    }
  }

  return {
    discoverDevices,
    measureBg,
    measureECG,
    stopECG,
    measureBloodOxygen,
    stopSpo2,
    measureBp,
    stopBp,
    measureBodyTemperature,
    getBattery,
    connectToDevice,
    stopScan,
    discoveredDevices,
    connectedDevice,
  };
};

export type useMinttiVisionProps = {
  onScanResult?: (event: BleDevice) => void;
  onBattery?: (event: {battery: number}) => void;
  onBodyTemperature?: (event: {bodyTemperature: number} | any) => void;
  onBp?: (event: {
    result:
      | {systolic: number; diastolic: number; heartRate: number}
      | undefined;
    error: string | undefined;
  }) => void;
  onBpRaw?: (event: {
    pressurizationData?: string;
    decompressionData?: string;
    pressureData?: string;
  }) => void;
  onSpo2?: (event: {waveData: number | undefined}) => void;
  onSpo2Result?: (event: {
    result: {heartRate: number; spo2: number} | undefined;
  }) => void;
  onSpo2Ended?: (event: {
    measurementEnded: boolean | undefined;
    message: string | undefined;
  }) => void;
  onEcg?: (event: {wave: number | undefined}) => void;
  onEcgDuration?: (event: {
    duration: {duration: number; isEnd: boolean} | undefined;
  }) => void;
  onEcgHeartRate?: (event: {heartRate: number | undefined}) => void;
  onEcgRespiratoryRate?: (event: {respiratoryRate: number | undefined}) => void;
  onEcgResult?: (event: {
    results: {rrMax: number; rrMin: number; hrv: number} | undefined;
  }) => void;
  onBgEvent?: (event: {
    event: BgEvent | undefined;
    message: string | undefined;
  }) => void;
  onBgResult?: (event: {bg: number}) => void;
};

type BgEvent =
  | 'bgEventWaitPagerInsert'
  | 'bgEventPaperUsed'
  | 'bgEventWaitDripBlood'
  | 'bgEventBloodSampleDetecting'
  | 'bgEventGetBgResultTimeout'
  | 'bgEventCalibrationFailed'
  | 'bgEventMeasureEnd';

type BleDevice = {
  rssi: number;
  name: string;
  mac: string;
  bluetoothDevice: {
    type: string;
    address: string;
    bondState: string;
    name: string;
  };
};

export default useMinttiVision;

export type TMinittiVisison = typeof useMinttiVision;
