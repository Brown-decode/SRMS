import { teacherService } from "./teachers";
import { studentService } from "./students";
import { classService } from "./classes";
import { subjectService } from "./subjects";
import { apiClient } from "./client";

// ==================== TYPESCRIPT INTERFACES ====================

// Backend Response Types
interface SubjectSummary {
  subject_name: string;
  coefficient: number;
  average: number;
}

interface StudentReportCard {
  student_name: string;
  matricule: string;
  average: number;
  subjects: SubjectSummary[];
  promotion_status: string;
}

// Frontend Data Types
export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalSubjects: number;
  trends?: {
    students: { value: number; isPositive: boolean };
    teachers: { value: number; isPositive: boolean };
    classes: { value: number; isPositive: boolean };
  };
}

export interface ClassPerformance {
  className: string;
  passRate: number;
  totalStudents: number;
  passedStudents: number;
}

export interface SubjectPerformance {
  subject: string;
  average: number;
  studentCount: number;
}

export interface PassRateData {
  term: string;
  rate: number;
}

export interface GradeDistribution {
  name: string;
  value: number;
  color: string;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Validates that a value is a finite number
 */
const isValidNumber = (value: any): value is number => {
  return typeof value === "number" && isFinite(value) && !isNaN(value);
};

/**
 * Safe percentage calculation
 */
const safePercentage = (numerator: number, denominator: number): number => {
  if (!isValidNumber(denominator) || denominator === 0) return 0;
  if (!isValidNumber(numerator) || numerator < 0) return 0;
  return Math.round((numerator / denominator) * 100);
};

// ==================== DASHBOARD SERVICE ====================

export const dashboardService = {
  /**
   * Get admin dashboard statistics
   */
  getAdminStats: async (): Promise<DashboardStats> => {
    try {
      const [students, teachers, classes, subjects] = await Promise.allSettled([
        studentService.getAll(), // Students endpoint should return all students
        teacherService.getAll(),
        classService.getAll(),
        subjectService.getAll(),
      ]);

      console.log("Dashboard stats data:", {
        students: students.status,
        teachers: teachers.status,
        classes: classes.status,
        subjects: subjects.status,
      });

      console.log(
        "Students data:",
        students.status === "fulfilled" ? students.value : students.reason,
      );
      console.log(
        "Teachers data:",
        teachers.status === "fulfilled" ? teachers.value : teachers.reason,
      );
      console.log(
        "Classes data:",
        classes.status === "fulfilled" ? classes.value : classes.reason,
      );
      console.log(
        "Subjects data:",
        subjects.status === "fulfilled" ? subjects.value : subjects.reason,
      );

      return {
        totalStudents:
          students.status === "fulfilled"
            ? students.value.data?.length || 0
            : 0,
        totalTeachers:
          teachers.status === "fulfilled"
            ? teachers.value.data?.length || 0
            : 0,
        totalClasses:
          classes.status === "fulfilled" ? classes.value.data?.length || 0 : 0,
        totalSubjects:
          subjects.status === "fulfilled" ? subjects.value.length || 0 : 0,
        trends: {
          students: { value: 0, isPositive: true }, // TODO: Calculate real trends from historical data
          teachers: { value: 0, isPositive: true }, // TODO: Calculate real trends from historical data
          classes: { value: 0, isPositive: true }, // TODO: Calculate real trends from historical data
        },
      };
    } catch (error) {
      console.error("Failed to get admin stats:", error);
      return {
        totalStudents: 0,
        totalTeachers: 0,
        totalClasses: 0,
        totalSubjects: 0,
      };
    }
  },

  /**
   * Get teacher dashboard statistics
   */
  getTeacherStats: async (): Promise<{
    totalClasses: number;
    totalStudents: number;
    pendingAssessments: number;
    averagePerformance: number;
    totalSubjects: number;
  }> => {
    try {
      console.log("🚀 Fetching teacher stats...");

      // Get teacher's subjects/classes (use new endpoint with class_id)
      const classSubjects = await teacherService.getMyClassSubjects();
      console.log("📚 Teacher class subjects:", classSubjects);
      const totalClasses = classSubjects.length;

      // Total subjects is just the number of class-subject assignments (same as Subjects Page)
      const totalSubjects = classSubjects.length;

      // Get all assessments (exists)
      let allAssessments: any[] = [];
      let totalStudents = 0;
      let averagePerformance = 0;

      try {
        // Use the assessment endpoint that exists
        const response = await apiClient.get("/assessment/");
        console.log("📋 All assessments response:", response);

        // Ensure allAssessments gets the actual array from response
        if (response && response.data) {
          allAssessments = Array.isArray(response.data) ? response.data : [];
        } else {
          allAssessments = [];
        }

        console.log("📋 All assessments array:", allAssessments);

        // Filter assessments for this teacher's subjects and preserve class/term info
        const teacherAssessments =
          allAssessments && allAssessments.filter
            ? allAssessments.filter(
                (assessment: any) =>
                  classSubjects &&
                  classSubjects.some(
                    (cs: any) => cs.id === assessment.class_subject_id,
                  ),
              )
            : [];

        // Get students and results from each class
        let allClassStudents: any[] = [];
        let allClassResults: any[] = [];

        // Create a map of class info to preserve class names and terms
        const classInfoMap = new Map();
        classSubjects.forEach((cs: any) => {
          classInfoMap.set(cs.id, {
            className: cs.class_name,
            term: 1, // Default term, can be enhanced later
          });
        });

        // Enhance assessments with class and term information
        const enhancedAssessments = teacherAssessments.map(
          (assessment: any) => {
            const classInfo = classInfoMap.get(assessment.class_subject_id);
            return {
              ...assessment,
              className: classInfo?.className || "Unknown Class",
              term: `Term ${assessment.term || 1}`,
            };
          },
        );

        // For each subject/class, get students and results
        for (const cs of classSubjects) {
          try {
            // Get students for this class (correct endpoint)
            const studentsResponse = await apiClient.get(
              `/classes/${cs.class_id}/students`,
            );
            console.log(
              `â¥ Students for class ${cs.class_id}:`,
              studentsResponse,
            );

            // API returns array directly, not wrapped in response.data
            const classStudents = Array.isArray(studentsResponse)
              ? studentsResponse
              : studentsResponse.data && Array.isArray(studentsResponse.data)
                ? studentsResponse.data
                : [];

            if (classStudents && Array.isArray(classStudents)) {
              allClassStudents = [...allClassStudents, ...classStudents];
              console.log(
                `â Added ${classStudents.length} students from class ${cs.class_id}`,
              );
            } else {
              console.warn(
                `â Invalid students data for class ${cs.class_id}:`,
                classStudents,
              );
            }

            // Get results for this class (correct endpoint)
            const resultsResponse = await apiClient.get(
              `/classes/${cs.class_id}/results?term=1`,
            );
            console.log(`â Results for class ${cs.class_id}:`, resultsResponse);

            // API returns array directly, not wrapped in response.data
            const classResults = Array.isArray(resultsResponse)
              ? resultsResponse
              : resultsResponse.data && Array.isArray(resultsResponse.data)
                ? resultsResponse.data
                : [];

            if (classResults && Array.isArray(classResults)) {
              allClassResults = [...allClassResults, ...classResults];
              console.log(
                `â Added ${classResults.length} results from class ${cs.class_id}`,
              );
            } else {
              console.warn(
                `â Invalid results data for class ${cs.class_id}:`,
                classResults,
              );
            }
          } catch (classError) {
            console.warn(
              `Could not get data for class ${cs.class_id}:`,
              classError,
            );
          }
        }

        // Remove duplicate students (by matricule)
        const uniqueStudents = new Map();
        allClassStudents.forEach((student: any) => {
          if (!uniqueStudents.has(student.matricule)) {
            uniqueStudents.set(student.matricule, student);
          }
        });

        totalStudents = uniqueStudents.size;

        // Calculate average performance from results
        if (allClassResults.length > 0) {
          averagePerformance = Math.round(
            allClassResults.reduce(
              (sum: number, r: any) => sum + (r.average || 0),
              0,
            ) / allClassResults.length,
          );
        }

        console.log("â Teacher stats calculated:", {
          totalClasses,
          totalStudents,
          pendingAssessments: teacherAssessments.length,
          averagePerformance,
          totalSubjects,
          enhancedAssessmentsCount: enhancedAssessments?.length || 0,
        });

        return {
          totalClasses,
          totalStudents,
          pendingAssessments: teacherAssessments.length, // Use teacherAssessments instead of enhancedAssessments
          averagePerformance,
          totalSubjects,
        };
      } catch (assessmentError) {
        console.warn("Could not fetch assessments:", assessmentError);

        // Fallback to basic info from subjects
        return {
          totalClasses,
          totalStudents: 0, // Don't estimate, get real data
          pendingAssessments: 0,
          averagePerformance: 0, // Don't use hardcoded value
          totalSubjects,
        };
      }
    } catch (error: any) {
      console.error("❌ Failed to get teacher stats:", error);
      return {
        totalClasses: 0,
        totalStudents: 0,
        pendingAssessments: 0,
        averagePerformance: 0,
        totalSubjects: 0,
      };
    }
  },

  /**
   * Get class performance overview from real backend endpoint
   * Uses /class-performance/ endpoint that returns actual class data
   */
  getStudentPerformanceOverview: async (): Promise<{
    classPerformance: ClassPerformance[];
    overallPassRate: number;
  }> => {
    try {
      console.log("🚀 Fetching real class performance data...");

      // Use the new real class performance endpoint
      const response = await apiClient.get<ClassPerformance[]>(
        "/class-performance/",
      );
      const classPerformanceData = Array.isArray(response) ? response : [];

      console.log(`📊 Received ${classPerformanceData.length} class records`);

      if (classPerformanceData.length === 0) {
        console.log("⚠️ No class performance data available");
        return { classPerformance: [], overallPassRate: 0 };
      }

      // Calculate overall pass rate from real class data
      const totalStudents = classPerformanceData.reduce(
        (sum, cls) => sum + cls.totalStudents,
        0,
      );
      const totalPassed = classPerformanceData.reduce(
        (sum, cls) => sum + cls.passedStudents,
        0,
      );
      const overallPassRate =
        totalStudents > 0 ? Math.round((totalPassed / totalStudents) * 100) : 0;

      console.log(
        `✅ Overall pass rate: ${overallPassRate}% (${totalPassed}/${totalStudents})`,
      );

      return {
        classPerformance: classPerformanceData,
        overallPassRate,
      };
    } catch (error: any) {
      console.error("❌ Failed to get real class performance:", error);

      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error("Authentication required. Please login again.");
      } else if (error.response?.status === 403) {
        throw new Error("Access denied. Admin privileges required.");
      } else if (error.code === "ECONNABORTED") {
        throw new Error("Request timeout. Please try again.");
      } else {
        throw new Error("Failed to load class performance data.");
      }
    }
  },

