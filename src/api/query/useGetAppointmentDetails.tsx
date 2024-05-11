import {useQuery} from '@tanstack/react-query';
import axiosInstance from '../../utils/config';
import {AppointmentDetail} from '../schema/Appointment';

export async function getAppointmentDetails(id: string) {
  try {
    const {data} = await axiosInstance.get(`/get_appointment_details/${id}`);
    if (data.status === 201) {
      return data.data as AppointmentDetail;
      console.log('Appointment Detail: ....', id);
    } else throw new Error('Oops! Something went wrong.');
  } catch (error) {
    throw error;
  }
}

export default function useGetAppointmentDetails(id: string) {
  return useQuery({
    queryKey: [`get_appointment_details_${id}`],
    queryFn: () => getAppointmentDetails(id),
  });
}
