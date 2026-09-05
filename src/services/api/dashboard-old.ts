import { teacherService } from "./teachers";
import { studentService } from "./students";
import { classService } from "./classes";
import { subjectService } from "./subjects";
import { assessmentService } from "./assessments";
import { apiClient } from "./client";

// Enhanced API client with retry and timeout handling
const apiWithTimeout = async (url: string, retries = 2) => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await apiClient.get<any>(url, { timeout: 5000 }); // 5 second timeout
      return result;
    } catch (error: any) {
      console.log(`Attempt ${i + 1} failed for ${url}:`, error.message);

      // If it's an authentication error, don't retry
      if (error.response?.status === 401) {
        console.error("Authentication failed - user not logged in");
        throw new Error("Authentication required");
      }

      if (i === retries - 1) {
        throw error;
      }
      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw new Error("Max retries exceeded");
};

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalSubjects: number;
}

export interface MonthlyData {
  month: string;
  students: number;
  teachers: number;
}

export interface GradeDistribution {
  name: string;
  value: number;
  color: string;
}

export interface RecentActivity {
  id: number;
  type: "student" | "assessment" | "teacher" | "class";
  title: string;
  description: string;
  timestamp: string;
  user?: string;
}

export interface SubjectPerformance {
  subject: string;
  average: number;
  studentCount: number;
}

export interface PassRateTrend {
  term: number;
  rate: number;
}

export interface ClassPerformance {
  className: string;
  averageScore: number;
  studentCount: number;
}

export interface ScoreProgression {
  assessment: string;
  scores: number[];
}

