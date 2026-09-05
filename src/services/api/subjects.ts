import { apiClient } from "./client";
import { SubjectCreateRequest, SubjectCreateResponse } from "@/types/api";

export type { SubjectCreateRequest, SubjectCreateResponse } from "@/types/api";

export const subjectService = {
  getAll: async (): Promise<SubjectCreateResponse[]> => {
    return apiClient.get<SubjectCreateResponse[]>("/subjects/");
  },

  getById: async (id: number): Promise<SubjectCreateResponse> => {
    return apiClient.get<SubjectCreateResponse>(`/subjects/${id}`);
  },

  create: async (
    subject: SubjectCreateRequest,
  ): Promise<SubjectCreateResponse> => {
    return apiClient.post<SubjectCreateResponse>("/subjects/", subject);
  },

  update: async (
    id: number,
    subject: Partial<SubjectCreateRequest>,
  ): Promise<SubjectCreateResponse> => {
    return apiClient.put<SubjectCreateResponse>(`/subjects/${id}`, subject);
  },

  delete: async (id: number): Promise<void> => {
    return apiClient.delete<void>(`/subjects/${id}`);
  },
};
