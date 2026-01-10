import React from 'react';
import { View, Text, ScrollView, FlatList, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { IconButton } from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import { usePredictions } from '../hooks/usePredictions';
import BiteGauge from '@/src/components/BiteGauge';

const { width: screenWidth } = Dimensions.get('window');

const mockSpots = [
  { id: '1', name: 'Lake Travis', percent: 92, dist: '15min', color: 'frenzy' },
  { id: '2', name: 'Spot B', percent: 65, dist: '8min', color: 'success' },
  { id: '3', name: 'Spot C', percent: 82, dist: '22min', color: 'warning' },
];

const fallbackHourly = Array.from({ length: 12 }, (_, i) => ({
  hour: 6 + i,
  bite: 40 + Math.sin(i / 3) * 40 + i * 2,
}));

const getGaugeColor = (percent: number): any => {
  if (percent > 85) return 'frenzy';
  if (percent > 70) return 'warning';
  if (percent > 50) return 'success';
  return 'default';
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const HomeScreen = ({ userId = 'user_123' }: { userId?: string }) => {
  const { data, loading, error } = usePredictions(userId);
  const gaugeScale = useSharedValue(0);
  const containerOpacity = useSharedValue(0);

  const gaugeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(gaugeScale.value) }],
    opacity: containerOpacity.value,
  }));

  React.useEffect(() => {
    gaugeScale.value = 1;
    containerOpacity.value = withSpring(1, { duration: 800 });
    Haptics.selectionAsync();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-gradient-to-b from-primary to-gradient-start justify-center items-center p-6">
        <ActivityIndicator size="large" color="#fff" />
        <Text className="text-white text-xl mt-4 font-bold drop-shadow-lg">Computing bite frenzy...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-gradient-to-b from-primary to-gradient-start justify-center items-center p-6">
        <Text className="text-white text-xl font-bold drop-shadow-lg">{error}</Text>
        <TouchableOpacity className="mt-4 bg-white/20 p-4 rounded-2xl" onPress={() => window.location.reload()}>
          <Text className="text-white font-bold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const biteIndex = data?.index ?? 78;
  const species = (data?.species ?? 'bass') as string;
  const spots = (data?.spots ?? mockSpots) as typeof mockSpots;
  const hourlyData = data?.hourly ?? fallbackHourly;

  const renderSpot = ({ item }: { item: typeof mockSpots[0] }) => (
    <TouchableOpacity 
      className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 mx-2 shadow-card shadow-primary/30 min-w-[160px] items-center"
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
    >
      <Text className="text-white font-bold text-lg mb-2 text-center tracking-wide drop-shadow-lg">{item.name}</Text>
      <View className="w-20 h-20 mb-2">
        <BiteGauge value={item.percent} size={80} color={item.color} />
      </View>
      <Text className="text-white/80 text-sm text-center drop-shadow-md">{item.dist}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gradient-to-b from-primary to-gradient-start p-6">
      <View className="flex-row justify-between items-center mb-8 pt-4">
        <Text className="text-white/90 text-xl font-bold drop-shadow-lg">🪝 Frenzy Alert!</Text>
        <View className="flex-row items-center">
          <IconButton icon="bell" size={24} iconColor="success" onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)} />
          <Text className="text-success font-bold text-lg drop-shadow-lg">5-day streak</Text>
        </View>
      </View>

      <Animated.View className="items-center mb-12" style={gaugeStyle}>
        <View className="relative w-64 h-64">
          <BiteGauge value={biteIndex} size={256} color={getGaugeColor(biteIndex)} />
          <View className="absolute inset-0 items-center justify-center z-10">
            <Text className="text-5xl font-bold text-white drop-shadow-2xl text-center leading-tight">{biteIndex}</Text>
            <Text className="text-white/80 text-xl font-bold mt-1 drop-shadow-xl">{capitalize(species)} Bite Index</Text>
          </View>
        </View>
      </Animated.View>

      <Text className="text-white text-xl font-bold mb-6 drop-shadow-lg">Top Nearby Spots</Text>
      <FlatList
        data={spots}
        renderItem={renderSpot}
        keyExtractor={(item) => item.id ?? item.name}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        className="mb-12"
        snapToInterval={180}
        decelerationRate="fast"
      />

      <Text className="text-white text-xl font-bold mb-6 drop-shadow-lg">Hourly Forecast</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-4">
        {hourlyData.map((item, i) => (
          <View 
            key={i}
            className={`mx-2 w-20 rounded-2xl bg-white/30 backdrop-blur-sm shadow-xl shadow-black/20 overflow-hidden items-center py-4 px-3 min-h-[120px] ${getGaugeColor(item.bite)}`}
          >
            <Text className="text-white font-bold text-lg drop-shadow-md">{Math.round(item.bite)}%</Text>
            <Text className="text-white/90 text-xs uppercase tracking-wider drop-shadow-sm">{item.hour}:00</Text>
            <View className="w-12 h-2 bg-white/50 rounded-full mt-2 overflow-hidden">
              <View className="h-full bg-white rounded-full" style={{ width: `${Math.min(100, item.bite)}%` }} />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
