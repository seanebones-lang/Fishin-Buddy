import * as Speech from 'expo-speech';
export const speakBite = (index: number) => Speech.speak(`Bite index: ${index.toFixed(2)}. ${(index>0.7)?'Great spot!':'Try elsewhere.'}`);