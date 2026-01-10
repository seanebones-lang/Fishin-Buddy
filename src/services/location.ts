// src/services/location.ts
import * as Location from 'expo-location';
import { useState, useEffect } from 'react';

export const useAppLocation = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle');

  useEffect(() => {
    const requestLocation = async () => {
      setStatus('loading');
      const { status: permStatus } = await Location.requestForegroundPermissionsAsync();
      if (permStatus !== 'granted') {
        setError('Location permission denied');
        setStatus('denied');
        return;
      }
      setStatus('granted');

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation(loc);
    };

    requestLocation();
  }, []);

  return { location, error, status };
};

// Background location task (for geofence later)
export const startLocationUpdates = async () => {
  await Location.startLocationUpdatesAsync('BiteCast-Location', {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: 5000,
    distanceInterval: 10,
  });
};