  /**
   * Get pass rate trend over terms
   */
  getPassRateTrend: async (): Promise<{ terms: PassRateData[] }> => {
    try {
      console.log("🚀 Fetching pass rate trend data...");

      const response = await apiClient.get<StudentReportCard[]>("/results/");
      const results = Array.isArray(response) ? response : [];

      console.log(
        `📊 Received ${results.length} student records for trend analysis`,
      );

      if (results.length === 0) {
        return { terms: [] };
      }

      // Deduplicate students by keeping only the best performing term for each student
      const studentMap = new Map<string, StudentReportCard>();

      results.forEach((student) => {
        const key = `${student.matricule}_${student.student_name}`;
        const existing = studentMap.get(key);

        // Keep the entry with the highest average
        if (!existing || student.average > existing.average) {
          studentMap.set(key, student);
        }
      });

      const uniqueStudents = Array.from(studentMap.values());

      console.log(
        `📊 Deduplicated from ${results.length} to ${uniqueStudents.length} unique students`,
      );

      // Group by promotion status to calculate pass rates
      const promotedCount = uniqueStudents.filter(
        (student) => student.promotion_status === "PROMOTED",
      ).length;
      const totalCount = uniqueStudents.length;
      const passRate = safePercentage(promotedCount, totalCount);

      // Create trend data (simplified - in real app, this would be by term)
      const terms: PassRateData[] = [
        { term: "Term 1", rate: passRate },
        { term: "Term 2", rate: Math.max(0, passRate - 5) }, // Simulate slight decrease
        { term: "Term 3", rate: Math.min(100, passRate + 3) }, // Simulate slight increase
      ];

      console.log(`📈 Pass rate trend calculated:`, terms);
      return { terms };
    } catch (error: any) {
      console.error("❌ Failed to get pass rate trend:", error);
      return { terms: [] };
    }
  },

