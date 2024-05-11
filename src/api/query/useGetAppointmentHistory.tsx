import {useQuery} from '@tanstack/react-query';
import axiosInstance from '../../utils/config';
import {useSignInStore} from '../../utils/store/useSignInStore';

export async function getAppointmentHistory(
  PatientId: string | undefined,
  ClinicId: string | undefined,
) {
  try {
    const {data} = await axiosInstance.post('/get_appointments_history', {
      PatientId,
      ClinicId,
    });

    if (data.status === 201) {
      return data.data as any;
    } else throw new Error('Oops! Something went wrong.');
  } catch (error) {
    throw error;
  }
}

export default function useGetAppointmentHistory(clinicId: string | undefined) {
  const {userData} = useSignInStore();
  return useQuery({
    queryKey: ['get_appointment_history', clinicId],
    queryFn: () =>
      getAppointmentHistory(
        userData?.PatientId,
        clinicId ? clinicId : userData?.ClinicIds,
      ),
    refetchInterval: 30 * 1000, // 30 sec
    retry: 3, // retry 3 times
    retryDelay: 10 * 1000, // 5 sec retry delay
  });
}
