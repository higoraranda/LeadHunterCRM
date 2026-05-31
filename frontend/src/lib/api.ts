import axios from 'axios';

// Em desenvolvimento o Vite faz proxy de /api -> http://localhost:8080 (ver vite.config.ts).
// Em produção (Vercel) defina VITE_API_URL com a URL do backend no Render, ex.:
//   VITE_API_URL=https://leadhunter-backend.onrender.com
const envUrl = import.meta.env.VITE_API_URL as string | undefined;
const baseURL = envUrl ? `${envUrl.replace(/\/+$/, '')}/api` : '/api';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});
