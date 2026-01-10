import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider, MD3LightTheme as DefaultTheme } from 'react-native-paper';
import SplashScreen from '@/src/screens/SplashScreen';
import HomeScreen from '@/src/screens/HomeScreen';
import MapScreen from '@/src/screens/MapScreen'; // TODO

import { StatusBar } from 'expo-status-bar';

const Stack = createNativeStackNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: 'rgb(0, 102, 204)',
    onPrimary: 'rgb(255, 255, 255)',
    surface: 'rgba(255,255,255,0.1)',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar style="light" />
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Map" component={MapScreen} />
            {/* TODO: Logistics, Profile */}
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
