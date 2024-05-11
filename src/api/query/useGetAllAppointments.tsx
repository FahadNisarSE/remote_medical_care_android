import {useQuery} from '@tanstack/react-query';
import axiosInstance from '../../utils/config';
import {Appointment} from '../schema/Appointment';
import {useSignInStore} from '../../utils/store/useSignInStore';

export async function getAllAppointments(
  PatientId: string | undefined,
  ClinicId: string | undefined,
) {
  try {
    const {data} = await axiosInstance.post('/get_all_appointments', {
      PatientId,
      ClinicId,
    });

    if (data.status === 201) {
      return data.data as Appointment[];
    } else throw new Error('Oops! Something went wrong.');
  } catch (error) {
    throw error;
  }
}

export default function useGetAllAppointments(clinicId: string | undefined) {
  const {userData} = useSignInStore();
  return useQuery({
    queryKey: ['get_all_appointments', clinicId],
    queryFn: () =>
      getAllAppointments(
        userData?.PatientId,
        clinicId ? clinicId : userData?.ClinicIds,
      ),
    refetchInterval: 30 * 1000, // 30 sec
    retry: 3, // retry 3 times
    retryDelay: 5 * 1000, // 5 sec retry delay
  });
}
