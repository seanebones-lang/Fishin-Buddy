import { useState, useEffect, useCallback } from 'react';
import { getPredictions } from '../services/predictions';
import type { UserPrefs } from '../context/AppContext';

type BiteData = Awaited<ReturnType<typeof getPredictions>>;

export function usePredictions(prefs: UserPrefs) {
  const [data, setData] = useState<BiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const newData = await getPredictions(prefs);
      setData(newData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prediction failed');
    } finally {
      setLoading(false);
    }
  }, [prefs]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
