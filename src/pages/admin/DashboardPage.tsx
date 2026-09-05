import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { StatCard } from "@/components/ui/StatCard";
import { StatsGrid } from "@/components/ui/StatsGrid";
import { ChartCard } from "@/components/ui/ChartCard";
import {
  Users,
  GraduationCap,
  BookOpen,
  Building2,
  AlertCircle,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { dashboardService } from "@/services/api/dashboard";
import {
  PassRateTrendChart,
  ResultSummaryCard,
} from "@/components/charts/AnalyticsCharts";

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [classPerformance, setClassPerformance] = useState<any>(null); // Updated from subjectPerformance
  const [passRateTrend, setPassRateTrend] = useState<any>(null);
  const [gradeDistribution, setGradeDistribution] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load all dashboard data in parallel with error handling
        const [statsData, subjectPerformanceData, passRateTrendData, grades] =
          await Promise.allSettled([
            dashboardService.getAdminStats(),
            dashboardService.getStudentPerformanceOverview(),
            dashboardService.getPassRateTrend(),
            dashboardService.getGradeDistribution(),
          ]);

        // Handle results and calculate trends
        const statsResult =
          statsData.status === "fulfilled" ? statsData.value : null;
        const classResult =
          subjectPerformanceData.status === "fulfilled"
            ? subjectPerformanceData.value
            : null;
        const passRateResult =
          passRateTrendData.status === "fulfilled"
            ? passRateTrendData.value
            : null;
        const gradesResult =
          grades.status === "fulfilled" ? grades.value : null;

        // Check if any critical APIs failed
        const hasCriticalErrors = statsData.status === "rejected";

        if (hasCriticalErrors) {
          setError(
            "Unable to connect to the server. Please check your connection and try again.",
          );
          return; // Don't set any data if critical APIs failed
        }

        // Set the data
        if (statsResult) {
          setStats(statsResult);
        }

        if (classResult) {
          setClassPerformance(classResult);
        }

        if (passRateResult) {
          setPassRateTrend(passRateResult);
        }

        if (gradesResult) {
          setGradeDistribution(gradesResult);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        setError("Failed to load dashboard data. Please refresh the page.");
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []); // Run only once on mount

  return (
    <PageContainer
      title="Admin Dashboard"
      subtitle="Welcome to School Results Management System"
    >
      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
              <span className="text-sm font-medium text-red-800">{error}</span>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-soft border border-gray-100 p-6"
            >
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        // Don't show stats when there's an error
        <div className="mb-6">
          <p className="text-center text-gray-500">
            Dashboard unavailable due to connection issues.
          </p>
        </div>
      ) : (
        <StatsGrid>
          <StatCard
            title="Total Students"
            value={stats?.totalStudents?.toString() || "0"}
            icon={Users}
            description="Active students this semester"
            trend={stats?.trends?.students || { value: 0, isPositive: true }}
          />
          <StatCard
            title="Total Teachers"
            value={stats?.totalTeachers?.toString() || "0"}
            icon={GraduationCap}
            description="Teaching staff members"
            trend={stats?.trends?.teachers || { value: 0, isPositive: true }}
          />
          <StatCard
            title="Total Classes"
            value={stats?.totalClasses?.toString() || "0"}
            icon={Building2}
            description="Active classes"
            trend={stats?.trends?.classes || { value: 0, isPositive: true }}
          />
          <StatCard
            title="Total Subjects"
            value={stats?.totalSubjects?.toString() || "0"}
            icon={BookOpen}
            description="Subjects offered"
            trend={stats?.trends?.subjects || { value: 0, isPositive: true }}
          />
        </StatsGrid>
      )}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Class Performance Overview */}
        <div className="lg:col-span-2">
          <ChartCard title="Class Performance Overview">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={classPerformance?.classPerformance || []}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="className"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "none",
                    borderRadius: "8px",
                    color: "#F9FAFB",
                  }}
                  formatter={(value: number, name: string) => [
                    name === "passRate" ? `${value}%` : value,
                    name === "passRate"
                      ? "Pass Rate"
                      : name === "totalStudents"
                        ? "Total Students"
                        : "Passed",
                  ]}
                />
                <Bar
                  dataKey="totalStudents"
                  fill="#E5E7EB"
                  name="totalStudents"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="passedStudents"
                  fill="#10B981"
                  name="passedStudents"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Pass Rate Trend */}
        <div className="lg:col-span-1">
          <PassRateTrendChart
            data={passRateTrend?.terms || []}
            title="Pass Rate Trend"
          />
        </div>
      </div>

      {/* Overall Performance Summary */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          How is the whole school performing?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {classPerformance?.overallPassRate || 0}%
            </div>
            <div className="text-sm text-gray-500">Overall Pass Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(
                (classPerformance?.classPerformance?.reduce(
                  (sum: number, c: any) => sum + c.passRate,
                  0,
                ) || 0) / (classPerformance?.classPerformance?.length || 1),
              ) || 0}
              %
            </div>
            <div className="text-sm text-gray-500">Average Class Pass Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {classPerformance?.classPerformance?.length || 0}
            </div>
            <div className="text-sm text-gray-500">Classes Tracked</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Grade Distribution */}
        <ChartCard title="Grade Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={gradeDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {gradeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "none",
                  borderRadius: "8px",
                  color: "#F9FAFB",
                }}
                formatter={(value: number) => `${value}%`}
              />
              <Legend
                verticalAlign="middle"
                align="right"
                layout="vertical"
                wrapperStyle={{
                  fontSize: "12px",
                  color: "#6B7280",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/admin/students")}
                className="w-full text-left px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:shadow-soft group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-primary">
                      Add New Student
                    </div>
                    <div className="text-sm text-gray-500">
                      Register a new student
                    </div>
                  </div>
                  <Users className="h-5 w-5 text-gray-400 group-hover:text-primary" />
                </div>
              </button>
              <button
                onClick={() => navigate("/admin/teachers")}
                className="w-full text-left px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:shadow-soft group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-primary">
                      Add Teacher
                    </div>
                    <div className="text-sm text-gray-500">
                      Register new teacher
                    </div>
                  </div>
                  <GraduationCap className="h-5 w-5 text-gray-400 group-hover:text-primary" />
                </div>
              </button>
              <button
                onClick={() => navigate("/admin/classes")}
                className="w-full text-left px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:shadow-soft group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-primary">
                      Create Class
                    </div>
                    <div className="text-sm text-gray-500">Add new class</div>
                  </div>
                  <Building2 className="h-5 w-5 text-gray-400 group-hover:text-primary" />
                </div>
              </button>
              <button
                onClick={() => navigate("/admin/subjects")}
                className="w-full text-left px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:shadow-soft group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-primary">
                      Add Subject
                    </div>
                    <div className="text-sm text-gray-500">
                      Create new subject
                    </div>
                  </div>
                  <BookOpen className="h-5 w-5 text-gray-400 group-hover:text-primary" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
        <ResultSummaryCard
          data={{
            total:
              classPerformance?.classPerformance?.reduce(
                (sum: number, c: any) => sum + c.totalStudents,
                0,
              ) || 0,
            passed:
              classPerformance?.classPerformance?.reduce(
                (sum: number, c: any) => sum + c.passedStudents,
                0,
              ) || 0,
            failed:
              classPerformance?.classPerformance?.reduce(
                (sum: number, c: any) =>
                  sum + (c.totalStudents - c.passedStudents),
                0,
              ) || 0,
            passRate: Math.round(
              (classPerformance?.classPerformance?.reduce(
                (sum: number, c: any) => sum + c.passRate,
                0,
              ) || 0) / (classPerformance?.classPerformance?.length || 1),
            ),
          }}
        />
      </div>
    </PageContainer>
  );
};
