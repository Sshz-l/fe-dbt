import { useCallback } from 'react';

interface ToastOptions {
  title?: string;
  description?: string;
  status?: 'success' | 'error' | 'warning' | 'info';
  duration?: number | null;
  isClosable?: boolean;
}

interface ToastInstance {
  close: () => void;
}

export const useToast = () => {
  const toast = useCallback((options: ToastOptions): ToastInstance => {
    const { title, description, status = 'info', duration = 3000, isClosable = true } = options;
    
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
      display: flex;
      flex-direction: column;
      gap: 4px;
    `;
    
    // 创建头部容器（标题和关闭按钮）
    const headerContainer = document.createElement('div');
    headerContainer.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
    `;
    
    // 设置标题
    if (title) {
      const titleElement = document.createElement('div');
      titleElement.style.cssText = 'font-weight: 600; margin-right: 24px; flex: 1;';
      titleElement.textContent = title;
      headerContainer.appendChild(titleElement);
    }
    
    // 添加关闭按钮
    if (isClosable) {
      const closeButton = document.createElement('button');
      closeButton.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.8;
        transition: opacity 0.2s;
        margin: -4px -4px 0 0;
      `;
      closeButton.innerHTML = '×';
      closeButton.addEventListener('mouseover', () => {
        closeButton.style.opacity = '1';
      });
      closeButton.addEventListener('mouseout', () => {
        closeButton.style.opacity = '0.8';
      });
      closeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        if (document.body.contains(toastElement)) {
          document.body.removeChild(toastElement);
        }
      });
      headerContainer.appendChild(closeButton);
    }
    
    toastElement.appendChild(headerContainer);
    
    // 设置描述文本
    if (description) {
      const descElement = document.createElement('div');
      descElement.style.cssText = 'font-size: 14px; opacity: 0.9;';
      descElement.textContent = description;
      toastElement.appendChild(descElement);
    }
    
    // 添加到页面
    document.body.appendChild(toastElement);
    
    // 自动移除（如果 duration 不为 null）
    if (duration !== null) {
      setTimeout(() => {
        if (document.body.contains(toastElement)) {
          document.body.removeChild(toastElement);
        }
      }, duration);
    }
    
    // 返回用于手动关闭的函数
    return {
      close: () => {
        if (document.body.contains(toastElement)) {
          document.body.removeChild(toastElement);
        }
      }
    };
  }, []);
  
  return {
    toast,
    success: (options: Omit<ToastOptions, 'status'>) => toast({ ...options, status: 'success' }),
    error: (options: Omit<ToastOptions, 'status'>) => toast({ ...options, status: 'error' }),
    warning: (options: Omit<ToastOptions, 'status'>) => toast({ ...options, status: 'warning' }),
    info: (options: Omit<ToastOptions, 'status'>) => toast({ ...options, status: 'info' }),
    close: (toastId: ToastInstance) => {
      if (toastId && typeof toastId.close === 'function') {
        toastId.close();
      }
    }
  };
}; 