import {create} from 'zustand';

interface SmarthoInitlialization {
  isInitialized: boolean;
  testName: string;
  appointmentTestId: string | null;
  isConnected: boolean;
  setIsInitialized: (status: boolean) => void;
  setTestName: (test_name: string) => void;
  setAppointmentTestId: (app_id: string) => void;
  setIsConnected: (state: boolean) => void;
}

export const useSmarthoInitialization = create<SmarthoInitlialization>()(
  set => ({
    isInitialized: false,
    testName: 'heartRate',
    appointmentTestId: null,
    isConnected: false,
    setIsInitialized: status => set(state => ({isInitialized: status})),
    setTestName: test_name => set(state => ({testName: test_name})),
    setAppointmentTestId: app_id => set(state => ({appointmentTestId: app_id})),
    setIsConnected: state => set(_ => ({isConnected: state})),
  }),
);
