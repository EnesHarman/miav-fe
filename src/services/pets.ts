import api from './api';
import type { Pet, CreatePetRequest, PetGrowthRecord, CreateGrowthRecordRequest, PetImage, ApiResponse } from '@/types';

export const petService = {
  async getMyPets(): Promise<Pet[]> {
    const response = await api.get<Pet[]>('/api/pets');
    return response.data;
  },

  async getPetById(id: number): Promise<Pet> {
    const response = await api.get<Pet>(`/api/pets/${id}`);
    return response.data;
  },

  async createPet(data: CreatePetRequest): Promise<Pet> {
    const response = await api.post<Pet>('/api/pets', data);
    return response.data;
  },

  async getGrowthHistory(petId: number): Promise<PetGrowthRecord[]> {
    const response = await api.get<PetGrowthRecord[]>(`/api/pets/${petId}/records`);
    return response.data;
  },

  async addGrowthRecord(petId: number, data: CreateGrowthRecordRequest): Promise<PetGrowthRecord> {
    const response = await api.post<PetGrowthRecord>(`/api/pets/${petId}/records`, data);
    return response.data;
  },

  async deletePet(id: number): Promise<void> {
    await api.delete(`/api/pets/${id}`);
  },

  async addPetImages(petId: number, files: File[], description?: string): Promise<PetImage[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const params: Record<string, string> = {};
    if (description) params.description = description;
    const response = await api.post<PetImage[]>(`/api/pets/${petId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params,
    });
    return response.data;
  },

  async deletePetImage(petId: number, imageId: number): Promise<ApiResponse> {
    const response = await api.delete<ApiResponse>(`/api/pets/${petId}/images/${imageId}`);
    return response.data;
  },

  async setProfileImage(petId: number, imageId: number): Promise<ApiResponse> {
    const response = await api.put<ApiResponse>(`/api/pets/${petId}/images/${imageId}/profile`);
    return response.data;
  },
};
