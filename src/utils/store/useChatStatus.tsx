import {
  ChatMessage
} from 'react-native-agora-chat';
import { create } from 'zustand';


interface ChatStatus {
  isLoggedIn: boolean;
  isInitialized: boolean;
  conversation: ChatMessage[];
  setIsLoggedIn: (state: boolean) => void;
  setIsInitialized: (state: boolean) => void;
  setConvesation: (state: ChatMessage[]) => void;
}

export const useChatStatus = create<ChatStatus>()(set => ({
  isLoggedIn: false,
  isInitialized: false,
  conversation: [],
  setIsLoggedIn: (state: boolean) => set(_ => ({isLoggedIn: state})),
  setIsInitialized: (state: boolean) => set(_ => ({isInitialized: state})),
  setConvesation: (state: ChatMessage[]) => set(_ => ({conversation: state})),
}));
