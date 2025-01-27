import { useState, useCallback } from 'react';
import { getCurrentUser } from '@/services/user';

export default function useUser() {
  const [user, setUser] = useState<API.User | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchUserInfo = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getCurrentUser();
      if (response.success) {
        setUser(response.data);
        return response.data;
      }
      return undefined;
    } catch (error) {
      return undefined;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserInfo = useCallback((newUser: API.User) => {
    setUser(newUser);
  }, []);

  const clearUserInfo = useCallback(() => {
    setUser(undefined);
  }, []);

  return {
    user,
    loading,
    fetchUserInfo,
    updateUserInfo,
    clearUserInfo,
  };
}
