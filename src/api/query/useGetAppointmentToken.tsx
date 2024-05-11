import {useMutation} from '@tanstack/react-query';
import axiosInstance from '../../utils/config';

export type TokenData = {
  token: string;
  expireTimeStamp: number;
};

async function getAppointmentToken({
  channel_name,
  user_id,
  appointment_id,
}: {
  channel_name: string;
  user_id: string;
  appointment_id: string;
}) {
  try {
    const {data} = await axiosInstance.post('/agora/get_token', {
      channel_name,
      user_id,
      appointment_id,
    });

    if (data.status === 200) {
      return data.data as TokenData;
    } else throw new Error('Oops! Something went wrong.');
  } catch (error) {
    throw error;
  }
}

export default function useGetAppointmentToken() {
  return useMutation({
    mutationKey: ['get_appointment_token'],
    mutationFn: getAppointmentToken,
  });
}