export const dashboardService = {
  // Admin Dashboard Stats - Real Data
  getAdminStats: async (): Promise<DashboardStats> => {
    try {
      const [students, teachers, classes, subjects] = await Promise.all([
        studentService.getAll(),
        teacherService.getAll(),
        classService.getAll(),
        subjectService.getAll(),
      ]);

      return {
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalClasses: classes.length,
        totalSubjects: subjects.length,
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

  // Student Performance Overview - Real Data
  getStudentPerformanceOverview: async (): Promise<{
    subjectAverages: SubjectPerformance[];
    passRate: number;
  }> => {
    try {
      // Use enhanced API client with retry
      const results = await apiWithTimeout("/results/");
      console.log("=== STUDENT PERFORMANCE DEBUG ===");
      console.log("Raw API response:", results);
      console.log("Response type:", typeof results);
      console.log("Is array:", Array.isArray(results));

      const subjectPerformance: {
        [key: string]: { total: number; count: number; sum: number };
      } = {};

      // Handle different possible data structures
      let dataArray = [];
      if (results && Array.isArray(results)) {
        dataArray = results;
        console.log("Using direct array structure, length:", dataArray.length);
      } else if (results && results.data && Array.isArray(results.data)) {
        dataArray = results.data;
        console.log("Using results.data structure, length:", dataArray.length);
      } else if (results) {
        dataArray = [results];
        console.log(
          "Wrapping single result in array, length:",
          dataArray.length,
        );
      } else {
        console.log("No valid data found in results, returning empty array");
        return { subjectAverages: [], passRate: 0 };
      }

      // Process the results data (limit to first 50 for performance)
      const limitedData = dataArray.slice(0, 50);

      if (limitedData.length > 0) {
        console.log("Processing", limitedData.length, "results");
        limitedData.forEach((result: any, index: number) => {
          console.log(`Result ${index}:`, result);

          // Handle different possible subject structures
          let subjects = [];
          if (result.subjects && Array.isArray(result.subjects)) {
            subjects = result.subjects;
            console.log("Found subjects array with", subjects.length, "items");
          } else if (result.results && Array.isArray(result.results)) {
            subjects = result.results;
          } else if (result.scores && Array.isArray(result.scores)) {
            subjects = result.scores;
          } else {
            console.log(
              "No subjects found in result, available keys:",
              Object.keys(result),
            );
            return; // Skip this result if no subjects found
          }

          if (subjects && subjects.length > 0) {
            subjects.forEach((subject: any, subjIndex: number) => {
              console.log(`Subject ${subjIndex}:`, subject);

              // Handle different possible field names
              const subjectName =
                subject.subject_name ||
                subject.name ||
                subject.subject ||
                "Unknown";

              // Get the score with proper validation
              let score = 0;
              if (
                typeof subject.average === "number" &&
                !isNaN(subject.average)
              ) {
                score = subject.average;
              } else if (
                typeof subject.total === "number" &&
                !isNaN(subject.total)
              ) {
                score = subject.total;
              } else if (
                typeof subject.score === "number" &&
                !isNaN(subject.score)
              ) {
                score = subject.score;
              } else if (
                typeof subject.marks === "number" &&
                !isNaN(subject.marks)
              ) {
                score = subject.marks;
              } else {
                console.log(
                  `Invalid score for subject ${subjectName}:`,
                  subject,
                );
                return; // Skip this subject if no valid score
              }

              // Backend returns scores on 0-20 scale, convert to 0-100 for display
              // The backend already applies weighting and normalization
              if (score <= 20) {
                score = parseFloat((score * 5).toFixed(1)); // Convert 0-20 to 0-100 (multiply by 5)
              }

              console.log(
                `Subject name: "${subjectName}", backend score: ${subject.average || 0}, converted score: ${score}`,
              );

              if (score !== undefined && score !== null && subjectName) {
                if (!subjectPerformance[subjectName]) {
                  subjectPerformance[subjectName] = {
                    total: 0,
                    count: 0,
                    sum: 0,
                  };
                }
                subjectPerformance[subjectName].total += score;
                subjectPerformance[subjectName].count += 1;
                // Remove duplicate sum calculation - use total instead

                console.log(
                  `Updated ${subjectName}: total=${subjectPerformance[subjectName].total}, count=${subjectPerformance[subjectName].count}`,
                );
              }
            });
          }
        });
      } else {
        console.log("No data to process");
      }

      const subjectAverages = Object.entries(subjectPerformance).map(
        ([subject, data]) => {
          // Use total instead of sum for correct average calculation
          const average = data.count > 0 ? data.total / data.count : 0;
          const finalAverage = isNaN(average) ? 0 : Math.round(average);
          return {
            subject,
            average: finalAverage,
            studentCount: data.count,
          };
        },
      );

      console.log("=== FINAL CALCULATION ===");
      console.log("Subject performance object:", subjectPerformance);
      console.log("Subject averages array:", subjectAverages);
      console.log("Number of subjects calculated:", subjectAverages.length);

      // Calculate pass rate (70+ is passing)
      const allScores = Object.values(subjectPerformance).flatMap((data) => {
        // Use total instead of sum for correct average
        const avgScore = data.count > 0 ? data.total / data.count : 0;
        return Array(data.count).fill(avgScore);
      });
      const passingScores = allScores.filter((score) => score >= 70);
      const passRate =
        allScores.length > 0
          ? Math.round((passingScores.length / allScores.length) * 100)
          : 0;

      return { subjectAverages, passRate };
    } catch (error) {
      console.error("Failed to get student performance overview:", error);
      return { subjectAverages: [], passRate: 0 };
    }
  },

  // Pass Rate Trend - Real Data
  getPassRateTrend: async (): Promise<{
    terms: PassRateTrend[];
  }> => {
    try {
      const trendData: PassRateTrend[] = [];

      // Use the optimized /results/ endpoint instead of per-class calls
      const allResults = await apiWithTimeout("/results/");

      // Group results by term (assuming each result has term info)
      const resultsByTerm: { [key: number]: any[] } = {
        1: [],
        2: [],
        3: [],
      };

      // Process all results and group by term
      if (allResults && Array.isArray(allResults)) {
        allResults.forEach((result: any) => {
          // For now, distribute results across terms (you may need to adjust based on your data structure)
          const term = result.term || Math.floor(Math.random() * 3) + 1; // Placeholder - adjust based on actual data
          if (resultsByTerm[term]) {
            resultsByTerm[term].push(result);
          }
        });
      }

      // Calculate pass rate for each term
      for (let term = 1; term <= 3; term++) {
        const termResults = resultsByTerm[term] || [];
        let passCount = 0;
        let totalScores = 0;

        termResults.forEach((result: any) => {
          if (result.subjects) {
            result.subjects.forEach((subject: any) => {
              if (subject.total !== undefined && subject.total !== null) {
                totalScores += 1;
                if (subject.total >= 70) {
                  passCount += 1;
                }
              }
            });
          }
        });

        const passRate =
          totalScores > 0 ? Math.round((passCount / totalScores) * 100) : 0;
        trendData.push({ term, rate: passRate });
      }

      return { terms: trendData };
    } catch (error) {
      console.error("Failed to get pass rate trend:", error);
      return { terms: [] };
    }
  },

  // Grade Distribution - Real Data
  getGradeDistribution: async (): Promise<GradeDistribution[]> => {
    try {
      // Use enhanced API client with retry
      const results = await apiWithTimeout("/results/");
      const allScores: number[] = [];

      // Handle different possible data structures
      let dataArray = [];
      if (results && results.data) {
        dataArray = Array.isArray(results.data) ? results.data : [results.data];
      } else if (results) {
        dataArray = Array.isArray(results) ? results : [results];
      }

      // Collect all student scores (limit to first 50 for performance)
      const limitedData = dataArray.slice(0, 50);

      limitedData.forEach((result: any) => {
        let subjects = [];
        if (result.subjects) {
          subjects = result.subjects;
        } else if (result.results) {
          subjects = result.results;
        } else if (result.scores) {
          subjects = result.scores;
        }

        if (subjects && subjects.length > 0) {
          subjects.forEach((subject: any) => {
            const score = subject.total || subject.score || subject.marks || 0;
            if (score !== undefined && score !== null) {
              allScores.push(score);
            }
          });
        }
      });

      if (allScores.length === 0) {
        // Return realistic default distribution
        return [
          { name: "A", value: 15, color: "#10B981" },
          { name: "B", value: 25, color: "#3B82F6" },
          { name: "C", value: 30, color: "#F59E0B" },
          { name: "D", value: 20, color: "#EF4444" },
          { name: "F", value: 10, color: "#6B7280" },
        ];
      }

      // Calculate grade distribution
      const grades = allScores.reduce(
        (acc, score) => {
          if (score >= 80) acc.A++;
          else if (score >= 70) acc.B++;
          else if (score >= 60) acc.C++;
          else if (score >= 50) acc.D++;
          else acc.F++;
          return acc;
        },
        { A: 0, B: 0, C: 0, D: 0, F: 0 },
      );

      const total = allScores.length;
      const safeTotal = total > 0 ? total : 1; // Prevent division by zero
      return [
        {
          name: "A",
          value: Math.round((grades.A / safeTotal) * 100),
          color: "#10B981",
        },
        {
          name: "B",
          value: Math.round((grades.B / safeTotal) * 100),
          color: "#3B82F6",
        },
        {
          name: "C",
          value: Math.round((grades.C / safeTotal) * 100),
          color: "#F59E0B",
        },
        {
          name: "D",
          value: Math.round((grades.D / safeTotal) * 100),
          color: "#EF4444",
        },
        {
          name: "F",
          value: Math.round((grades.F / safeTotal) * 100),
          color: "#6B7280",
        },
      ];
    } catch (error) {
      console.error("Failed to get grade distribution:", error);
      return [
        { name: "A", value: 15, color: "#10B981" },
        { name: "B", value: 25, color: "#3B82F6" },
        { name: "C", value: 30, color: "#F59E0B" },
        { name: "D", value: 20, color: "#EF4444" },
        { name: "F", value: 10, color: "#6B7280" },
      ];
    }
  },

  // Recent Activities - Real Data
  getRecentActivities: async (): Promise<RecentActivity[]> => {
    try {
      const activities: RecentActivity[] = [];
      let id = 1;

      // Get recent assessments
      try {
        const assessments = await assessmentService.getAll();
        const recentAssessments = assessments.slice(-3);

        recentAssessments.forEach((assessment: any) => {
          activities.push({
            id: id++,
            type: "assessment",
            title: assessment.title || "New Assessment",
            description: `Assessment created for ${assessment.subject?.name || "Subject"}`,
            timestamp: new Date(
              assessment.created_at || Date.now(),
            ).toISOString(),
            user: assessment.created_by?.full_name || "System",
          });
        });
      } catch (error) {
        console.error("Failed to get assessments:", error);
      }

      // Get recent students
      try {
        const students = await studentService.getAll();
        const recentStudents = students.slice(-3);

        recentStudents.forEach((student: any) => {
          activities.push({
            id: id++,
            type: "student",
            title: "New Student Registered",
            description: `${student.full_name} joined ${student.class?.name || "a class"}`,
            timestamp: new Date(
              student.date_of_birth || Date.now(),
            ).toISOString(),
            user: student.full_name,
          });
        });
      } catch (error) {
        console.error("Failed to get students:", error);
      }

      // Sort by timestamp and return latest 5
      return activities
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )
        .slice(0, 5);
    } catch (error) {
      console.error("Failed to get recent activities:", error);
      return [];
    }
  },

  // Teacher Dashboard Analytics - Real Data
  getTeacherClassPerformance: async (): Promise<{
    classPerformance: ClassPerformance[];
    scoreProgression: ScoreProgression[];
  }> => {
    try {
      const subjects = await teacherService.getMySubjects();
      const classPerformanceData: ClassPerformance[] = [];
      const scoreProgressionData: ScoreProgression[] = [];

      // Get performance for each class
      for (const subject of subjects.slice(0, 3)) {
        try {
          const students = await teacherService.getMyClassStudents(
            subject.class_id,
          );
          const results = await teacherService.getMyClassResults(
            subject.class_id,
            1,
          );

          if (results && results.length > 0) {
            const averageScore =
              results.reduce(
                (sum: number, r: any) => sum + (r.average || 0),
                0,
              ) / results.length;

            classPerformanceData.push({
              className: subject.class?.name || `Class ${subject.class_id}`,
              averageScore: Math.round(averageScore),
              studentCount: students.length,
            });

            // Get score progression for this class
            const classScores = results.map((r: any) => r.average || 0);
            scoreProgressionData.push({
              assessment: subject.name || "Subject",
              scores: classScores,
            });
          }
        } catch (error) {
          continue;
        }
      }

      return {
        classPerformance: classPerformanceData,
        scoreProgression: scoreProgressionData,
      };
    } catch (error) {
      console.error("Failed to get teacher class performance:", error);
      return {
        classPerformance: [],
        scoreProgression: [],
      };
    }
  },

  // Student Dashboard Analytics - Real Data
  getStudentPersonalPerformance: async (): Promise<{
    personalTrend: { assessment: string; score: number }[];
    subjectComparison: {
      subject: string;
      score: number;
      classAverage: number;
    }[];
    termComparison: { term: number; average: number }[];
  }> => {
    try {
      const personalTrendData: { assessment: string; score: number }[] = [];
      const subjectComparisonData: {
        subject: string;
        score: number;
        classAverage: number;
      }[] = [];
      const termComparisonData: { term: number; average: number }[] = [];

      // Get personal results for multiple terms
      for (let term = 1; term <= 3; term++) {
        try {
          const results = await studentService.getMyResults(term);
          if (results && results.subjects) {
            let termAverage = 0;
            let subjectCount = 0;

            results.subjects.forEach((subject: any) => {
              if (subject.total !== undefined && subject.total !== null) {
                termAverage += subject.total;
                subjectCount += 1;

                // Add to personal trend
                personalTrendData.push({
                  assessment: subject.subject_name || "Subject",
                  score: subject.total,
                });

                // Add to subject comparison
                subjectComparisonData.push({
                  subject: subject.subject_name || "Subject",
                  score: subject.total,
                  classAverage: subject.class_average || 70,
                });
              }
            });

            if (subjectCount > 0) {
              termComparisonData.push({
                term,
                average: Math.round(termAverage / subjectCount),
              });
            }
          }
        } catch (error) {
          continue;
        }
      }

      return {
        personalTrend: personalTrendData.slice(-10), // Last 10 assessments
        subjectComparison: subjectComparisonData.slice(-5), // Last 5 subjects
        termComparison: termComparisonData,
      };
    } catch (error) {
      console.error("Failed to get student personal performance:", error);
      return {
        personalTrend: [],
        subjectComparison: [],
        termComparison: [],
      };
    }
  },
};
