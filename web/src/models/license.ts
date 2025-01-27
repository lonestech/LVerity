import { useState, useCallback } from 'react';
import { getLicenseStats } from '@/services/license';

export default function useLicense() {
  const [stats, setStats] = useState<{
    total: number;
    active: number;
    expired: number;
    inactive: number;
  }>({
    total: 0,
    active: 0,
    expired: 0,
    inactive: 0,
  });

  const [loading, setLoading] = useState<boolean>(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getLicenseStats();
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
