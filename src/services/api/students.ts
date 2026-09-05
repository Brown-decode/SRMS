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

export interface Student {
  id: number;
  full_name: string;
  matricule: string;
  class_id: number;
  date_of_birth: string;
  gender: string;
  user: {
    full_name: string;
  };
}

export interface StudentCreate {
  full_name: string;
  matricule: string;
  class_id: number;
  date_of_birth: string;
  gender: string;
}

export interface StudentUpdate {
  full_name?: string;
  class_id?: number;
  date_of_birth?: string;
  gender?: string;
}

export interface PaginatedStudentResponse {
  data: Student[];
  total: number;
  page: number;
  limit: number;
}

export interface StudentFilters {
  search?: string;
  class_id?: number;
  gender?: string;
  page?: number;
  limit?: number;
}

export const studentService = {
  getAll: async (
    filters?: StudentFilters,
  ): Promise<PaginatedStudentResponse> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.class_id)
      params.append("class_id", filters.class_id.toString());
    if (filters?.gender) params.append("gender", filters.gender);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    // Use httpClient for header access
    const response = await httpClient.get<Student[]>(
      `/students/?${params.toString()}`,
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

  getById: async (id: number): Promise<Student> => {
    return await apiClient.get<Student>(`/students/${id}`);
  },

  create: async (studentData: StudentCreate): Promise<Student> => {
    return await apiClient.post<Student>("/students/", studentData);
  },

  update: async (id: number, studentData: StudentUpdate): Promise<Student> => {
    return await apiClient.put<Student>(`/students/${id}`, studentData);
  },

  delete: async (id: number): Promise<void> => {
    return await apiClient.delete(`/students/${id}`);
  },

  // Export functionality
  exportCSV: async (filters?: StudentFilters): Promise<void> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.class_id)
      params.append("class_id", filters.class_id.toString());
    if (filters?.gender) params.append("gender", filters.gender);

    const response = await httpClient.get(
      `/students/export/csv?${params.toString()}`,
    );

    // Create download link
    const blob = new Blob([response.data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "students.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Student-specific endpoints
  getMyProfile: async (): Promise<Student> => {
    return await apiClient.get<Student>("/students/me");
  },

  getMyClass: async (): Promise<any> => {
    return await apiClient.get<any>("/students/me/class");
  },

  getMyResults: async (term: number): Promise<any> => {
    return await apiClient.get<any>(`/students/me/results?term=${term}`);
  },

  // Additional student-specific endpoints that might be available
  getMyClassmates: async (): Promise<any[]> => {
    // Get classmates for the student's class
    try {
      const myClass = await this.getMyClass();
      if (!myClass?.id) return [];
      return await apiClient.get<any[]>(`/classes/${myClass.id}/students`);
    } catch (error) {
      console.error("Failed to get classmates:", error);
      return [];
    }
  },

  getClassResults: async (classId: number, term: number): Promise<any> => {
    return await apiClient.get<any>(`/classes/${classId}/results?term=${term}`);
  },

  getMySubjects: async (): Promise<any[]> => {
    // Get subjects for the student's class
    try {
      const myClass = await this.getMyClass();
      if (!myClass?.id) return [];
      return await apiClient.get<any[]>(
        `/class_subject/?class_id=${myClass.id}`,
      );
    } catch (error) {
      console.error("Failed to get subjects:", error);
      return [];
    }
  },

  // Download results as PDF
  downloadResultsPDF: async (term: number): Promise<void> => {
    try {
      const response = await apiClient.post(
        `/students/me/results/pdf?term=${term}`,
        {},
        {
          responseType: "blob",
        },
      );

      // Create download link
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `results_term_${term}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      console.log("PDF download initiated successfully");
    } catch (error) {
      console.error("Failed to download PDF:", error);
      throw error;
    }
  },
};
