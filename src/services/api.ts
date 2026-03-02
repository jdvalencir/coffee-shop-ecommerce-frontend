import axios from 'axios';

/**
 * When VITE_API_BASE_URL is set in .env, the app uses real API calls.
 * Otherwise, it falls back to local mock data.
 */
export const USE_MOCK = !import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

export default api;
