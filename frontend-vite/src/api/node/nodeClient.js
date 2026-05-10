import axios from 'axios';
import { API_CONFIG } from '../config';

const nodeClient = axios.create({
  baseURL: API_CONFIG.NODE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

nodeClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Error logging logic remains the same
    const message = error.response?.data?.message || error.message;
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

export default nodeClient;