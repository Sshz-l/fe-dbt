import axios, { AxiosRequestHeaders } from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
const service = axios.create({
  baseURL: '/', // 使用相对路径，通过 Next.js 代理转发
  timeout: 6000,
});

service.interceptors.request.use(
  (config) => {
    if (!config?.headers) {
      config = config || {};
      config.headers = {} as AxiosRequestHeaders;
    }

    try {
      // 获取 token 的函数
      const getToken = () => {
        const store = useAuthStore.getState();
        const token = store.userInfo?.token;
        return token;
      };

      const token = getToken();

      const generateRandomString = (length: number) => {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; // 字符集
        let randomString = '';

        for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * charset.length);
          randomString += charset[randomIndex];
        }

        return randomString;
      };

      if (token) {
        config.headers['token'] = token;
        config.headers['X-Request-ID'] = generateRandomString(10);
      }
    } catch (e) {
      console.error('获取 token 失败:', e);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 添加响应拦截器
service.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 获取 store 实例
      const store = useAuthStore.getState();
      // 调用 handleDisconnect
      store.logout();
      // 刷新页面
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default service;
