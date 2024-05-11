import {create} from 'zustand';

interface TestResultModalStore {
  videoUrl: string;
  audioUrl: string;
  variableName: string;
  testName: string;
  setAudioAndVideoUrl: (
    audioUrl: string,
    videoUrl: string,  variableName: string,
    testName: string,
  ) => void;
}

export const useTestResultModalStore = create<TestResultModalStore>()(set => ({
  videoUrl: '',
  variableName: '',
  audioUrl: '',
  testName: '',
  setAudioAndVideoUrl: (audioUrl, videoUrl, testName, variableName) =>
    set({audioUrl, videoUrl, testName, variableName}),
}));