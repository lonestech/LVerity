import { useQuery } from 'react-query';
import { licenseService } from '../services/license';
import { LicenseActivation } from '../models/license';

/**
 * 获取许可证激活记录的React Query钩子
 * @param licenseId 许可证ID
 * @returns 查询结果
 */
export const useLicenseActivations = (licenseId: string | undefined) => {
  return useQuery<LicenseActivation[], Error>(
    ['licenseActivations', licenseId],
    async () => {
      if (!licenseId) {
        return [];
      }
      
      const response = await licenseService.getLicenseActivations(licenseId);
      
      if (!response.success) {
        throw new Error(response.message || '获取许可证激活记录失败');
      }
      
      return response.data;
    },
    {
      enabled: !!licenseId, // 只有在许可证ID存在时才执行查询
      staleTime: 5 * 60 * 1000, // 5分钟内数据保持新鲜
      cacheTime: 10 * 60 * 1000, // 10分钟内缓存数据
      refetchOnWindowFocus: false, // 窗口获得焦点时不重新获取数据
      retry: 1, // 失败时最多重试1次
      onError: (error) => {
        console.error('获取许可证激活记录失败:', error);
      }
    }
  );
};
