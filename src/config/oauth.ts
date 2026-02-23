/**
 * Backend base URL for OAuth (user / popup goes to backend for Google login).
 * Frontend callback URL: OAuth sonrası backend bu adrese yönlendirmalı (token'lar query'de).
 */
const BACKEND_BASE =
  import.meta.env.DEV
    ? 'http://localhost:8081'
    : (import.meta.env.VITE_API_URL ?? window.location.origin);

/** Google ve Apple OAuth başlatma adresleri (backend). */
export const GOOGLE_OAUTH_URL = `${BACKEND_BASE}/oauth2/authorization/google`;
export const APPLE_OAUTH_URL = `${BACKEND_BASE}/oauth2/authorization/apple`;

/** Frontend callback: Backend OAuth sonrası bu URL'e yönlendirmeli (token'lar query'de). */
export const FRONTEND_OAUTH_CALLBACK_URL =
  import.meta.env.DEV
    ? 'http://localhost:5173/oauth/callback'
    : `${window.location.origin}/oauth/callback`;
