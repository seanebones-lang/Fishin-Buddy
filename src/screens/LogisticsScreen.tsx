import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { IconButton } from 'react-native-paper';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import LinearGradient from 'expo-linear-gradient';
import Svg, { Path, G } from 'react-native-svg';
import BiteGauge from '@/src/components/BiteGauge';

const { width } = Dimensions.get('window');

const mockForecast = [
  { hour: 6, bite: 45, weather: 'cloudy', phase: 'new' },
  { hour: 9, bite: 78, weather: 'sunny', phase: 'waxing' },
  { hour: 12, bite: 92, weather: 'partly', phase: 'full' },
  { hour: 15, bite: 65, bite: 65, weather: 'windy', phase: 'waning' },
  { hour: 18, bite: 82, weather: 'clear', phase: 'full' },
];

const LogisticsScreen = () => {
  const [currentHour, setCurrentHour] = useState(0);
  const scale = useSharedValue(1);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const speakForecast = () => {
    Speech.speak(`Forecast: ${mockForecast.map(f => `${f.hour}:00 ${f.bite}% bite index`).join(', ')}. Frenzy at noon!`, { language: 'en' });
    Haptics.notificationAsync();
  };

  return (
    <LinearGradient colors={['#0066cc', '#004080']} className="flex-1">
      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row justify-between items-center mb-8">
          <Text className="text-white text-2xl font-bold drop-shadow-2xl">Logistics Forecast</Text>
          <IconButton icon="volume-high" size={28} iconColor="success" onPress={speakForecast} />
        </View>

        {/* Peak Gauge */}
        <View className="items-center mb-12">
          <BiteGauge value={92} size={200} color="frenzy" />
          <Text className="text-white text-4xl font-bold mt-4 drop-shadow-2xl absolute z-10">Peak</Text>
          <Text className="text-white/80 text-lg mt-20 drop-shadow-lg">Today Max</Text>
        </View>

        {/* Hourly Cards */}
        {mockForecast.map((item, i) => (
          <TouchableOpacity
            key={i}
            className={`bg-white/20 backdrop-blur-xl rounded-3xl p-6 mb-6 shadow-2xl shadow-black/30 ${i === currentHour ? 'border-4 border-success/50' : ''}`}
            onPress={() => {
              setCurrentHour(i);
              scale.value = withSpring(1.02, { damping: 20 });
              Haptics.selectionAsync();
            }}
            style={cardStyle}
          >
            <View className="flex-row justify-between items-start mb-4">
              <Text className="text-white font-bold text-3xl drop-shadow-lg">{item.hour}:00</Text>
              <BiteGauge value={item.bite} size={60} color={getGaugeColor(item.bite)} />
            </View>
            <Text className="text-white/90 text-xl font-bold drop-shadow-md mb-2">{item.bite}%</Text>
            <View className="flex-row items-center">
              <Text className="text-warning text-lg">☁️ {item.weather}</Text>
              <Text className="text-success ml-4 text-lg">🌒 {item.phase}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Mock Forecast Graph */}
        <View className="bg-white/10 rounded-3xl p-6 mb-8">
          <Text className="text-white text-lg font-bold mb-4 drop-shadow-lg">Bite Trend</Text>
          <Svg height={120} width={width - 48} viewBox="0 0 300 120">
            <Path
              d="M10 100 Q 80 40 150 30 Q 220 50 270 90 L290 100 L10 100 Z"
              fill="#00cc66"
              opacity={0.8}
            />
            <Path
              d="M10 100 L290 100"
              stroke="#fff"
              strokeWidth="2"
              opacity={0.5}
            />
          </Svg>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

function getGaugeColor(percent: number) {
  if (percent > 85) return 'frenzy';
  if (percent > 70) return 'warning';
  return 'success';
}

export default LogisticsScreen;
