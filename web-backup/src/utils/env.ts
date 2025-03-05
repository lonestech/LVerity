// 判断当前环境
export const isProduction = window.location.hostname !== 'localhost';

// API基础路径
export const baseApiUrl = isProduction ? '' : 'http://localhost:8080';
