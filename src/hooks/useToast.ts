import { useCallback } from 'react';

interface ToastOptions {
  title?: string;
  description?: string;
  status?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export const useToast = () => {
  const toast = useCallback((options: ToastOptions) => {
    const { title, description, status = 'info', duration = 3000 } = options;
    
    // 创建 toast 元素
    const toastElement = document.createElement('div');
    toastElement.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${status === 'success' ? '#48BB78' : status === 'error' ? '#F56565' : status === 'warning' ? '#ED8936' : '#3182CE'};
      color: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 9999;
      max-width: 300px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    // 设置内容
    if (title) {
      const titleElement = document.createElement('div');
      titleElement.style.cssText = 'font-weight: 600; margin-bottom: 4px;';
      titleElement.textContent = title;
      toastElement.appendChild(titleElement);
    }
    
    if (description) {
      const descElement = document.createElement('div');
      descElement.style.cssText = 'font-size: 14px; opacity: 0.9;';
      descElement.textContent = description;
      toastElement.appendChild(descElement);
    }
    
    // 添加到页面
    document.body.appendChild(toastElement);
    
    // 自动移除
    setTimeout(() => {
      if (document.body.contains(toastElement)) {
        document.body.removeChild(toastElement);
      }
    }, duration);
    
    // 点击关闭
    toastElement.addEventListener('click', () => {
      if (document.body.contains(toastElement)) {
        document.body.removeChild(toastElement);
      }
    });
  }, []);
  
  return {
    toast,
    success: (options: Omit<ToastOptions, 'status'>) => toast({ ...options, status: 'success' }),
    error: (options: Omit<ToastOptions, 'status'>) => toast({ ...options, status: 'error' }),
    warning: (options: Omit<ToastOptions, 'status'>) => toast({ ...options, status: 'warning' }),
    info: (options: Omit<ToastOptions, 'status'>) => toast({ ...options, status: 'info' }),
  };
}; 