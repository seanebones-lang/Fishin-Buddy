import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  ScrollView,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { useRouter } from '@react-navigation/native';
import { Button, Slider, Checkbox, Card, Title, Paragraph } from 'react-native-paper';
import LottieView from 'lottie-react-native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { supabase } from '../lib/supabase';

import { styles } from '../styles'; // Assume shared styles

type Species = 'bass' | 'trout' | 'salmon' | 'pike';

const speciesList: Species[] = ['bass', 'trout', 'salmon', 'pike'];

const OnboardingScreen = () => {
  const router = useRouter();
  const [skillLevel, setSkillLevel] = useState(3);
  const [selectedSpecies, setSelectedSpecies] = useState<Set<Species>>(new Set());
  const [homeLocation, setHomeLocation] = useState<{lat: number; lng: number} | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkProfile();
    requestLocation();
  }, []);

  const checkProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase.from('profiles').select('id').eq('id', session.user.id).single();
      if (data) {
        router.replace('Home');
      }
    } else {
      // Anon sign in
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) Alert.alert('Error', error.message);
    }
  };

  const requestLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed for location');
      return;
    }
    let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    setHomeLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
  };

  const handleSubmit = async () => {
    if (!homeLocation || selectedSpecies.size === 0) {
      Alert.alert('Please select species and allow location');
      return;
    }

    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const prefs = Array.from(selectedSpecies);

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: session!.user.id,
        species_prefs: prefs,
        home_lat: homeLocation.lat,
        home_lng: homeLocation.lng,
        skill_level: ['beginner', 'intermediate', 'advanced'][Math.floor(skillLevel / 3)],
      });

    if (error) {
      Alert.alert('Error saving profile', error.message);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/Home');
    }
    setLoading(false);
  };

  const toggleSpecies = (species: Species) => {
    const newSet = new Set(selectedSpecies);
    if (newSet.has(species)) {
      newSet.delete(species);
    } else {
      newSet.add(species);
    }
    setSelectedSpecies(newSet);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={{ alignItems: 'center', padding: 20 }}>
        <LottieView source={require('../../assets/animations/fishing.json')} autoPlay loop style={{ width: 200, height: 200 }} /> {/* Add Lottie */}
        <Title style={{ marginVertical: 20 }}>Welcome to Bitecast!</Title>
        <Paragraph>Setup your prefs:</Paragraph>

        <Card style={{ marginVertical: 10, width: '100%' }}>
          <Card.Content>
            <Text>Skill Level</Text>
            <Slider value={skillLevel} onValueChange={setSkillLevel} maxValue={8} />
          </Card.Content>
        </Card>

        <Text>Select favorite species:</Text>
        {speciesList.map((species) => (
          <Checkbox.Item
            key={species}
            label={species.toUpperCase()}
            status={selectedSpecies.has(species) ? 'checked' : 'unchecked'}
            onPress={() => toggleSpecies(species)}
          />
        ))}

        <Text>Home location: {homeLocation ? `${homeLocation.lat.toFixed(4)}, ${homeLocation.lng.toFixed(4)}` : 'Loading...'}</Text>

        <Button mode="contained" onPress={handleSubmit} loading={loading} style={{ marginTop: 20 }}>
          Get Started
        </Button>
      </View>
    </ScrollView>
  );
};

export default OnboardingScreen;
