import React, { useEffect } from 'react';
import { View, Text, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';

const { height: screenHeight } = Dimensions.get('window');

const SplashScreen = () => {
  const navigation = useNavigation();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  useEffect(() => {
    // Initial haptic tug
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    scale.value = withRepeat(withTiming(1.05, { duration: 1000 }), -1, true);

    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 500 }, () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        navigation.replace('Home'); // TODO: Home screen
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 bg-gradient-to-b from-gradient-start to-primary justify-center items-center p-8">
      <StatusBar style="light" />
      <Animated.View className="animate-ripple shadow-2xl rounded-3xl p-12" style={animatedStyle}>
        <Text className="text-6xl font-logo text-white tracking-wide drop-shadow-2xl animate-tug">
          BiteCast
        </Text>
        <Text className="text-xl font-bold text-success mt-4 text-center drop-shadow-lg">
          Reel in glory!
        </Text>
      </Animated.View>
    </View>
  );
};

export default SplashScreen;
