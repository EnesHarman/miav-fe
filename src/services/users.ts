import api from './api';
import type { UserProfile, UpdateProfileRequest } from '@/types';

export const userService = {
  async getCurrentUser(): Promise<UserProfile> {
    const response = await api.get<UserProfile>('/api/users/me');
    return response.data;
  },

  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    const response = await api.put<UserProfile>('/api/users/me', data);
    return response.data;
  },
};
