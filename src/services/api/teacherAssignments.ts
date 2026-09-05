import { apiClient } from "./client";
import { teacherService, Teacher } from "./teachers";
import { classService, Class } from "./classes";
import { subjectService, SubjectCreateResponse } from "./subjects";

export interface TeacherAssignment {
  id: number;
  teacher_id: number;
  class_id: number;
  subject_id: number;
  coefficient: number;
  teacher: Teacher;
  class: Class;
  subject: SubjectCreateResponse;
  created_at: string;
  updated_at: string;
}

export interface TeacherAssignmentCreate {
  teacher_id: number;
  class_id: number;
  subject_id: number;
  coefficient: number;
}

export interface TeacherAssignmentUpdate {
  teacher_id?: number;
  class_id?: number;
  subject_id?: number;
  coefficient?: number;
}

export interface TeacherAssignmentFilters {
  teacher_id?: number;
  class_id?: number;
  subject_id?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedTeacherAssignmentResponse {
  data: TeacherAssignment[];
  total: number;
  page: number;
  limit: number;
}

export const teacherAssignmentService = {
  // Get all assignments with optional filters
  getAll: async (
    filters?: TeacherAssignmentFilters,
  ): Promise<PaginatedTeacherAssignmentResponse> => {
    try {
      console.log("=== TEACHER ASSIGNMENTS SERVICE START ===");

      const params = new URLSearchParams();
      if (filters?.teacher_id)
        params.append("teacher_id", filters.teacher_id.toString());
      if (filters?.class_id)
        params.append("class_id", filters.class_id.toString());
      if (filters?.subject_id)
        params.append("subject_id", filters.subject_id.toString());
      if (filters?.search) params.append("search", filters.search);
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());

      console.log("Calling API with params:", params.toString());

      const response = await apiClient.get(
        `/class_subject/?${params.toString()}`,
      );
      console.log("Raw API response:", response);
      console.log("Response type:", typeof response);

      // Backend returns array directly, not wrapped in response.data
      const assignmentsData = Array.isArray(response) ? response : [];
      console.log("Assignments data:", assignmentsData);
      console.log("Is assignments array:", Array.isArray(assignmentsData));

      if (!Array.isArray(assignmentsData)) {
        console.error("Invalid response - not an array:", response);
        return {
          data: [],
          total: 0,
          page: filters?.page || 1,
          limit: filters?.limit || 25,
        };
      }

      if (assignmentsData.length === 0) {
        console.log("No assignments found in response");
        return {
          data: [],
          total: 0,
          page: filters?.page || 1,
          limit: filters?.limit || 25,
        };
      }

      console.log(
        "Processing",
        assignmentsData.length,
        "assignments for enrichment",
      );

      // Load teachers, classes, and subjects for enrichment
      console.log("Loading enrichment data...");
      const [teachersData, classesData, subjectsData] = await Promise.all([
        teacherService.getAll({ limit: 100 }),
        classService.getAll(),
        subjectService.getAll(),
      ]);

      console.log("Enrichment data loaded:");
      console.log("Teachers:", teachersData.data);
      console.log("Classes:", classesData.data);
      console.log("Subjects:", subjectsData); // Subjects returns array directly

      // Handle different response structures
      const teachersList = teachersData.data || [];
      const classesList = classesData.data || [];
      const subjectsList = Array.isArray(subjectsData)
        ? subjectsData
        : subjectsData.data || [];

      console.log("Processed lists:");
      console.log("Teachers list:", teachersList);
      console.log("Classes list:", classesList);
      console.log("Subjects list:", subjectsList);

      // Enrich assignments with real teacher, class, and subject data
      const enrichedAssignments: TeacherAssignment[] = await Promise.all(
        assignmentsData.map(async (assignment: any, index: number) => {
          try {
            console.log(
              `Enriching assignment ${index + 1}/${assignmentsData.length}:`,
              assignment,
            );

            // Find matching teacher, class, and subject from loaded data
            const teacher = teachersList.find(
              (t: any) => t.id === assignment.teacher_id,
            );
            const class_ = classesList.find(
              (c: any) => c.id === assignment.class_id,
            );
            const subject = subjectsList.find(
              (s: any) => s.id === assignment.subject_id,
            );

            console.log("Found teacher:", teacher);
            console.log("Found class:", class_);
            console.log("Found subject:", subject);

            const enriched = {
              id: assignment.id,
              teacher_id: assignment.teacher_id,
              class_id: assignment.class_id,
              subject_id: assignment.subject_id,
              coefficient: assignment.coefficient,
              teacher: teacher || {
                id: assignment.teacher_id,
                full_name: "Unknown Teacher",
                loginid: "Unknown",
              },
              class: class_ || {
                id: assignment.class_id,
                name: "Unknown Class",
                level: "Unknown",
                stream: "Unknown",
              },
              subject: subject || {
                id: assignment.subject_id,
                name: "Unknown Subject",
              },
              created_at: assignment.created_at || new Date().toISOString(),
              updated_at: assignment.updated_at || new Date().toISOString(),
            };

            console.log("Enriched assignment:", enriched);
            return enriched;
          } catch (error) {
            console.error(
              `Failed to enrich assignment ${assignment.id}:`,
              error,
            );
            // Return basic assignment if enrichment fails
            const fallback = {
              id: assignment.id,
              teacher_id: assignment.teacher_id,
              class_id: assignment.class_id,
              subject_id: assignment.subject_id,
              coefficient: assignment.coefficient,
              teacher: {
                id: assignment.teacher_id,
                full_name: "Unknown Teacher",
                loginid: "Unknown",
              },
              class: {
                id: assignment.class_id,
                name: "Unknown Class",
                level: "Unknown",
                stream: "Unknown",
              },
              subject: {
                id: assignment.subject_id,
                name: "Unknown Subject",
              },
              created_at: assignment.created_at || new Date().toISOString(),
              updated_at: assignment.updated_at || new Date().toISOString(),
            };
            console.log("Using fallback assignment:", fallback);
            return fallback;
          }
        }),
      );

      const result: PaginatedTeacherAssignmentResponse = {
        data: enrichedAssignments,
        total: enrichedAssignments.length,
        page: filters?.page || 1,
        limit: filters?.limit || 25,
      };

      console.log("Final result:", result);
      console.log("=== TEACHER ASSIGNMENTS SERVICE END ===");

      return result;
    } catch (error: any) {
      console.error("ERROR in teacher assignments service:", error);
      console.error("Error details:", error.response?.data || error.message);
      console.log("=== TEACHER ASSIGNMENTS SERVICE END (ERROR) ===");
      return {
        data: [],
        total: 0,
        page: filters?.page || 1,
        limit: filters?.limit || 25,
      };
    }
  },

