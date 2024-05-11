import {useMutation} from '@tanstack/react-query';
import axiosInstance from '../../utils/config';

async function inviteGuest(data: {
  appointment_id: string | null;
  guest_name: string;
  guest_email: string;
  invited_by: string | null;
}) {
  const {appointment_id, guest_name, guest_email, invited_by} = data;

  try {
    const res = await axiosInstance.post('invite_to_meeting', {
      appointment_id,
      guest_name,
      guest_email,
      invited_by,
    });

    if (res?.data?.status === 200) {
      return 'Guest invite successfully.';
    } else {
      console.log("Res from backend: ", res.data)
      throw new Error(res?.data?.message as string);
    }
  } catch (error) {
    console.log("Error: ", error)
    throw error;
  }
}

export default function useInviteGuest() {
  return useMutation({
    mutationKey: ['invite_guest'],
    mutationFn: inviteGuest,
  });
}
