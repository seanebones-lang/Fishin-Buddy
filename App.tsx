import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider, MD3LightTheme as DefaultTheme } from 'react-native-paper';
import SplashScreen from '@/src/screens/SplashScreen';
import OnboardingScreen from '@/src/screens/OnboardingScreen';
import HomeScreen from '@/src/screens/HomeScreen';
import MapScreen from '@/src/screens/MapScreen';
import LogisticsScreen from '@/src/screens/LogisticsScreen';
import ProfileScreen from '@/src/screens/ProfileScreen'; // TODO: Create

import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/src/context/AuthContext';

const Stack = createNativeStackNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: 'rgb(0, 102, 204)',
    onPrimary: 'rgb(255, 255, 255)',
    surface: 'rgba(255,255,255,0.12)',
    elevation: {
      level1: 'rgba(0,0,0,0.08)',
    },
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar style="light" />
        <AuthProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
              <Stack.Screen name="Splash" component={SplashScreen} options={{ animation: 'fade' }} />
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Map" component={MapScreen} />
              <Stack.Screen name="Logistics" component={LogisticsScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
