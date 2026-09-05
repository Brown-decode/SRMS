import { apiClient } from './client';
import { ClassSubjectCreateRequest, ClassSubjectCreateResponse } from '@/types/api';

export const classSubjectService = {
  getAll: async (): Promise<ClassSubjectCreateResponse[]> => {
    return apiClient.get<ClassSubjectCreateResponse[]>('/class_subject/');
  },

  getById: async (id: number): Promise<ClassSubjectCreateResponse> => {
    return apiClient.get<ClassSubjectCreateResponse>(`/class_subject/${id}`);
  },

  create: async (classSubject: ClassSubjectCreateRequest): Promise<ClassSubjectCreateResponse> => {
    return apiClient.post<ClassSubjectCreateResponse>('/class_subject/', classSubject);
  },
};
