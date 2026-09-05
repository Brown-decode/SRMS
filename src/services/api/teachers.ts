import { apiClient } from "./client";
import axios from "axios";

// Create a custom axios instance for accessing headers
const httpClient = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE_URL || "http://localhost:8000",
  timeout: 10000,
});

// Add request interceptor for authentication
httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("srms_access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("srms_access_token");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  },
);

export interface Teacher {
  id: number;
  full_name: string;
  loginid: string;
  user: {
    full_name: string;
  };
  subjects?: any[];
}

export interface TeacherCreate {
  full_name: string;
  loginid: string;
  password: string;
}

export interface TeacherUpdate {
  full_name?: string;
  loginid?: string;
}

export interface PaginatedTeacherResponse {
  data: Teacher[];
  total: number;
  page: number;
  limit: number;
}

export interface TeacherFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export const teacherService = {
  getAll: async (
    filters?: TeacherFilters,
  ): Promise<PaginatedTeacherResponse> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    // Use httpClient for header access
    const response = await httpClient.get<Teacher[]>(
      `/teachers/?${params.toString()}`,
    );

    // Calculate total from response length since backend doesn't return pagination metadata
    const total = response.data.length;

    return {
      data: response.data,
      total,
      page: filters?.page || 1,
      limit: filters?.limit || 25,
    };
  },

  getById: async (id: number): Promise<Teacher> => {
    return await apiClient.get<Teacher>(`/teachers/${id}`);
  },

  create: async (teacherData: TeacherCreate): Promise<Teacher> => {
    return await apiClient.post<Teacher>("/teachers/", teacherData);
  },

  update: async (id: number, teacherData: TeacherUpdate): Promise<Teacher> => {
    return await apiClient.put<Teacher>(`/teachers/${id}`, teacherData);
  },

  delete: async (id: number): Promise<void> => {
    return await apiClient.delete(`/teachers/${id}`);
  },

  // Export functionality
  exportCSV: async (filters?: TeacherFilters): Promise<void> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);

    const response = await httpClient.get(
      `/teachers/export/csv?${params.toString()}`,
    );

    // Create download link
    const blob = new Blob([response.data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "teachers.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Teacher-specific endpoints
  getMyProfile: async (): Promise<Teacher> => {
    return await apiClient.get<Teacher>("/teachers/me");
  },

  getMySubjects: async (): Promise<any[]> => {
    return await apiClient.get<any[]>("/teachers/me/subjects");
  },

  getMyClassSubjects: async (): Promise<any[]> => {
    return await apiClient.get<any[]>("/teachers/me/class-subjects");
  },

  getMyAssessments: async (): Promise<any[]> => {
    return await apiClient.get<any[]>("/teachers/me/assessments");
  },

  getMyClassStudents: async (): Promise<any[]> => {
    return await apiClient.get<any[]>("/teachers/me/class-students");
  },

  getMyClassResults: async (term: number): Promise<any> => {
    return await apiClient.get<any>(`/teachers/me/class-results?term=${term}`);
  },

  update: async (id: number, teacherData: any): Promise<any> => {
    return await apiClient.put<any>(`/teachers/${id}`, teacherData);
  },

  exportClassesCSV: async (): Promise<void> => {
    try {
      const response = (await apiClient.get("/teachers/me/export/csv", {
        responseType: "blob",
      })) as any;

      // Ensure we have valid blob data
      if (!response.data || !(response.data instanceof Blob)) {
        throw new Error("Invalid response data");
      }

      // Create download link
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "my_classes.csv");
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      throw error;
    }
  },
};
