import { api } from './api';
import { CreateConsultationRequest, ConsultationResponse, ConsultationSummaryResponse } from '../types';

export const consultationService = {
    getConsultations: async (petId: number): Promise<ConsultationSummaryResponse[]> => {
        const response = await api.get<ConsultationSummaryResponse[]>(`/api/pets/${petId}/consultations`);
        return response.data;
    },

    createConsultation: async (petId: number, data: CreateConsultationRequest): Promise<ConsultationResponse> => {
        const response = await api.post<ConsultationResponse>(`/api/pets/${petId}/consultations`, data);
        return response.data;
    }
};
