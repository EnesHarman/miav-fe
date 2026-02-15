import api from './api';
import type { VaccineResponse, CreateVaccineRequest, GroupedVaccinesResponse } from '@/types';

export const vaccineService = {
    async getVaccines(petId: number): Promise<GroupedVaccinesResponse> {
        const response = await api.get<GroupedVaccinesResponse>(`/api/pets/${petId}/vaccines`);
        return response.data;
    },

    async addVaccine(petId: number, data: CreateVaccineRequest): Promise<VaccineResponse> {
        const response = await api.post<VaccineResponse>(`/api/pets/${petId}/vaccines`, data);
        return response.data;
    },

    async deleteVaccine(petId: number, vaccineId: number): Promise<void> {
        await api.delete(`/api/pets/${petId}/vaccines/${vaccineId}`);
    },
};
