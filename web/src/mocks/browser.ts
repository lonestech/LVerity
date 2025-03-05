import { setupWorker } from 'msw/browser';
import { apiHandlers } from './api-handlers';

// 创建MSW工作线程
export const worker = setupWorker(...apiHandlers);

// 启动MSW
export function startMSW() {
  if (process.env.NODE_ENV === 'development') {
    try {
      console.log('尝试启动Mock Service Worker...');
      
      worker.start({
        onUnhandledRequest: 'warn', // 修改为'warn'以便于调试未处理的请求
      }).catch(error => {
        console.error('MSW工作线程启动失败:', error);
      });
      
      console.log('Mock Service Worker已启动');
      
      // 添加调试信息
      console.log('已注册的API处理程序:', apiHandlers.length);
      // 调试注册的路径
      const paths = apiHandlers.map((handler: any) => {
        if (handler.info) {
          return `${handler.info.method} ${handler.info.path}`;
        }
        return 'Unknown handler';
      });
      console.log('已注册的API路径:', paths);
      
      // 打印mock请求示例以供参考
      console.log('参考请求示例:');
      console.log('GET /api/customers - 获取客户列表');
      console.log('GET /api/products - 获取产品列表');
      console.log('GET /api/system/status - 获取系统状态');
    } catch (error) {
      console.error('启动MSW时发生错误:', error);
    }
  }
}
