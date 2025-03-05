import { RequestData } from '@ant-design/pro-components';
import { ApiResponse } from '../models/common';
import { message } from 'antd';

/**
 * 将ProTable的请求参数转换为后端API查询参数
 * @param params ProTable请求参数
 * @param keywordField 关键词字段名
 * @returns 格式化后的查询参数
 */
export const formatProTableParams = <T>(
  params: Record<string, any>,
  keywordField: string = 'keyword'
): T => {
  // 筛选出有效字段，过滤掉ProTable内部字段
  const validParams = Object.fromEntries(
    Object.entries(params).filter(
      ([key]) => !['current', 'pageSize', '_timestamp'].includes(key)
    )
  );

  // 转换参数
  return {
    ...validParams,
    page: params.current,
    pageSize: params.pageSize,
  } as unknown as T;
};

/**
 * 处理排序参数
 * @param sort ProTable排序参数
 * @returns 排序字段和顺序
 */
export const formatSortParams = (sort: Record<string, 'ascend' | 'descend'> = {}) => {
  const sortField = Object.keys(sort)[0];
  if (!sortField) return {};
  
  return {
    sortBy: sortField,
    sortOrder: sort[sortField] === 'ascend' ? 'asc' : 'desc',
  };
};

/**
 * 确保数据结构符合ProTable要求
 * @param rawData 原始数据
 * @returns 处理后的数据
 */
export const ensureProTableData = <T>(rawData: any): { items: T[]; total: number } => {
  // 如果数据为空或无效，返回空数组
  if (!rawData) {
    return { items: [], total: 0 };
  }
  
  // 处理items字段
  let items: T[] = [];
  if (Array.isArray(rawData.items)) {
    items = rawData.items;
  } else if (Array.isArray(rawData.list)) {
    items = rawData.list;
  } else if (Array.isArray(rawData)) {
    items = rawData;
  }
  
  // 处理total字段
  let total = 0;
  if (typeof rawData.total === 'number') {
    total = rawData.total;
  } else if (items.length > 0) {
    total = items.length;
  }
  
  return { items, total };
};

/**
 * 通用的ProTable请求处理器
 * @param fn 请求函数
 * @param params ProTable请求参数
 * @param sort ProTable排序参数
 * @param filters ProTable筛选参数
 * @param keywordField 关键词字段名
 * @param paramsPreProcessor 参数预处理函数
 * @returns ProTable所需的返回格式
 */
export const handleProTableRequest = async <T, P>(
  fn: (params: P) => Promise<ApiResponse<any>>,
  params: Record<string, any>,
  sort: Record<string, 'ascend' | 'descend'> = {},
  filters: Record<string, (string | number)[] | null> = {},
  keywordField: string = 'keyword',
  paramsPreProcessor?: (params: any) => any
): Promise<RequestData<T>> => {
  // 检查fn是否是函数
  if (typeof fn !== 'function') {
    console.error('handleProTableRequest: fn is not a function', fn);
    message.error('系统错误: 请求处理函数无效');
    return {
      data: [],
      success: false,
      total: 0,
    };
  }
  
  // 准备请求参数
  let queryParams = {
    ...formatProTableParams<P>(params, keywordField),
    ...formatSortParams(sort),
  } as P;

  // 如果有预处理函数，应用它
  if (paramsPreProcessor && typeof paramsPreProcessor === 'function') {
    queryParams = paramsPreProcessor(queryParams) as P;
  }

  try {
    // 发起请求
    const response = await fn(queryParams);
    
    if (response.success) {
      // 确保数据结构符合ProTable要求
      const { items, total } = ensureProTableData<T>(response.data);

      return {
        data: items,
        success: true,
        total: total,
      };
    } else {
      message.error(response.message || '加载数据失败');
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  } catch (error) {
    console.error('加载数据失败:', error);
    message.error('加载数据失败');
    return {
      data: [],
      success: false,
      total: 0,
    };
  }
};
