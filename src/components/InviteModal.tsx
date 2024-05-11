import {zodResolver} from '@hookform/resolvers/zod';
import React from 'react';
import {Controller, useForm} from 'react-hook-form';
import {Alert, Text, TextInput, View} from 'react-native';
import {z} from 'zod';
import useInviteGuest from '../api/action/useInviteGuest';
import {InviteSchema} from '../api/schema/InviteSchema';
import globalStyles from '../styles/style';
import {useMeetingOngoingStore} from '../utils/store/useMeetingOgoingStore';
import Button from './ui/Button';
import CustomTextSemiBold from './ui/CustomTextSemiBold';
import {useSignInStore} from '../utils/store/useSignInStore';
import Toast from 'react-native-toast-message';

interface inviteModalProps {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function InviteModal({setShowModal}: inviteModalProps) {
  const form = useForm<z.infer<typeof InviteSchema>>({
    resolver: zodResolver(InviteSchema),
    defaultValues: {
      email: '',
      username: '',
    },
  });
  const {mutate, isPending} = useInviteGuest();
  const {appointmentId} = useMeetingOngoingStore();
  const {userData} = useSignInStore();

  const handleInputChange = (feild: 'email' | 'username', value: string) => {
    form.setValue(feild, value);
  };

  const inviteGuest = (email: string, username: string) => {
    if (appointmentId && userData?.Id) {
      mutate(
        {
          appointment_id: appointmentId,
          guest_email: email,
          guest_name: username,
          invited_by: userData?.Id,
        },
        {
          onSuccess: () => {
            Toast.show({
              type: 'success',
              text1: `${username} Invited Successfully.`,
            });
            setShowModal(false);
          },
          onError: error => {
            Alert.alert(
              'Error!',
              error?.message || 'Something went wrong please try again.',
            );
          },
        },
      );
    }
  };

  return (
    <View className="flex-1 w-full">
      <CustomTextSemiBold className="my-auto text-2xl text-text">
        Invite Users:
      </CustomTextSemiBold>
      <Controller
        control={form.control}
        name="email"
        render={({field: {onChange, value}, fieldState: {error}}) => (
          <View className="relative">
            <TextInput
              placeholderTextColor="rgb(31 41 55)"
              onChangeText={value => {
                onChange(value);
                handleInputChange('email', value);
              }}
              style={globalStyles.fontRegular}
              value={value}
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              className={`w-full h-12 px-2 py-4mb-auto text-text border ${
                error?.message ? 'border-red-500' : 'border-gray-200'
              } rounded-lg`}
              autoCorrect={false}
            />
            <Text style={{color: 'red', opacity: error?.message ? 100 : 0}}>
              {error?.message}
            </Text>
          </View>
        )}
      />
      <Controller
        control={form.control}
        name="username"
        render={({field: {onChange, onBlur, value}, fieldState: {error}}) => (
          <View>
            <TextInput
              placeholderTextColor="rgb(31 41 55)"
              onChangeText={value => {
                onChange(value);
                if (value.trim() !== '') handleInputChange('username', value);
              }}
              onBlur={onBlur}
              style={globalStyles.fontRegular}
              value={value}
              placeholder="Username"
              className={`w-full h-12 px-2 py-4 text-text ${
                error?.message ? 'border-red-500' : 'border-gray-200'
              } border rounded-lg`}
              autoCorrect={false}
              autoCapitalize="words"
            />
            <Text style={{color: 'red', opacity: error?.message ? 100 : 0}}>
              {error?.message}
            </Text>
          </View>
        )}
      />
      <Button
        disabled={false}
        text={isPending ? 'Sending...`' : 'Send Invite'}
        onPress={form.handleSubmit(({email, username}) =>
          inviteGuest(email, username),
        )}
        className="mt-auto w-fit"
      />
    </View>
  );
}
