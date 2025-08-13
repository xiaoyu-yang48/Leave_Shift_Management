import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001', // local
  //baseURL: 'http://3.26.96.188:5001', // live
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use((config) => {
  const stored = localStorage.getItem('user');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed?.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    } catch (_) {
      // ignore
    }
  }
  return config;
});

export default axiosInstance;
