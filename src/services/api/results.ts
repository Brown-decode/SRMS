import { apiClient } from "./client";
import { StudentReportCard, AssessmentScoresResponse } from "@/types/api";

export interface ResultFilters {
  class_id?: number;
  term?: number;
  subject_id?: number;
}

export const resultsService = {
  getClassResults: async (
    classId: number,
    term: number,
  ): Promise<StudentReportCard[]> => {
    return apiClient.get<StudentReportCard[]>(
      `/classes/${classId}/results?term=${term}`,
    );
  },

  getAllResults: async (): Promise<StudentReportCard[]> => {
    return apiClient.get<StudentReportCard[]>("/results/");
  },

  getStudentResults: async (
    studentId: number,
    term: number,
  ): Promise<StudentReportCard> => {
    return apiClient.get<StudentReportCard>(
      `/students/${studentId}/results?term=${term}`,
    );
  },

  getAssessmentScores: async (
    assessmentId: number,
  ): Promise<AssessmentScoresResponse> => {
    return apiClient.get<AssessmentScoresResponse>(
      `/assessments/${assessmentId}/scores`,
    );
  },

  exportClassResults: async (classId: number, term: number): Promise<void> => {
    const response = (await apiClient.get(
      `/classes/${classId}/results/export?term=${term}`,
      {
        responseType: "blob",
      },
    )) as Blob;

    // Create download link
    const blob = new Blob([response], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `class_${classId}_term_${term}_results.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
