const rawBase = import.meta.env.VITE_API_BASE_URL;

export const API_BASE = rawBase
    ? rawBase.replace(/\/+$/, '')
    : 'http://localhost:3001/api';
