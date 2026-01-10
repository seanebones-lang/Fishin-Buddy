import React from 'react';
import { View, Text, ScrollView, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { IconButton } from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import BiteGauge from '@/src/components/BiteGauge';

const { width: screenWidth } = Dimensions.get('window');

const mockBiteIndex = 78;
const mockSpots = [
  { id: '1', name: 'Lake Travis', percent: 92, dist: '15min', color: 'frenzy' },
  { id: '2', name: 'Spot B', percent: 65, dist: '8min', color: 'success' },
  { id: '3', name: 'Spot C', percent: 82, dist: '22min', color: 'warning' },
];

const getGaugeColor = (percent: number): keyof React.ComponentProps<typeof BiteGauge>['color'] => {
  if (percent > 85) return 'frenzy';
  if (percent > 70) return 'warning';
  if (percent > 50) return 'success';
  return 'default';
};

const HomeScreen = () => {
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

  const renderSpot = ({ item }) => (
    <TouchableOpacity 
      className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 mx-2 shadow-card shadow-primary/30 min-w-[160px] items-center"
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
    >
      <Text className="text-white font-bold text-lg mb-2 text-center tracking-wide drop-shadow-lg">{item.name}</Text>
      <View className="w-20 h-20 mb-2">
        <BiteGauge value={item.percent} size={80} color={item.color as any} />
      </View>
      <Text className="text-white/80 text-sm text-center drop-shadow-md">{item.dist}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gradient-to-b from-primary to-gradient-start p-6">
      {/* Header: Alerts/Streak */}
      <View className="flex-row justify-between items-center mb-8 pt-4">
        <Text className="text-white/90 text-xl font-bold drop-shadow-lg">🪝 Frenzy Alert!</Text>
        <View className="flex-row items-center">
          <IconButton icon="bell" size={24} iconColor="success" onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)} />
          <Text className="text-success font-bold text-lg drop-shadow-lg">5-day streak</Text>
        </View>
      </View>

      {/* Bite Gauge */}
      <Animated.View className="items-center mb-12" style={gaugeStyle}>
        <View className="relative w-64 h-64">
          <BiteGauge value={mockBiteIndex} size={256} color={getGaugeColor(mockBiteIndex)} />
          <View className="absolute inset-0 items-center justify-center z-10">
            <Text className="text-5xl font-bold text-white drop-shadow-2xl text-center leading-tight">{mockBiteIndex}</Text>
            <Text className="text-white/80 text-xl font-bold mt-1 drop-shadow-xl">Bass Bite Index</Text>
          </View>
        </View>
      </Animated.View>

      {/* Top Spots Carousel */}
      <Text className="text-white text-xl font-bold mb-6 drop-shadow-lg">Top Nearby Spots</Text>
      <FlatList
        data={mockSpots}
        renderItem={renderSpot}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        className="mb-12"
        snapToInterval={180}
        decelerationRate="fast"
      />

      {/* Hourly Timeline */}
      <Text className="text-white text-xl font-bold mb-6 drop-shadow-lg">Hourly Forecast</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-4">
        {Array.from({ length: 12 }, (_, i) => ({
          hour: 6 + i,
          bite: 40 + Math.sin(i / 3) * 40 + i * 2,
        })).map((item, i) => (
          <View key={i} className={`mx-2 w-20 rounded-2xl bg-white/30 backdrop-blur-sm shadow-xl shadow-black/20 overflow-hidden ${getGaugeColor(item.bite)} items-center py-4 px-3 min-h-[120px]`}>
            <Text className="text-white font-bold text-lg drop-shadow-md">{Math.round(item.bite)}%</Text>
            <Text className="text-white/90 text-xs uppercase tracking-wider drop-shadow-sm">{item.hour}:00</Text>
            <View className="w-12 h-2 bg-white/50 rounded-full mt-2 overflow-hidden">
              <View className={`h-full bg-white rounded-full`} style={{ width: `${Math.min(100, item.bite)}%` }} />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