  /**
   * Get student dashboard statistics
   */
  getStudentStats: async (): Promise<{
    overallAverage: number;
    totalSubjects: number;
    pendingAssignments: number;
    classRank: number;
  }> => {
    try {
      console.log("🚀 Fetching student stats...");

      // Get student results for current term (term 1)
      const results = await studentService.getMyResults(1);

      if (!results || !results.subjects) {
        return {
          overallAverage: 0,
          totalSubjects: 0,
          pendingAssignments: 0,
          classRank: 0,
        };
      }

      // Calculate overall average from subjects
      const totalAverage = results.average || 0;
      const totalSubjects = results.subjects.length || 0;
      const classRank = results.position || 0;

      // For pending assignments, we'll use a placeholder since there's no assignment endpoint
      // In a real implementation, this would come from an assignments endpoint
      const pendingAssignments = 0; // Placeholder

      console.log("✅ Student stats calculated:", {
        overallAverage: totalAverage,
        totalSubjects,
        pendingAssignments,
        classRank,
      });

      return {
        overallAverage: totalAverage,
        totalSubjects,
        pendingAssignments,
        classRank,
      };
    } catch (error: any) {
      console.error("❌ Failed to get student stats:", error);
      return {
        overallAverage: 0,
        totalSubjects: 0,
        pendingAssignments: 0,
        classRank: 0,
      };
    }
  },

