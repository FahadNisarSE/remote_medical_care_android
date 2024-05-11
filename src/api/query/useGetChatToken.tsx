import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../utils/config';

type Tokens = {
  appToken: string;
  userToken: string;
};

export async function getChatAppToken(user_id: string) {
  try {
    const {data:data1} = await axiosInstance.get('/agora/get_chat_app_token');
    const {data:data2} = await axiosInstance.get(`/agora/get_chat_user_token/${user_id}`);

    if (data1.status === 200 && data2.status === 200) {
      return {
        appToken: data1.data,
        userToken: data2.data,
      } as Tokens;
    } else throw new Error('Oops! Something went wrong.');
  } catch (error) {
    throw error;
  }
}

export default function useGetChatTokens(user_id: string) {
  return useQuery({
    queryKey: ['get_chat_app_token'],
    queryFn: () => getChatAppToken(user_id),
  });
}
