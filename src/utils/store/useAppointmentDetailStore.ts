import {create} from 'zustand';
import {AppointmentDetail} from '../../api/schema/Appointment';

interface AppointmentDetailStore {
  appointmentDetail: AppointmentDetail | null | undefined;
  setAppointmentDetail: (appointment_detail: AppointmentDetail) => void;
  appointmentTestId: null | string;
}

export const useAppointmentDetailStore = create<AppointmentDetailStore>()(
  set => ({
    appointmentDetail: undefined,
    appointmentTestId: null,
    setAppointmentDetail: appointment_detail =>
      set(state => ({appointmentDetail: appointment_detail})),
  }),
);
