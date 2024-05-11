import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import React from 'react';
import {Image, Pressable, View} from 'react-native';
import {BASE_IMG_URL} from '../utils/config';
import {useSignInStore} from '../utils/store/useSignInStore';
import CustomTextRegular from './ui/CustomTextRegular';
import CustomTextSemiBold from './ui/CustomTextSemiBold';

export default function CustomDrawer(props: DrawerContentComponentProps) {
  const {userData} = useSignInStore();
  const {removeUserData} = useSignInStore();

  const isRouteActive = (routeName: string) => {
    const state = props.navigation.getState();
    const currentRoute = state.routes[state.index].name;
    return currentRoute === routeName;
  };

  return (
    <View className="flex-1 bg-[#052438]">
      <View className="mx-3 my-4 overflow-hidden rounded-lg">
        <View className="relative">
          <Image
            source={require('../assets/images/background.png')}
            className="absolute inset-0 w-full h-full"
            style={{objectFit: 'cover'}}
          />
          <View className="p-3 py-5">
            <View className="items-center">
              <Image
                className="w-16 h-16 rounded-full"
                source={{uri: `${BASE_IMG_URL}${userData?.ProfileImg}`}}
                alt="username"
                style={{objectFit: 'cover'}}
              />
              <View className="items-center mt-4">
                <CustomTextSemiBold className="text-lg text-white">
                  {`${userData?.Firstname} ${userData?.Lastname}`}
                </CustomTextSemiBold>
                <CustomTextRegular className="mt-1 text-xs text-white">
                  {userData?.Email}
                </CustomTextRegular>
              </View>
            </View>
          </View>
        </View>
      </View>
      <DrawerContentScrollView {...props}>
        <DrawerItem
          {...props}
          style={{marginTop: 4, marginHorizontal: 12}}
          label="Home"
          focused={isRouteActive('Home')}
          activeBackgroundColor="#46b98d"
          activeTintColor="#000000"
          labelStyle={{fontFamily: 'Inter-SemiBold', color: 'white'}}
          icon={() => (
            <Image
              source={require('../assets/icons/home.png')}
              alt="Home"
              style={{width: 20, height: 20}}
            />
          )}
          onPress={() => props.navigation.navigate('Home')}
        />
        <DrawerItem
          {...props}
          style={{marginTop: 4, marginHorizontal: 12}}
          label="About us"
          focused={isRouteActive('AboutUs')}
          activeBackgroundColor="#46b98d"
          activeTintColor="#000000"
          labelStyle={{fontFamily: 'Inter-SemiBold', color: 'white'}}
          icon={() => (
            <Image
              source={require('../assets/icons/information.png')}
              alt="AboutUs"
              style={{width: 17, height: 17}}
            />
          )}
          onPress={() => props.navigation.navigate('AboutUs')}
        />
      </DrawerContentScrollView>
      <Pressable
        onPress={() => {
          props.navigation.closeDrawer();
          props.navigation.navigate('Home')
          setTimeout(() => removeUserData(), 100)
        }}
        className="flex-row px-4 py-3 mx-2 mt-auto mb-3 bg-white rounded-lg">
        <Image
          source={require('../assets/icons/log-out.png')}
          alt="Log out"
          className="w-5 h-5"
        />
        <CustomTextSemiBold className="ml-6 text-text">
          Logout
        </CustomTextSemiBold>
      </Pressable>
    </View>
  );
}
