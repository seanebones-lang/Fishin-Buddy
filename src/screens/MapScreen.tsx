import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { IconButton } from 'react-native-paper';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const mockPins = [
  { id: '1', lat: 30.27, lng: -97.74, bite: 92, name: 'Lake Travis' },
  { id: '2', lat: 30.4, lng: -98.1, bite: 65, name: 'LLano River' },
];

const MapScreen = () => {
  const bounce = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(1.1) }],
  }));

  const Pin = ({ bite, name, onPress }) => (
    <TouchableOpacity className={`p-3 rounded-full shadow-lg ${bite > 85 ? 'bg-frenzy' : bite > 70 ? 'bg-warning' : 'bg-success'} shadow-current/50`} onPress={onPress} style={bounce}>
      <Text className="text-white font-bold text-lg text-center drop-shadow-md">{bite}%</Text>
      <Text className="text-white/90 text-xs text-center drop-shadow-md">{name}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gradient-to-br from-primary to-gradient-end">
      {/* Mock Map */}
      <View className="flex-1 rounded-t-3xl -mt-24 bg-blue-800/80 shadow-2xl shadow-black/30">
        {/* Austin bounds mock */}
        <View className="absolute inset-0 rounded-t-3xl bg-gradient-to-b from-blue-900/50 to-transparent" />

        {/* Pins positioned mock */}
        <Pin bite={92} name="Travis" onPress={() => { Haptics.impactAsync(); /* nav spot */ }} style={{ position: 'absolute', top: '20%', left: '20%' }} />
        <Pin bite={65} name="LLano" onPress={() => Haptics.impactAsync()} style={{ position: 'absolute', top: '60%', right: '30%' }} />
      </View>

      {/* Bottom Sheet Mock */}
      <View className="bg-white/95 backdrop-blur-xl p-6 rounded-3xl mx-8 -mt-12 shadow-2xl shadow-black/20">
        <IconButton icon="map-marker" size={32} iconColor="primary" />
        <Text className="text-2xl font-bold text-primary text-center mt-2">Austin Area</Text>
        <Text className="text-gray-600 text-center text-lg mt-1">92% frenzy nearby</Text>
      </View>

      {/* Nav */}
      <View className="flex-row justify-around p-4 bg-transparent">
        <IconButton icon="home" mode="contained" onPress={() => {}} />
        <IconButton icon="map" mode="contained-tonal" />
        <IconButton icon="trophy" mode="contained" />
      </View>
    </View>
  );
};

export default MapScreen;
