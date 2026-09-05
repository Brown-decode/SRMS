import { apiClient } from "./client";

export interface Assessment {
  id: number;
  title: string;
  description?: string;
  class_subject_id: number;
  term: number;
  sequence: number;
  max_score: number;
  weight?: number; // Weight percentage for the assessment
  date: string;
  class_subject?: {
    class?: {
      name: string;
    };
  };
}

export interface AssessmentCreate {
  title: string;
  description?: string;
  class_subject_id: number;
  term: number;
  sequence: number;
  max_score: number;
  weight?: number; // Weight percentage for the assessment
  date: string;
}

export interface AssessmentUpdate {
  title?: string;
  description?: string;
  class_subject_id?: number;
  term?: number;
  sequence?: number;
  max_score?: number;
  weight?: number; // Weight percentage for the assessment
  date?: string;
}

export interface ScoreCreate {
  student_id: number;
  score: number;
}

export const assessmentService = {
  getAll: async (): Promise<Assessment[]> => {
    try {
      console.log("Loading teacher assessments...");

      // Use the correct assessment endpoint - backend handles role-based filtering
      const assessments = await apiClient.get<Assessment[]>("/assessment/");
      console.log("Raw assessments response:", assessments);

      // Get teacher's class subjects for class names
      const classSubjectsResponse = await apiClient.get(
        "/teachers/me/class-subjects",
      );
      const classSubjects =
        (classSubjectsResponse as any).data || (classSubjectsResponse as any[]);
      console.log("Class subjects response:", classSubjects);

      // Create a map of class_subject_id to class name
      const subjectClassMap = new Map();
      classSubjects.forEach((cs: any) => {
        subjectClassMap.set(
          cs.id,
          cs.class?.name || cs.class_name || "Unknown Class",
        );
      });

      // Enhance assessments with class names
      const enhancedAssessments = assessments.map((assessment: any) => ({
        ...assessment,
        className:
          subjectClassMap.get(assessment.class_subject_id) || "Unknown Class",
      }));

      console.log("Enhanced assessments:", enhancedAssessments);
      return enhancedAssessments;
    } catch (error: any) {
      console.error("Failed to load assessments:", error);
      console.error("Error details:", error.response?.data || error.message);
      throw error;
    }
  },

  getById: async (id: number): Promise<Assessment> => {
    return await apiClient.get<Assessment>(`/assessment/${id}`);
  },

  create: async (assessmentData: AssessmentCreate): Promise<Assessment> => {
    return await apiClient.post<Assessment>("/assessment/", assessmentData);
  },

  update: async (
    id: number,
    assessmentData: AssessmentUpdate,
  ): Promise<Assessment> => {
    return await apiClient.put<Assessment>(`/assessment/${id}`, assessmentData);
  },

  delete: async (id: number): Promise<void> => {
    return await apiClient.delete(`/assessment/${id}`);
  },

  getAssessmentScores: async (assessmentId: number): Promise<any> => {
    return await apiClient.get<any>(`/assessment/${assessmentId}/scores`);
  },

  createScores: async (
    assessmentId: number,
    scores: ScoreCreate[],
  ): Promise<any> => {
    return await apiClient.post<any>(`/assessment/${assessmentId}/scores`, {
      scores,
    });
  },

  updateScore: async (
    assessmentId: number,
    studentId: number,
    score: number,
  ): Promise<any> => {
    return await apiClient.put<any>(
      `/assessment/${assessmentId}/scores/${studentId}`,
      {
        score,
      },
    );
  },

  exportAssessmentScores: async (assessmentId: number): Promise<void> => {
    try {
      const response = (await apiClient.get(
        `/assessment/${assessmentId}/scores/export`,
        {
          responseType: "blob",
        },
      )) as any;

      // Ensure we have valid blob data
      if (!response.data || !(response.data instanceof Blob)) {
        throw new Error("Invalid response data");
      }

      // Create download link
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "assessment_scores.csv");
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
