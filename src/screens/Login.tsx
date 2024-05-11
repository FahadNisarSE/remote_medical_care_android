import {zodResolver} from '@hookform/resolvers/zod';
import React, {useEffect, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Button from '../components/ui/Button';
import CustomTextRegular from '../components/ui/CustomTextRegular';
import CustomTextSemiBold from '../components/ui/CustomTextSemiBold';
import ExternalLink from '../components/ui/ExternalLink';
import {TLoginUserSchema, loginUserSchema} from '../api/schema/loginSchema';
import globalStyles from '../styles/style';
import useSignIn from '../api/action/useSignIn';
import AppUpdating from '../components/AppUpdating';

const {width, height} = Dimensions.get('window');

export default function Login({}) {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {mutate, error, isPending, setError} = useSignIn();

  async function signInRequest(data: TLoginUserSchema) {
    mutate({Email: data.email, Password: data.password});
  }

  const {control, handleSubmit, setValue} = useForm({
    resolver: zodResolver(loginUserSchema),
  });

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setIsKeyboardOpen(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboardOpen(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleInputChange = (feild: string, value: string) => {
    setValue(feild, value.trim());
  };

  return (
    <>
      <AppUpdating />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <StatusBar backgroundColor="#46B98D" />
        {/* Error Message */}
        {error ? (
          <View className="absolute z-10 flex-row items-center justify-between p-2 bg-red-500 rounded-md shadow shadow-black top-4 left-4 right-4">
            <CustomTextSemiBold className="text-white">
              {error}
            </CustomTextSemiBold>
            <Pressable
              onPress={() => setError(null)}
              className="p-1 bg-white rounded-full">
              <Image
                source={require('../assets/icons/x.png')}
                alt="Close"
                className="w-5 h-5"
              />
            </Pressable>
          </View>
        ) : null}
        <View className="flex justify-end flex-1 bg-slate-800">
          <CustomTextSemiBold className="font-semibold text-center text-white text-mh">
            Welcome Back!
          </CustomTextSemiBold>
          <CustomTextRegular className="mb-4 text-base text-center text-white">
            Log in to your account
          </CustomTextRegular>
          <View style={styles.loginContainer} className="py-10 bg-white">
            <Image
              style={{width: width * 0.7, height: height * 0.05}}
              resizeMode="contain"
              className="mx-auto mb-8"
              source={require('../assets/images/icon.png')}
              alt="Remote Medical Care"
            />
            <View className="my-auto">
              <Controller
                control={control}
                name="email"
                render={({
                  field: {onChange, onBlur, value},
                  fieldState: {error},
                }) => (
                  <View>
                    <TextInput
                      placeholderTextColor="rgb(31 41 55)"
                      onChangeText={value => {
                        onChange(value);
                        if (value.trim() !== '')
                          handleInputChange('email', value);
                      }}
                      onBlur={onBlur}
                      style={globalStyles.fontRegular}
                      value={value}
                      placeholder="Email"
                      keyboardType="email-address"
                      className={`w-full h-12 px-2 py-4 mt-4 text-text ${
                        error?.message ? 'border-red-500' : 'border-gray-200'
                      } border rounded-lg`}
                      autoCorrect={false}
                      autoCapitalize="none"
                    />
                    <Text
                      style={{color: 'red', opacity: error?.message ? 100 : 0}}>
                      {error?.message}
                    </Text>
                  </View>
                )}
              />
              <Controller
                control={control}
                name="password"
                render={({field: {onChange, value}, fieldState: {error}}) => (
                  <View className="relative">
                    {showPassword ? (
                      <TouchableOpacity
                        className="absolute z-30 flex items-center justify-center w-8 h-8 top-4 right-4"
                        onPress={() => setShowPassword(false)}>
                        <Image
                          className="w-4 h-4"
                          source={require('../assets/icons/eye.png')}
                          alt="hide passowrd"
                        />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        className="absolute z-30 flex items-center justify-center w-8 h-8 top-4 right-4"
                        onPress={() => setShowPassword(true)}>
                        <Image
                          className="w-4 h-4"
                          source={require('../assets/icons/eye-off.png')}
                          alt="show password"
                        />
                      </TouchableOpacity>
                    )}
                    <TextInput
                      placeholderTextColor="rgb(31 41 55)"
                      onChangeText={value => {
                        onChange(value);
                        handleInputChange('password', value);
                      }}
                      style={globalStyles.fontRegular}
                      value={value}
                      placeholder="Password"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      className={`w-full h-12 px-2 py-4 mt-2 mb-auto text-text border ${
                        error?.message ? 'border-red-500' : 'border-gray-200'
                      } rounded-lg`}
                      autoCorrect={false}
                    />
                    <Text
                      style={{color: 'red', opacity: error?.message ? 100 : 0}}>
                      {error?.message}
                    </Text>
                  </View>
                )}
              />
              <Button
                disabled={isPending}
                text={isPending ? 'Signing you in...' : 'Sign in'}
                onPress={handleSubmit(signInRequest)}
                className="mt-8 w-fit"
              />
            </View>
            {!isKeyboardOpen ? (
              <View className="mt-auto">
                <CustomTextRegular
                  className="w-10/12 mx-auto text-sm text-center text-text"
                  style={{lineHeight: 25}}>
                  By clicking sign in, You agree to{' '}
                  <ExternalLink
                    buttonText="Privacy Policy"
                    url="https://remotemedtech.com/data-privacy.html"
                    className="text-green"
                  />{' '}
                  of Remote Medical Care.
                </CustomTextRegular>
              </View>
            ) : null}
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  image: {
    flex: 1,
    justifyContent: 'center',
  },
  loginContainer: {
    height: '80%',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingHorizontal: 20,
  },
});
