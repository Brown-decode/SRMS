import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { StatCard } from "@/components/ui/StatCard";
import { StatsGrid } from "@/components/ui/StatsGrid";
import { ChartCard } from "@/components/ui/ChartCard";
import {
  Users,
  BookOpen,
  Building2,
  TrendingUp,
  Calendar,
  Award,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { dashboardService } from "@/services/api/dashboard";
import { teacherService } from "@/services/api/teachers";
import { apiClient } from "@/services/api/client";

export const TeacherDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    pendingAssessments: 0,
    averagePerformance: 0,
    previousPerformance: 0,
    totalSubjects: 0,
  });
  const [trends, setTrends] = useState({
    classesTrend: { value: 0, isPositive: true },
    studentsTrend: { value: 0, isPositive: true },
    assessmentsTrend: { value: 0, isPositive: false },
    performanceTrend: { value: 0, isPositive: true },
  });
  const [classPerformance, setClassPerformance] = useState<any[]>([]);
  const [subjectDistribution, setSubjectDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentAssessments, setRecentAssessments] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const refreshData = async () => {
    setRefreshing(true);
    // Reload the component by re-running the data loading logic
    window.location.reload();
  };

  useEffect(() => {
    const loadTeacherData = async () => {
      try {
        setLoading(true);

        // Get teacher stats (includes all calculations)
        const teacherStats = await dashboardService.getTeacherStats();

        setStats({
          ...teacherStats,
          previousPerformance: stats.averagePerformance,
        });

        // Calculate simple trends (can be enhanced later)
        const newTrends = {
          classesTrend: { value: 0, isPositive: teacherStats.totalClasses > 0 },
          studentsTrend: {
            value: 0,
            isPositive: teacherStats.totalStudents > 0,
          },
          assessmentsTrend: {
            value: 0,
            isPositive: teacherStats.pendingAssessments === 0,
          },
          performanceTrend: {
            value: 0,
            isPositive: teacherStats.averagePerformance > 0,
          },
        };

        setTrends(newTrends);

        // Get teacher's class subjects for distribution
        const classSubjects = await teacherService.getMyClassSubjects();
        console.log("â Class subjects for distribution:", classSubjects);

        // Create subject distribution data - group by subject name and count classes
        const subjectGroups = new Map();
        classSubjects.forEach((cs: any) => {
          const subjectName =
            cs.subject_name || cs.name || `Subject ${cs.subject_id}`;
          if (subjectGroups.has(subjectName)) {
            subjectGroups.set(subjectName, subjectGroups.get(subjectName) + 1);
          } else {
            subjectGroups.set(subjectName, 1);
          }
        });

        const subjectData = Array.from(subjectGroups.entries()).map(
          ([name, value], index) => ({
            name,
            value, // Number of classes this subject is taught in
            color: ["#2563EB", "#0EA5E9", "#22C55E", "#F59E0B", "#EF4444"][
              index % 5
            ],
          }),
        );
        console.log("â Subject distribution data:", subjectData);
        setSubjectDistribution(subjectData);

        // Get real class performance data using correct endpoints
        const classPerformanceData = [];
        try {
          // For each class subject, get results
          for (const cs of classSubjects) {
            // Show all classes
            try {
              const response = await apiClient.get(
                `/classes/${cs.class_id}/results?term=1`,
              );
              console.log(`â Results for class ${cs.class_id}:`, response);

              // API returns array directly, not wrapped in response.data
              const classResults = Array.isArray(response)
                ? response
                : response.data && Array.isArray(response.data)
                  ? response.data
                  : [];

              if (classResults.length > 0) {
                const average =
                  classResults.reduce(
                    (sum: number, r: any) => sum + (r.average || 0),
                    0,
                  ) / classResults.length;
                classPerformanceData.push({
                  class: cs.class_name || `Class ${cs.class_id}`,
                  average: Math.round(average),
                  students: classResults.length,
                } as any);
              } else {
                // Get student count if no results
                const studentsResponse = await apiClient.get(
                  `/classes/${cs.class_id}/students`,
                );
                console.log(
                  `â Students for class ${cs.class_id}:`,
                  studentsResponse,
                );

                // API returns array directly, not wrapped in response.data
                const students = Array.isArray(studentsResponse)
                  ? studentsResponse
                  : studentsResponse.data &&
                      Array.isArray(studentsResponse.data)
                    ? studentsResponse.data
                    : [];

                classPerformanceData.push({
                  class: cs.class_name || `Class ${cs.class_id}`,
                  average: 0,
                  students: students.length,
                } as any);
              }
            } catch (classError) {
              console.warn(
                `Could not get data for class ${cs.class_id}:`,
                classError,
              );
            }
          }
        } catch (error) {
          console.error("Error getting class performance:", error);
          // Don't use fake data - let the chart show empty if data fails to load
        }

        setClassPerformance(classPerformanceData);

        setLoading(false);
      } catch (error) {
        console.error("Failed to load teacher data:", error);
        setLoading(false);
      }
    };

    loadTeacherData();
  }, []);

  return (
    <PageContainer
      title="Teacher Dashboard"
      subtitle="Manage your classes and track student progress"
      actions={
        <button
          onClick={refreshData}
          disabled={refreshing}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          title="Refresh Dashboard Data"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      }
    >
      <StatsGrid>
        <StatCard
          title="My Classes"
          value={loading ? "..." : stats.totalClasses.toString()}
          icon={Building2}
          description="Total number of assigned classes"
          trend={trends.classesTrend}
          onClick={() => navigate("/teacher/classes")}
          clickable={true}
        />
        <StatCard
          title="Total Students"
          value={loading ? "..." : stats.totalStudents.toString()}
          icon={Users}
          description="Unique students across classes"
          trend={trends.studentsTrend}
          onClick={() => navigate("/teacher/classes")}
          clickable={true}
        />
        <StatCard
          title="My Subjects"
          value={loading ? "..." : stats.totalSubjects.toString()}
          icon={BookOpen}
          description="Total number of subjects taught"
          trend={trends.assessmentsTrend}
          onClick={() => navigate("/teacher/subjects")}
          clickable={true}
        />
        <StatCard
          title="Performance"
          value={loading ? "..." : `${stats.averagePerformance}%`}
          icon={Award}
          description="Overall student performance"
          trend={trends.performanceTrend}
        />
      </StatsGrid>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Class Performance">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={classPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="class"
                tick={{ fill: "#6B7280", fontSize: 12 }}
                axisLine={{ stroke: "#E5E7EB" }}
              />
              <YAxis
                tick={{ fill: "#6B7280", fontSize: 12 }}
                axisLine={{ stroke: "#E5E7EB" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "none",
                  borderRadius: "8px",
                  color: "#F9FAFB",
                }}
              />
              <Bar dataKey="average" fill="#2563EB" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Subject Distribution"
          onClick={() => navigate("/teacher/classes")}
          clickable={true}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={subjectDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {subjectDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "2px solid #E5E7EB",
                  borderRadius: "8px",
                  color: "#1F2937", // Dark text on light background
                  fontSize: "14px",
                  padding: "12px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value, name) => [name, `${value} classes`]}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
            title="Refresh Dashboard"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => navigate("/teacher/assessments")}
            className="w-full text-left px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:shadow-soft group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 group-hover:text-primary">
                  Enter Scores
                </div>
                <div className="text-sm text-gray-500">
                  Grade recent assessments
                </div>
              </div>
              <BookOpen className="h-5 w-5 text-gray-400 group-hover:text-primary" />
            </div>
          </button>
          <button
            onClick={() => navigate("/teacher/assessments")}
            className="w-full text-left px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:shadow-soft group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 group-hover:text-primary">
                  Create Assignment
                </div>
                <div className="text-sm text-gray-500">Set new homework</div>
              </div>
              <Calendar className="h-5 w-5 text-gray-400 group-hover:text-primary" />
            </div>
          </button>
          <button
            onClick={() => navigate("/teacher/assessments")}
            className="w-full text-left px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:shadow-soft group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 group-hover:text-primary">
                  View Reports
                </div>
                <div className="text-sm text-gray-500">Class performance</div>
              </div>
              <TrendingUp className="h-5 w-5 text-gray-400 group-hover:text-primary" />
            </div>
          </button>
        </div>
      </div>
    </PageContainer>
  );
};
