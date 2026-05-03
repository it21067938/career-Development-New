import axios, { AxiosError } from 'axios';
import { API_CONFIG } from '../config';

const nodeClient = axios.create({
  baseURL: API_CONFIG.NODE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

nodeClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // error logging
    const message = (error.response?.data as any)?.message || error.message;
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

export default nodeClient;