import {create} from 'zustand';

interface KeyboardStore {
  isKeyboardActive: boolean;
  setIsKeyBoardActive: (status: boolean) => void;
}

export const useKeyboardStore = create<KeyboardStore>()(set => ({
  isKeyboardActive: false,
  setIsKeyBoardActive: status => set(state => ({isKeyboardActive: status})),
}));
