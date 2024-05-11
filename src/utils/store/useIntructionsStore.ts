import {create} from 'zustand';
import {TTemperatureInstruction} from '../../constant/Instructions';

interface InstructionsStore {
  instructionList: TTemperatureInstruction;
  setInstructionList: (list: TTemperatureInstruction) => void;
}

export const useInstuctionsStore = create<InstructionsStore>()(set => ({
  instructionList: [],
  setInstructionList: list => set({instructionList: list}),
}));
