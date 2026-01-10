import { useState, useEffect, useCallback } from 'react';
import { getPredictions } from '../services/predictions';

type BiteData = Awaited<ReturnType<typeof getPredictions>>;

export function usePredictions(userId: string) {
  const [data, setData] = useState<BiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const newData = await getPredictions(userId);
      setData(newData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prediction failed');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
