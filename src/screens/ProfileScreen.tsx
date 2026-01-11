import React from 'react';
import { View, Text, ScrollView, FlatList, Dimensions, TouchableOpacity, Image } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { IconButton, Card } from 'react-native-paper';
import * as Haptics from 'expo-haptics';

const { width: screenWidth } = Dimensions.get('window');

const mockStats = {
  totalCatches: 47,
  speciesCaught: 5,
  longestStreak: 12,
  currentStreak: 7,
};

const mockBadges = [
  { id: '1', name: 'Bass Boss', icon: '🎣', color: 'success' },
  { id: '2', name: 'Streak King', icon: '🔥', color: 'warning' },
  { id: '3', name: 'Spot Finder', icon: '📍', color: 'primary' },
];

const mockCatches = [
  { id: '1', uri: 'https://example.com/catch1.jpg', species: 'Bass', weight: '4.2lb' },
  { id: '2', uri: 'https://example.com/catch2.jpg', species: 'Trout', weight: '2.1lb' },
  // Add more mocks as needed
];

const ProfileScreen = () => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value) }],
    opacity: opacity.value,
  }));

  React.useEffect(() => {
    scale.value = 1;
    opacity.value = withSpring(1, { duration: 600 });
    Haptics.selectionAsync();
  }, []);

  const renderBadge = ({ item }) => (
    <TouchableOpacity
      className="bg-white/30 backdrop-blur-sm rounded-2xl p-4 mx-2 items-center shadow-xl shadow-black/20"
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <Text className={`text-2xl mb-1 drop-shadow-md`}>{item.icon}</Text>
      <Text className="text-white font-bold text-sm text-center drop-shadow-lg uppercase tracking-wide">{item.name}</Text>
    </TouchableOpacity>
  );

  const renderCatch = ({ item }) => (
    <TouchableOpacity className="mx-2 rounded-2xl overflow-hidden shadow-2xl shadow-black/30 bg-white/10">
      <Image source={{ uri: item.uri }} className="w-44 h-32 rounded-2xl" />
      <View className="p-3 bg-black/40">
        <Text className="text-white font-bold text-base drop-shadow-md">{item.species}</Text>
        <Text className="text-white/80 text-sm drop-shadow-sm">{item.weight}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gradient-to-b from-primary to-gradient-start p-6">
      {/* Header */}
      <View className="items-center mb-8 pt-4">
        <Animated.View style={animatedStyle} className="w-32 h-32 bg-white/20 rounded-full items-center justify-center mb-4 shadow-2xl shadow-white/30">
          <Text className="text-6xl">👨‍⚕️</Text>
        </Animated.View>
        <Text className="text-white text-2xl font-bold drop-shadow-2xl">Angler Pro</Text>
        <Text className="text-success font-bold text-xl drop-shadow-xl mt-1">{mockStats.currentStreak}-day streak 🔥</Text>
      </View>

      {/* Stats Cards */}
      <View className="flex-row justify-around mb-8">
        <Card className="bg-white/20 backdrop-blur-sm p-6 items-center flex-1 mx-2 shadow-xl shadow-primary/30 rounded-3xl">
          <Text className="text-white text-3xl font-bold drop-shadow-lg">{mockStats.totalCatches}</Text>
          <Text className="text-white/80 text-lg font-bold drop-shadow-md">Total Catches</Text>
        </Card>
        <Card className="bg-white/20 backdrop-blur-sm p-6 items-center flex-1 mx-2 shadow-xl shadow-primary/30 rounded-3xl">
          <Text className="text-white text-3xl font-bold drop-shadow-lg">{mockStats.speciesCaught}</Text>
          <Text className="text-white/80 text-lg font-bold drop-shadow-md">Species</Text>
        </Card>
      </View>

      {/* Badges */}
      <Text className="text-white text-xl font-bold mb-6 drop-shadow-lg">Badges</Text>
      <FlatList
        data={mockBadges}
        renderItem={renderBadge}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        className="mb-8"
      />

      {/* Recent Catches */}
      <Text className="text-white text-xl font-bold mb-6 drop-shadow-lg">Recent Catches</Text>
      <FlatList
        data={mockCatches}
        renderItem={renderCatch}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
      />

      {/* Settings */}
      <View className="mt-8 pt-8 border-t border-white/20">
        <TouchableOpacity className="flex-row items-center p-4 bg-white/20 backdrop-blur-sm rounded-3xl mb-4 shadow-xl shadow-primary/30"
          onPress={() => Haptics.selectionAsync()}
        >
          <IconButton icon="bell-outline" iconColor="white" />
          <Text className="text-white font-bold text-lg flex-1 drop-shadow-lg">Notifications</Text>
          <IconButton icon="chevron-right" iconColor="white/70" size={20} />
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center p-4 bg-white/20 backdrop-blur-sm rounded-3xl mb-4 shadow-xl shadow-primary/30"
          onPress={() => Haptics.selectionAsync()}
        >
          <IconButton icon="settings-outline" iconColor="white" />
          <Text className="text-white font-bold text-lg flex-1 drop-shadow-lg">Settings</Text>
          <IconButton icon="chevron-right" iconColor="white/70" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileScreen;
