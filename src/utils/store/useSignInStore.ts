import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {zustandUserStorage} from '../mmkv';
import {User} from '../../api/schema/loginSchema';

interface SingInStore {
  userData: User | null;
  setUserData: (user: User) => void;
  removeUserData: () => void;
}

export const useSignInStore = create<SingInStore>()(
  persist(
    (set, get) => ({
      userData: null,
      setUserData: user => set(state => ({userData: user})),
      removeUserData: () => set(state => ({userData: null})),
    }),
    {
      name: 'user-data',
      storage: createJSONStorage(() => zustandUserStorage),
    },
  ),
);
