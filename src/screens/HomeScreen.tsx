import React from 'react';
import { View, Text, ScrollView, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { IconButton } from 'react-native-paper';
import * as Haptics from 'expo-haptics';

const { width: screenWidth } = Dimensions.get('window');

const mockBiteIndex = 78;
const mockSpots = [
  { id: '1', name: 'Lake Travis', percent: 92, dist: '15min', color: 'frenzy' },
  { id: '2', name: 'Spot 2', percent: 65, dist: '8min', color: 'success' },
  { id: '3', name: 'Spot 3', percent: 82, dist: '22min', color: 'warning' },
];

const colorMap = {
  success: '#00cc66',
  warning: '#ffaa00',
  frenzy: '#ff4444',
};

const HomeScreen = () => {
  const gaugeScale = useSharedValue(0);

  const gaugeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(gaugeScale.value) }],
  }));

  React.useEffect(() => {
    gaugeScale.value = 1;
    Haptics.selectionAsync();
  }, []);

  const renderSpot = ({ item }) => (
    <TouchableOpacity className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mx-2 shadow-card shadow-primary/30 min-w-[160px]" onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
      <Text className="text-white font-bold text-lg">{item.name}</Text>
      <View className="flex-row items-center mt-2">
        <Text className={`text-2xl font-bold text-${item.color}`}>{item.percent}%</Text>
        <Text className="text-white/80 ml-2 text-sm">{item.dist}</Text>
      </View>
    </TouchableOpacity>
  );

  const getColorClass = (percent: number) => {
    if (percent > 85) return 'text-frenzy bg-frenzy/20';
    if (percent > 70) return 'text-warning bg-warning/20';
    if (percent > 50) return 'text-success bg-success/20';
    return 'text-gray-400 bg-gray-200/20';
  };

  return (
    <View className="flex-1 bg-gradient-to-b from-primary to-gradient-start p-6">
      {/* Header: Alerts/Streak */}
      <View className="flex-row justify-between items-center mb-8">
        <Text className="text-white/90 text-xl font-bold">Frenzy Alert!</Text>
        <View className="flex-row">
          <IconButton icon="bell" size={24} iconColor="success" onPress={() => Haptics.notificationAsync()} />
          <Text className="text-success font-bold">5-day streak</Text>
        </View>
      </View>

      {/* Bite Gauge */}
      <Animated.View className={`w-64 h-64 mx-auto rounded-full p-8 shadow-gauge justify-center items-center ${getColorClass(mockBiteIndex)}`} style={gaugeStyle}>
        <Text className="text-4xl font-bold drop-shadow-2xl">{mockBiteIndex}%</Text>
        <Text className="text-white/80 text-center mt-2 text-lg">Bass Bite Index</Text>
      </Animated.View>

      {/* Top Spots Carousel */}
      <Text className="text-white text-xl font-bold mt-12 mb-4">Top Spots</Text>
      <FlatList
        data={mockSpots}
        renderItem={renderSpot}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        className="mb-8"
      />

      {/* Hourly Timeline Mock */}
      <Text className="text-white text-xl font-bold mb-4">Hourly Forecast</Text>
      <ScrollView horizontal className="mb-8">
        {[1,2,3,4,5,6,7,8].map((h, i) => (
          <View key={i} className={`mx-1 w-16 h-24 rounded-lg bg-white/20 ${getColorClass(50 + i*5)} justify-end p-3 shadow-lg"}>
            <Text className="text-white font-bold text-center">{60 + i*3}%</Text>
            <Text className="text-white/80 text-xs text-center">{8 + i}:00</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
