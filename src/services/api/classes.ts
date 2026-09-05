import { apiClient } from "./client";

export interface Class {
  id: number;
  name: string;
  level: string;
  stream: string;
  students?: any[];
}

export interface ClassCreate {
  name: string;
  level: string;
  stream: string;
}

export interface ClassUpdate {
  name?: string;
  level?: string;
  stream?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ClassFilters {
  search?: string;
  level?: string;
  stream?: string;
  page?: number;
  limit?: number;
}

export const classService = {
  getAll: async (filters?: ClassFilters): Promise<PaginatedResponse<Class>> => {
    // Admin only endpoint - backend doesn't support pagination parameters
    // Only send search, level, and stream parameters that backend supports
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.level) params.append("level", filters.level);
    if (filters?.stream) params.append("stream", filters.stream);
    // Note: backend classes endpoint doesn't support page/limit parameters

    const response = (await apiClient.get(
      `/classes/?${params.toString()}`,
    )) as any;

    console.log("Classes service response:", response);
    console.log("Response type:", typeof response);
    console.log("Is array:", Array.isArray(response));

    // Backend returns array directly, not wrapped in response.data
    const classesData = Array.isArray(response)
      ? response
      : response.data || [];
    console.log("Classes data:", classesData);

    // Calculate total from response length since backend doesn't return pagination metadata
    const total = classesData.length;

    return {
      data: classesData,
      total,
      page: filters?.page || 1,
      limit: filters?.limit || 25,
    };
  },

  getById: async (id: number): Promise<Class> => {
    return await apiClient.get<Class>(`/classes/${id}`);
  },

  create: async (classData: ClassCreate): Promise<Class> => {
    return await apiClient.post<Class>("/classes/", classData);
  },

  update: async (id: number, classData: ClassUpdate): Promise<Class> => {
    return await apiClient.put<Class>(`/classes/${id}`, classData);
  },

  delete: async (id: number): Promise<void> => {
    return await apiClient.delete(`/classes/${id}`);
  },

  // Role-specific endpoints
  getClassStudents: async (classId: number): Promise<any[]> => {
    // Teacher can view students of classes they're assigned to
    return await apiClient.get<any[]>(`/classes/${classId}/students`);
  },

  getClassResults: async (classId: number, term: number): Promise<any[]> => {
    // Teacher/Admin can view class results
    return await apiClient.get<any[]>(
      `/classes/${classId}/results?term=${term}`,
    );
  },
};
