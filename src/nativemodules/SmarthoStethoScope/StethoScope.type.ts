import React, {Dispatch, SetStateAction} from 'react';

export type TBluetoothDevice = {mac: string; name: string; rssi: number};

export interface StethoScopeContextType {
  ref: React.MutableRefObject<any>;
  heartRate: number;
  heartRateArray: number[];
  echoMode: 'lungs' | 'heart';
  deviceList: TBluetoothDevice[];
  battery: number;
  isScanning: boolean;
  isConnected: boolean;
  isMeasuring: boolean;
  isConnecting: boolean;
  startScan: () => void;
  stopScan: () => void;
  toggleEchoMode: (mode: 'heart' | 'lungs') => Promise<void>;
  connectToDevice: (device: TBluetoothDevice, cb: () => void) => Promise<void>;
  startMeasurement: () => Promise<void>;
  stopMeasurements: () => Promise<string>;
  isBluetoothEnabled: () => Promise<boolean>;
  initalizeMeasurementGraph: () => void;
  setHeartRateArray: Dispatch<SetStateAction<number[]>>;
  setHeartRate: Dispatch<SetStateAction<number>>;
  getPCMFilePath: () => void;
}

export const defaultValue: StethoScopeContextType = {
  ref: React.createRef(),
  heartRate: 0,
  heartRateArray: [],
  echoMode: 'heart',
  deviceList: [],
  battery: 0,
  isMeasuring: false,
  isScanning: false,
  isConnected: false,
  isConnecting: false,
  startScan: () => {},
  stopScan: () => {},
  toggleEchoMode: async mode => {},
  connectToDevice: async (device, cb) => {},
  startMeasurement: async () => {},
  stopMeasurements: async () => '',
  initalizeMeasurementGraph: () => {},
  setHeartRateArray: () => {},
  setHeartRate: () => {},
  isBluetoothEnabled: async () => false,
  getPCMFilePath: async () => {},
};
