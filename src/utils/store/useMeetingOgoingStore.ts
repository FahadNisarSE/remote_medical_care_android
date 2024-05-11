import {create} from 'zustand';

interface MeetingOngoingStore {
  isOngoingMeeting: boolean;
  remaingingTime: number;
  appointmentId: string | null;
  setIsOngoingMeeting: (meeting_status: boolean) => void;
  setRemaingingTime: (remaining_time: number) => void;
  setAppointmentId: (state: string | null) => void;
}

export const useMeetingOngoingStore = create<MeetingOngoingStore>()(set => ({
  isOngoingMeeting: false,
  remaingingTime: 0,
  appointmentId: null,
  setIsOngoingMeeting: meeting_status =>
    set(_ => ({isOngoingMeeting: meeting_status})),
  setRemaingingTime: remaining_time =>
    set(_ => ({
      remaingingTime: remaining_time,
    })),
  setAppointmentId: (state: string | null) =>
    set(_ => ({appointmentId: state})),
}));
