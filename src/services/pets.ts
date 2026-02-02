import api from './api';
import type { Pet, CreatePetRequest, PetGrowthRecord, CreateGrowthRecordRequest } from '@/types';

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
};
