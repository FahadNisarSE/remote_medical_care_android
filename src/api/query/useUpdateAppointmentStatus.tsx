import {useMutation} from '@tanstack/react-query';
import axiosInstance from '../../utils/config';

export async function updateAppointmentStatus({
  appointmentId,
}: {
  appointmentId: string;
}) {
  try {
    const {data} = await axiosInstance.get(
      `/agora/update_appointment_status/${appointmentId}`,
    );

    if (data.status === 200) {
      return true;
    } else throw new Error('Oops! Something went wrong.');
  } catch (error) {
    throw error;
  }
}

export default function useUpdateAppointmentStatus() {
  return useMutation({
    mutationKey: ['update_appointment_status'],
    mutationFn: updateAppointmentStatus,
  });
}
