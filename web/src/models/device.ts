import { useState, useCallback } from 'react';
import { getDeviceStats } from '@/services/device';

export default function useDevice() {
  const [stats, setStats] = useState<{
    total: number;
    online: number;
    offline: number;
    blocked: number;
  }>({
    total: 0,
    online: 0,
    offline: 0,
    blocked: 0,
  });

  const [loading, setLoading] = useState<boolean>(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getDeviceStats();
      if (response.success) {
        setStats(response.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStats = useCallback((newStats: typeof stats) => {
    setStats(newStats);
  }, []);

  return {
    stats,
    loading,
    fetchStats,
    updateStats,
  };
}
