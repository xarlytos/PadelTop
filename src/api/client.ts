import axios from 'axios';
import { CONFIG } from '../constants/config';

export const apiClient = axios.create({
  baseURL: CONFIG.API_BASE_URL + '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function setAuthToken(token: string | null) {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
}
