import {createDrawerNavigator} from '@react-navigation/drawer';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import CustomDrawer from '../components/CustomDrawer';
import About from '../screens/About';
import AppointmentDetail from '../screens/AppointmentDetail';
import AppointmentHistory from '../screens/AppointmentHistory';
import AppointmentMeeting from '../screens/AppointmentMeeting';
import DermatoScope from '../screens/DermatoScope';
import Home from '../screens/Home';
import Login from '../screens/Login';
import SelfAssessment from '../screens/SelfAssessment';
import StethoScopeInitialization from '../screens/StethoScopeInitialization';
import StethoScopeInstruction from '../screens/StethoScopeInstruction';
import StethoScopeMeasurement from '../screens/StethoScopeMeasurement';
import MinttiInitalization from '../screens/MinttiInitalization';
import {useSignInStore} from './store/useSignInStore';
import BodyTemperature from '../screens/BodyTemperature';
import BloodGlucose from '../screens/BloodGlucose';
import BloodPressure from '../screens/BloodPressure';
import BloodOxygen from '../screens/BloodOxygen';
import ECG from '../screens/ECG';

export type HomeStackNavigatorParamList = {
  Home: undefined;
  StethoScopeInitilization: {
    testName: string;
    appointmentTestId: string;
  };
  MinttiInitalization: {
    testRoute: string;
  };
  StethoScopeMeasurement: {
    testName: string;
    appointmentTestId: string;
  };
  LiveMeeting: undefined;
  Login: undefined;
  AppointmentDetail: {
    id: string;
  };
  StethoScopeDemo: undefined;
  About: undefined;
  SelfAssessment: {
    testName: string;
    appointmentTestId: string;
  };
  DermatoScope: {
    testName: string;
    appointmentTestId: string;
  };
  History: undefined;
  BodyTemperature: undefined;
  BloodGlucose: undefined;
  BloodPressure: undefined;
  BloodOxygen: undefined;
  ECG: undefined;
};

const Drawer = createDrawerNavigator<HomeStackNavigatorParamList>();
const Stack = createNativeStackNavigator<HomeStackNavigatorParamList>();

export const navigationRef = React.createRef<any>();

export function navigate(name: string, params: any) {
  navigationRef.current?.navigate(name, params);
}

export default function AppNavigation() {
  const {userData} = useSignInStore();

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        {userData ? (
          <>
            <Drawer.Navigator
              drawerContent={props => <CustomDrawer {...props} />}>
              <Drawer.Screen
                name="Home"
                options={{headerShown: false}}
                component={Home}
              />
              <Drawer.Screen
                name="StethoScopeInitilization"
                component={StethoScopeInitialization}
                options={{headerShown: false}}
              />
              <Drawer.Screen
                name="StethoScopeMeasurement"
                component={StethoScopeMeasurement}
                options={{headerShown: false}}
              />
              <Drawer.Screen
                name="LiveMeeting"
                component={AppointmentMeeting}
                options={{headerShown: false}}
              />
              <Drawer.Screen
                name="AppointmentDetail"
                component={AppointmentDetail}
                options={{headerShown: false}}
              />
              <Drawer.Screen
                name="StethoScopeDemo"
                component={StethoScopeInstruction}
                options={{headerShown: false}}
              />
              <Drawer.Screen
                name="About"
                component={About}
                options={{headerShown: false}}
              />
              <Drawer.Screen
                name="SelfAssessment"
                component={SelfAssessment}
                options={{headerShown: false}}
              />
              <Drawer.Screen
                name="DermatoScope"
                component={DermatoScope}
                options={{headerShown: false}}
              />
              <Drawer.Screen
                name="History"
                component={AppointmentHistory}
                options={{headerShown: false}}
              />
              <Drawer.Screen
                name="BodyTemperature"
                component={BodyTemperature}
                options={{headerShown: false}}
              />
              <Drawer.Screen
                name="BloodGlucose"
                component={BloodGlucose}
                options={{headerShown: false}}
              />
              <Drawer.Screen
                name="BloodPressure"
                component={BloodPressure}
                options={{headerShown: false}}
              />
              <Drawer.Screen
                name="BloodOxygen"
                component={BloodOxygen}
                options={{headerShown: false}}
              />
              <Drawer.Screen
                name="ECG"
                component={ECG}
                options={{headerShown: false}}
              />
              <Drawer.Screen
                name="MinttiInitalization"
                component={MinttiInitalization}
                options={{headerShown: false}}
              />
            </Drawer.Navigator>
          </>
        ) : (
          <Stack.Navigator>
            <Stack.Screen
              name="Login"
              options={{headerShown: false}}
              component={Login}
            />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