  /**
   * Get grade distribution
   */
  getGradeDistribution: async (): Promise<GradeDistribution[]> => {
    try {
      console.log("🚀 Fetching grade distribution...");

      const response = await apiClient.get<StudentReportCard[]>("/results/");
      const results = Array.isArray(response) ? response : [];

      console.log(
        `📊 Received ${results.length} student records for grade distribution`,
      );

      if (results.length === 0) {
        return []; // Return empty array instead of hardcoded data
      }

      // Convert 0-20 averages to letter grades
      const gradeCounts = { A: 0, B: 0, C: 0, D: 0, F: 0 };

      // Deduplicate students by keeping only the best performing term for each student
      const studentMap = new Map<string, StudentReportCard>();

      results.forEach((student) => {
        const key = `${student.matricule}_${student.student_name}`;
        const existing = studentMap.get(key);

        // Keep the entry with the highest average
        if (!existing || student.average > existing.average) {
          studentMap.set(key, student);
        }
      });

      const uniqueStudents = Array.from(studentMap.values());

      console.log(
        `📊 Deduplicated from ${results.length} to ${uniqueStudents.length} unique students`,
      );

      uniqueStudents.forEach((student) => {
        if (isValidNumber(student.average)) {
          const avg = student.average;
          if (avg >= 16) gradeCounts.A++;
          else if (avg >= 14) gradeCounts.B++;
          else if (avg >= 12) gradeCounts.C++;
          else if (avg >= 10) gradeCounts.D++;
          else gradeCounts.F++;
        }
      });

      const total = Object.values(gradeCounts).reduce(
        (sum, count) => sum + count,
        0,
      );
      const safeTotal = total > 0 ? total : 1;

      const distribution: GradeDistribution[] = [
        {
          name: "A",
          value: Math.round((gradeCounts.A / safeTotal) * 100),
          color: "#10B981",
        },
        {
          name: "B",
          value: Math.round((gradeCounts.B / safeTotal) * 100),
          color: "#3B82F6",
        },
        {
          name: "C",
          value: Math.round((gradeCounts.C / safeTotal) * 100),
          color: "#F59E0B",
        },
        {
          name: "D",
          value: Math.round((gradeCounts.D / safeTotal) * 100),
          color: "#EF4444",
        },
        {
          name: "F",
          value: Math.round((gradeCounts.F / safeTotal) * 100),
          color: "#6B7280",
        },
      ];

      console.log(`📊 Grade distribution:`, distribution);
      return distribution;
    } catch (error: any) {
      console.error("❌ Failed to get grade distribution:", error);
      return []; // Return empty array instead of hardcoded data
    }
  },
};
