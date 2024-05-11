import {MMKV} from 'react-native-mmkv';

import {StateStorage} from 'zustand/middleware';

export const userStorage = new MMKV({
  id: 'user-data',
});

export const zustandUserStorage: StateStorage = {
  setItem: (name: string, value: string) => {
    return userStorage.set(name, value);
  },
  getItem: (name: string) => {
    const value = userStorage.getString(name);
    return value ?? null;
  },
  removeItem: (name: string) => {
    return userStorage.delete(name);
  },
};