  // Get assignment by ID
  getById: async (id: number): Promise<TeacherAssignment> => {
    return await apiClient.get<TeacherAssignment>(`/class_subject/${id}`);
  },

  // Create new assignment
  create: async (
    assignmentData: TeacherAssignmentCreate,
  ): Promise<TeacherAssignment> => {
    return await apiClient.post<TeacherAssignment>(
      "/class_subject/",
      assignmentData,
    );
  },

  // Update existing assignment
  update: async (
    id: number,
    assignmentData: TeacherAssignmentUpdate,
  ): Promise<TeacherAssignment> => {
    return await apiClient.put<TeacherAssignment>(
      `/class_subject/${id}`,
      assignmentData,
    );
  },

  // Delete assignment
  delete: async (id: number): Promise<void> => {
    return await apiClient.delete(`/class_subject/${id}`);
  },

  // Get assignments by teacher
  getByTeacher: async (teacherId: number): Promise<TeacherAssignment[]> => {
    return await apiClient.get<TeacherAssignment[]>(
      `/class_subject/?teacher_id=${teacherId}`,
    );
  },

  // Get assignments by class
  getByClass: async (classId: number): Promise<TeacherAssignment[]> => {
    return await apiClient.get<TeacherAssignment[]>(
      `/class_subject/?class_id=${classId}`,
    );
  },

  // Get assignments by subject
  getBySubject: async (subjectId: number): Promise<TeacherAssignment[]> => {
    return await apiClient.get<TeacherAssignment[]>(
      `/class_subject/?subject_id=${subjectId}`,
    );
  },

  // Check for assignment conflicts
  checkConflict: async (
    teacherId: number,
    classId: number,
    subjectId: number,
    excludeId?: number,
  ): Promise<boolean> => {
    const params = new URLSearchParams();
    params.append("teacher_id", teacherId.toString());
    params.append("class_id", classId.toString());
    params.append("subject_id", subjectId.toString());
    if (excludeId) params.append("exclude_id", excludeId.toString());

    const response = await apiClient.get<{ conflict: boolean }>(
      `/class_subject/check-conflict?${params.toString()}`,
    );
    return response.data.conflict;
  },

  // Bulk create assignments
  bulkCreate: async (
    assignments: TeacherAssignmentCreate[],
  ): Promise<{ created: number; failed: number; errors: string[] }> => {
    return await apiClient.post("/class_subject/bulk", { assignments });
  },

  // Export assignments to CSV
  exportCSV: async (filters?: TeacherAssignmentFilters): Promise<void> => {
    const params = new URLSearchParams();
    if (filters?.teacher_id)
      params.append("teacher_id", filters.teacher_id.toString());
    if (filters?.class_id)
      params.append("class_id", filters.class_id.toString());
    if (filters?.subject_id)
      params.append("subject_id", filters.subject_id.toString());

    const response = await apiClient.get(
      `/class_subject/export/csv?${params.toString()}`,
      {
        responseType: "blob",
      },
    );

    // Create download link
    const blob = new Blob([response.data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "teacher_assignments.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
