import React, { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { StatCard } from "@/components/ui/StatCard";
import { StatsGrid } from "@/components/ui/StatsGrid";
import { ChartCard } from "@/components/ui/ChartCard";
import { Users, BookOpen, TrendingUp, Award, Calendar } from "lucide-react";
import {
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { dashboardService } from "@/services/api/dashboard";
import { studentService } from "@/services/api/students";
import { useNavigate } from "react-router-dom";

export const StudentDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    overallAverage: 0,
    totalSubjects: 0,
    pendingAssignments: 0,
    classRank: 0,
  });
  const [subjectPerformance, setSubjectPerformance] = useState<any[]>([]);
  const [gradeTrend, setGradeTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        setLoading(true);

        // Get student stats
        const studentStats = await dashboardService.getStudentStats();
        setStats(studentStats);

        // Get student results for subject performance (collect data from all terms)
        const allTermsSubjectData: any[] = [];
        const subjectMap = new Map<string, number[]>(); // To aggregate subject data across terms

        try {
          // Collect data from all terms (1, 2, 3)
          for (let term = 1; term <= 3; term++) {
            try {
              const termResults = await studentService.getMyResults(term);
              console.log(`Term ${term} results for radar chart:`, termResults);

              if (
                termResults &&
                termResults.subjects &&
                termResults.subjects.length > 0
              ) {
                termResults.subjects.forEach((s: any) => {
                  const subjectName = s.subject_name || "Unknown";
                  const score = Math.round((s.average || 0) * 100) / 100;

                  if (!subjectMap.has(subjectName)) {
                    subjectMap.set(subjectName, [0, 0, 0]); // Initialize with zeros for all terms
                  }
                  const scores = subjectMap.get(subjectName)!;
                  scores[term - 1] = score; // Store by term index
                });
              }
            } catch (error) {
              console.warn(
                `No data available for Term ${term} in radar chart:`,
                error,
              );
            }
          }

          // Convert to radar chart format
          subjectMap.forEach((scores, subjectName) => {
            const dataPoint: {
              subject: string;
              term1: number;
              term2: number;
              term3: number;
            } = {
              subject: subjectName,
              term1: scores[0] || 0,
              term2: scores[1] || 0,
              term3: scores[2] || 0,
            };
            allTermsSubjectData.push(dataPoint);
          });

          console.log("Radar chart data (all terms):", allTermsSubjectData);
        } catch (error) {
          console.error("Failed to load multi-term subject data:", error);
        }

        setSubjectPerformance(allTermsSubjectData);

        // Get real grade trend data from different terms (show 0 for missing terms)
        const gradeTrendData: { month: string; score: number }[] = [];
        try {
          // Try to get data from multiple terms (1, 2, 3)
          for (let term = 1; term <= 3; term++) {
            try {
              const termResults = await studentService.getMyResults(term);
              console.log(`Term ${term} results:`, termResults);

              // Check if we have valid results with subjects
              if (
                termResults &&
                termResults.subjects &&
                termResults.subjects.length > 0
              ) {
                const termAverage = termResults.average || 0;
                console.log(`Term ${term} average:`, termAverage);
                gradeTrendData.push({
                  month: `Term ${term}`,
                  score: Math.round(termAverage * 100) / 100, // Round to 2 decimal places
                });
              } else {
                // Show 0 for terms with no data
                console.warn(`No subjects data for Term ${term}, showing 0`);
                gradeTrendData.push({
                  month: `Term ${term}`,
                  score: 0,
                });
              }
            } catch (error) {
              // Show 0 for terms with errors
              console.warn(
                `No data available for Term ${term}, showing 0:`,
                error,
              );
              gradeTrendData.push({
                month: `Term ${term}`,
                score: 0,
              });
            }
          }
          console.log("Final grade trend data:", gradeTrendData);
        } catch (error) {
          console.error("Failed to load grade trend data:", error);
          // Show all terms as 0 if everything fails
          for (let term = 1; term <= 3; term++) {
            gradeTrendData.push({
              month: `Term ${term}`,
              score: 0,
            });
          }
        }

        setGradeTrend(gradeTrendData);

        setLoading(false);
      } catch (error) {
        console.error("Failed to load student data:", error);
        setLoading(false);
      }
    };

    loadStudentData();
  }, []);

  return (
    <PageContainer
      title="Student Dashboard"
      subtitle="Track your academic progress and performance"
    >
      <StatsGrid>
        <StatCard
          title="Overall Average"
          value={loading ? "..." : `${stats.overallAverage}%`}
          icon={Award}
          description="Current semester average"
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Total Subjects"
          value={loading ? "..." : stats.totalSubjects.toString()}
          icon={BookOpen}
          description="Active subjects"
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Pending Assignments"
          value={loading ? "..." : stats.pendingAssignments.toString()}
          icon={Calendar}
          description="Due this week"
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Class Rank"
          value={loading ? "..." : `#${stats.classRank}`}
          icon={TrendingUp}
          description="Out of class"
          trend={{ value: 0, isPositive: true }}
        />
      </StatsGrid>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Subject Performance (All Terms)">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={subjectPerformance}>
              <PolarGrid
                gridType="polygon"
                radialLines={true}
                stroke="#E5E7EB"
              />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "#6B7280", fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 20]}
                tick={{ fill: "#6B7280", fontSize: 10 }}
                tickCount={5}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "none",
                  borderRadius: "8px",
                  color: "#F9FAFB",
                }}
                formatter={(value: number, name: string) => [
                  `${value.toFixed(1)}`,
                  name.replace("term", "Term "),
                ]}
              />
              <Radar
                name="Term 1"
                dataKey="term1"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Radar
                name="Term 2"
                dataKey="term2"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Radar
                name="Term 3"
                dataKey="term3"
                stroke="#F59E0B"
                fill="#F59E0B"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
          <div className="mt-4 flex justify-center space-x-6 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Term 1</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Term 2</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Term 3</span>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Grade Trend">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={gradeTrend}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#6B7280", fontSize: 12 }}
                axisLine={{ stroke: "#E5E7EB" }}
              />
              <YAxis
                tick={{ fill: "#6B7280", fontSize: 12 }}
                axisLine={{ stroke: "#E5E7EB" }}
                domain={[0, 20]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "none",
                  borderRadius: "8px",
                  color: "#F9FAFB",
                }}
                formatter={(value: number) => [`${value.toFixed(1)}`, "Score"]}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: "#10B981", r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 flex justify-center">
            <div className="flex items-center text-sm">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Term Performance</span>
            </div>
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/student/results")}
              className="w-full text-left px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:shadow-soft group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 group-hover:text-primary">
                    View Results
                  </div>
                  <div className="text-sm text-gray-500">
                    Check latest grades
                  </div>
                </div>
                <BookOpen className="h-5 w-5 text-gray-400 group-hover:text-primary" />
              </div>
            </button>
            <button
              onClick={() => navigate("/student/profile")}
              className="w-full text-left px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:shadow-soft group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 group-hover:text-primary">
                    My Profile
                  </div>
                  <div className="text-sm text-gray-500">
                    Update information
                  </div>
                </div>
                <Users className="h-5 w-5 text-gray-400 group-hover:text-primary" />
              </div>
            </button>
            <button
              onClick={() => navigate("/student/class")}
              className="w-full text-left px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:shadow-soft group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 group-hover:text-primary">
                    My Class
                  </div>
                  <div className="text-sm text-gray-500">
                    View class information
                  </div>
                </div>
                <Calendar className="h-5 w-5 text-gray-400 group-hover:text-primary" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
