import api from './api';
import type { AuthResponse } from '@/types';

export const authService = {
  async getSocialAuthUrl(provider: 'google' | 'apple', challenge: string, state: string): Promise<string> {
    const response = await api.get(`/auth/social/${provider}`, {
      params: {
        code_challenge: challenge,
        code_challenge_method: 'S256',
        state,
        redirect_uri: `${window.location.origin}/auth/callback`,
      },
    });
    return response.data.message; // Holds the Keycloak URL
  },

  async handleCallback(code: string, verifier: string): Promise<AuthResponse> {
    const response = await api.get('/auth/callback', {
      params: {
        code,
        code_verifier: verifier,
      },
    });
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      if (this.isAuthenticated()) {
        const refreshToken = sessionStorage.getItem('refreshToken');
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
    }
  },

  isAuthenticated(): boolean {
    return !!sessionStorage.getItem('accessToken');
  },

  setTokens(tokens: AuthResponse): void {
    sessionStorage.setItem('accessToken', tokens.accessToken);
    sessionStorage.setItem('refreshToken', tokens.refreshToken);
  },
};
