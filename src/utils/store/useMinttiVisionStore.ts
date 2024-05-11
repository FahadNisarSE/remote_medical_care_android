import {create} from 'zustand';

export type BleDevice = {
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

type SPO2 = {
  waveData: number | undefined;
  result: {heartRate: number; spo2: number} | undefined;
  measurementEnded: boolean | undefined;
  message: string | undefined;
};

type BgEvent =
  | 'bgEventWaitPagerInsert'
  | 'bgEventPaperUsed'
  | 'bgEventMeasureEnd'
  | 'bgEventGetBgResultTimeout'
  | 'bgEventBloodSampleDetecting'
  | 'bgEventWaitDripBlood'
  | 'bgEventCalibrationFailed';

type BP = {
  result: {systolic: number; diastolic: number; heartRate: number} | undefined;
  error: string | undefined;
};

interface MinittiVisionInterface {
  bleDevices: BleDevice[];
  setBleDevices: (state: BleDevice) => void;
  resetBleDevices: () => void;
  battery: number;
  setBattery: (state: number) => void;
  temperature: number;
  setTemperature: (state: number) => void;
  spo2: SPO2 | null;
  setSpo2: (spo2: SPO2 | null) => void;
  bp: BP | null;
  setBp: (bg: BP | null) => void;

  bgEvent: {
    event: BgEvent | undefined;
    message: string | undefined;
  } | null;
  setBgEvent: (
    bgEvent: {event: BgEvent | undefined; message: string | undefined} | null,
  ) => void;
  bgResult: {bg: number} | null;
  setBgResult: (bgResult: {bg: number} | null) => void;

  // States
  isConnecting: boolean;
  setIsConnecting: (state: boolean) => void;

  isConnected: boolean;
  setIsConnected: (state: boolean) => void;

  isScanning: boolean;
  setIsScanning: (state: boolean) => void;

  isMeasuring: boolean;
  setIsMeasuring: (state: boolean) => void;
}

export const useMinttiVisionStore = create<MinittiVisionInterface>()(set => ({
  bleDevices: [],
  setBleDevices: ble_device =>
    set(state => {
      const exists = state.bleDevices.some(
        device => device.mac === ble_device.mac,
      );

      if (!exists) {
        return {
          bleDevices: [...state.bleDevices, ble_device],
        };
      }

      return state;
    }),
  resetBleDevices: () => set({bleDevices: []}),
  battery: 0,
  setBattery: battery => set({battery: battery}),
  temperature: 0,
  setTemperature: temperature => set({temperature: temperature}),
  bp: null,
  setBp: bp => set({bp: bp}),
  spo2: null,
  setSpo2: spo2 => set({spo2: spo2}),
  bgResult: null,
  setBgResult: bgResult => set({bgResult: bgResult}),
  bgEvent: null,
  setBgEvent: bgEvent => set({bgEvent: bgEvent}),

  // states
  isConnecting: false,
  setIsConnecting: state => set({isConnecting: state}),

  isConnected: false,
  setIsConnected: state => set({isConnected: state}),

  isScanning: false,
  setIsScanning: state => set({isScanning: state}),

  isMeasuring: false,
  setIsMeasuring: state => set({isMeasuring: state}),
}));
