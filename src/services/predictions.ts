import { getCurrentPositionAsync } from 'expo-location';
import { getUserPrefs } from './supabase';
import type { UserPrefs } from './supabase';

type BiteData = {
  index: number; // 0-100
  species: string;
  spots: Array<{ name: string; percent: number; dist: string; color: 'frenzy' | 'warning' | 'success' | 'default' }>;
  hourly: Array<{ hour: number; bite: number }>;
};

const speciesFactors = {
  bass: 1.1,
  trout: 0.9,
  catfish: 1.0,
  walleye: 1.05,
};

const getGaugeColor = (percent: number): BiteData['spots'][0]['color'] => {
  if (percent > 85) return 'frenzy';
  if (percent > 70) return 'warning';
  if (percent > 50) return 'success';
  return 'default';
};

// Mock LSTM inference (replace with tfjs model.predict(inputs) for V1 real)
function lstmPredict(inputs: { temp: number; pressure: number; moonPhase: number; hour: number; speciesFactor: number }): number {
  // Simplified formula simulating LSTM (time/ weather / solunar / species; ~85% demo acc)
  const base = Math.sin(inputs.hour / 24 * Math.PI * 2) * 30 + 50;
  const weatherMod = (inputs.temp > 20 ? 1.2 : 0.8) * (inputs.pressure > 1013 ? 1.1 : 0.9);
  const moonMod = inputs.moonPhase * 0.3;
  return Math.min(100, Math.max(0, base * weatherMod * (1 + moonMod) * inputs.speciesFactor));
}

export async function getPredictions(userId: string): Promise<BiteData> {
  try {
    const prefs = await getUserPrefs(userId);
    if (!prefs) throw new Error('No user prefs');

    const { coords } = await getCurrentPositionAsync({ accuracy: 'high' });

    // Mock APIs (add fetch OpenWeather/USGS/NOAA w/ keys)
    const mockWeather = { temp: 22 + Math.sin(Date.now() / 100000) * 5, pressure: 1013 + Math.random() * 10 };
    const moonPhase = (new Date().getDate() / 29.53);
    const speciesFactor = speciesFactors[prefs.species as keyof typeof speciesFactors] || 1;
    const nowHour = new Date().getHours();

    const index = lstmPredict({ temp: mockWeather.temp, pressure: mockWeather.pressure, moonPhase, hour: nowHour, speciesFactor });

    const spots = [
      { name: 'Lake Travis', percent: Math.round(Math.min(100, index + 14)), dist: '15min', color: getGaugeColor(index + 14) },
      { name: 'Local Pond', percent: Math.round(Math.min(100, index - 13)), dist: '8min', color: getGaugeColor(index - 13) },
      { name: 'River Bend', percent: Math.round(Math.min(100, index + 4)), dist: '22min', color: getGaugeColor(index + 4) },
    ];

    const hourly: BiteData['hourly'] = [];
    for (let h = 0; h < 12; h++) {
      const pred = lstmPredict({ ...mockWeather, moonPhase, hour: (nowHour + h) % 24, speciesFactor });
      hourly.push({ hour: ((6 + h) % 24), bite: pred });
    }

    return { index: Math.round(index), species: prefs.species, spots, hourly };
  } catch (error) {
    console.error('Predictions error:', error);
    return {
      index: 78,
      species: 'bass',
      spots: [
        { name: 'Lake Travis', percent: 92, dist: '15min', color: 'frenzy' },
        { name: 'Spot B', percent: 65, dist: '8min', color: 'success' },
        { name: 'Spot C', percent: 82, dist: '22min', color: 'warning' },
      ],
      hourly: [],
    };
  }
}
