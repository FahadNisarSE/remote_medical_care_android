import {useQuery} from '@tanstack/react-query';
import axiosInstance from '../../utils/config';
import {GuestDetails} from '../schema/Guest';

async function getAppointmentGuest(guestId: number) {
  try {
    const {data} = await axiosInstance.get(
      `/get_single_guest_details/${guestId}`,
    );

    if (data.status === 200) {
      return data.data ? (data.data as GuestDetails) : null;
    } else throw new Error('Oops! Something went wrong.');
  } catch (error) {
    throw error;
  }
}

export default function useGetAppointmentGuest(guestId: number) {
  return useQuery({
    queryKey: ['get_appointment_guests', guestId],
    queryFn: () => getAppointmentGuest(guestId),
  });
}
