import {useQuery} from '@tanstack/react-query';
import axiosInstance from '../../utils/config';

interface User {
    About: string;
    Address: string;
    AssociationName: string;
    ClinicIds: string;
    ClinicNames: string;
    Clinics: any[];
    Dob: string;
    DoctorId: string;
    Email: string;
    Firstname: string;
    Gender: string;
    Id: string;
    Language: string;
    Lastname: string;
    Lnar: string;
    PasswordHash: string;
    PhoneNumber: string;
    ProfileImg: string;
    RoleId: string;
    RoleName: string;
    SpecialTreatment: string;
    Specializations: any[];
    Website: string;
    created_at: any;
    created_by: string;
    deleted_at: null;
    is_profile_updated: string;
    last_login: string;
    updated_at: any;
  }

    interface GuestData {
      guest_id: string;
      guest_name: string;
      guest_email: string;
      password: string;
      appointment_id: string;
      invited_by: any;
  }

async function getUserById(user_id: string) {
  try {
    const response = await axiosInstance.get(`get_user_details/${user_id}`);

    if (response.status === 200) {
      return response.data.data.user as User;
    } else throw new Error('Oops! Something went wrong.');
  } catch (error) {
    throw error;
  }
}

export default function useGetUserById(user_id: string) {
  return useQuery({
    queryKey: ['get_user_detail', user_id],
    queryFn: () => getUserById(user_id),
  });
}
