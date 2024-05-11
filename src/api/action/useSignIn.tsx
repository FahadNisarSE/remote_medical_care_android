import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useState } from 'react';
import axiosInstance from '../../utils/config';
import { useSignInStore } from '../../utils/store/useSignInStore';
import { User } from '../schema/loginSchema';

export async function signIn({
  Email,
  Password,
}: {
  Email: string;
  Password: string;
}) {
  try {
    const {data} = await axiosInstance.post('/signin', {
      Email,
      Password,
    });

    if (data.status === 200) {
      if (data.data.user.RoleName === 'Patient') return data.data.user as User;
      else throw new Error("Please use a patient account to sign in.");
    }

    if (data.status === 401) throw new Error(data.message);

    throw new Error('Oops! Something went wrong.');
  } catch (error) {
    throw error;
  }
}

export default function useSignIn() {
  const [error, setError] = useState<string | null>(null);
  const {setUserData} = useSignInStore();

  const {mutate, isPending} = useMutation({
    mutationKey: ['sign-in'],
    mutationFn: signIn,
    onError: (error: Error | AxiosError) => {
      setError(error.message);
    },
    onSuccess: data => {
      setUserData(data);
    },
  });

  return {
    mutate,
    error,
    isPending,
    setError,
  };
}
