import { getCurrentPositionAsync } from 'expo-location';
import { getXAIPrediction } from './xai';
import type { UserPrefs } from '../context/AppContext';

type BiteData = {
  index: number; // 0-100
  species: string;
  spots: Array<{ name: string; percent: number; dist: string; color: 'frenzy' | 'warning' | 'success' | 'default' }>;
  hourly: Array<{ hour: number; bite: number }>;
  recommendations?: {
    bestBait: string;
    bestTime: string;
    notes: string;
  };
};

const getGaugeColor = (percent: number): BiteData['spots'][0]['color'] => {
  if (percent > 85) return 'frenzy';
  if (percent > 70) return 'warning';
  if (percent > 50) return 'success';
  return 'default';
};

// Mock weather data (can be replaced with real OpenWeatherMap API)
async function getWeatherData(lat: number, lng: number) {
  // TODO: Replace with real OpenWeatherMap API
  return {
    temp: 22 + Math.sin(Date.now() / 100000) * 5,
    pressure: 1013 + Math.random() * 10,
    windSpeed: 5 + Math.random() * 10,
    windDirection: Math.random() * 360,
  };
}

// Calculate moon phase (0 = new moon, 1 = full moon)
function getMoonPhase(): number {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Approximate moon phase calculation
  const daysSinceJan1 = Math.floor((date.getTime() - new Date(year, 0, 1).getTime()) / (1000 * 60 * 60 * 24));
  const phase = ((daysSinceJan1 % 29.53) / 29.53);
  return phase;
}

// Get nearby fishing spots (mock data - can be replaced with real location search)
function getNearbySpots(lat: number, lng: number, baseBiteIndex: number) {
  const spots = [
    { name: 'Lake Travis', lat: lat + 0.05, lng: lng + 0.05, baseOffset: 14 },
    { name: 'Local Pond', lat: lat - 0.02, lng: lng + 0.01, baseOffset: -13 },
    { name: 'River Bend', lat: lat + 0.03, lng: lng - 0.04, baseOffset: 4 },
  ];

  return spots.map(spot => {
    const percent = Math.round(Math.min(100, Math.max(0, baseBiteIndex + spot.baseOffset)));
    // Calculate distance (simplified)
    const distKm = Math.sqrt(Math.pow((spot.lat - lat) * 111, 2) + Math.pow((spot.lng - lng) * 111, 2));
    const dist = distKm < 1 ? `${Math.round(distKm * 1000)}m` : `${Math.round(distKm)}km`;
    
    return {
      name: spot.name,
      percent,
      dist,
      color: getGaugeColor(percent),
    };
  });
}

export async function getPredictions(prefs: UserPrefs): Promise<BiteData> {
  try {
    // Get current location
    const { coords } = await getCurrentPositionAsync({ accuracy: 'high' });
    const lat = coords.latitude;
    const lng = coords.longitude;

    // Get weather data
    const weather = await getWeatherData(lat, lng);
    const moonPhase = getMoonPhase();
    const currentTime = new Date().toISOString();

    // Call xAI API for predictions
    const xaiResponse = await getXAIPrediction({
      location: { lat, lng },
      species: prefs.species,
      currentTime,
      weather,
      moonPhase,
    });

    // Get nearby spots with predictions
    const spots = getNearbySpots(lat, lng, xaiResponse.biteIndex);

    // Format hourly forecast
    const hourly = xaiResponse.hourlyForecast.map(f => ({
      hour: f.hour,
      bite: Math.round(f.biteIndex),
    }));

    return {
      index: Math.round(xaiResponse.biteIndex),
      species: prefs.species,
      spots,
      hourly,
      recommendations: xaiResponse.recommendations,
    };
  } catch (error) {
    console.error('Predictions error:', error);
    
    // Fallback to intelligent defaults if everything fails
    const nowHour = new Date().getHours();
    const fallbackIndex = 75; // Good bite conditions
    
    return {
      index: fallbackIndex,
      species: prefs.species,
      spots: [
        { name: 'Lake Travis', percent: 92, dist: '15min', color: 'frenzy' },
        { name: 'Local Pond', percent: 65, dist: '8min', color: 'success' },
        { name: 'River Bend', percent: 82, dist: '22min', color: 'warning' },
      ],
      hourly: Array.from({ length: 12 }, (_, i) => ({
        hour: (nowHour + i) % 24,
        bite: fallbackIndex + Math.sin(i / 3) * 15,
      })),
      recommendations: {
        bestBait: `${prefs.species} specific bait recommended`,
        bestTime: 'Morning or evening',
        notes: 'Fallback prediction - check internet connection',
      },
    };
  }
}
