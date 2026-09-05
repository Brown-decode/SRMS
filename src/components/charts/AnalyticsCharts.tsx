import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { useChartTheme } from "@/hooks/useChartTheme";

// Enhanced TypeScript interfaces for better type safety
export interface ClassPerformanceData {
  className: string;
  passRate: number;
  totalStudents: number;
  passedStudents: number;
}

export interface SubjectPerformanceData {
  subject: string;
  average: number;
  studentCount: number;
}

export interface ChartConfig {
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  barColor?: string;
  borderRadius?: number;
  animationDuration?: number;
}

export interface SubjectPerformanceChartProps {
  data: SubjectPerformanceData[] | ClassPerformanceData[];
  title?: string;
  loading?: boolean;
  error?: string | null;
  config?: ChartConfig;
  onDataPointClick?: (
    data: SubjectPerformanceData | ClassPerformanceData,
  ) => void;
  className?: string;
  isClassChart?: boolean;
}

// Reusable chart configuration defaults
const DEFAULT_CHART_CONFIG: ChartConfig = {
  height: 300,
  showGrid: true,
  showTooltip: true,
  barColor: "#2563EB",
  borderRadius: 8,
  animationDuration: 1000,
};

// Custom tooltip component for better UX
const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: any[];
  label?: string;
  isClassChart?: boolean;
}> = ({ active, payload, label, isClassChart = false }) => {
  const { colors } = useChartTheme();

  if (active && payload && payload.length) {
    const data = payload[0].payload;
    if (isClassChart) {
      const classData = data as ClassPerformanceData;
      return (
        <div
          className="p-3 rounded-lg shadow-lg border"
          style={{
            backgroundColor: colors.tooltipBackground,
            borderColor: colors.tooltipBorder,
            color: colors.tooltipText,
          }}
        >
          <p className="font-semibold text-sm mb-2">{label}</p>
          <p style={{ color: colors.success }}>
            Pass Rate: {classData.passRate}%
          </p>
          <p style={{ color: colors.primary }}>
            Passed: {classData.passedStudents}/{classData.totalStudents}
          </p>
        </div>
      );
    } else {
      const subjectData = data as SubjectPerformanceData;
      return (
        <div
          className="p-3 rounded-lg shadow-lg border"
          style={{
            backgroundColor: colors.tooltipBackground,
            borderColor: colors.tooltipBorder,
            color: colors.tooltipText,
          }}
        >
          <p className="font-semibold text-sm mb-2">{label}</p>
          <p style={{ color: colors.primary }}>
            Average: {subjectData.average}%
          </p>
          <p className="text-xs" style={{ color: colors.subText }}>
            Students: {subjectData.studentCount}
          </p>
        </div>
      );
    }
  }
  return null;
};

// Loading skeleton component
const ChartSkeleton: React.FC<{ config?: ChartConfig }> = ({
  config = DEFAULT_CHART_CONFIG,
}) => (
  <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
    <div
      className="bg-gray-100 rounded animate-pulse"
      style={{ height: config.height }}
    >
      <div className="flex items-end justify-around h-full p-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-gray-300 rounded-t"
            style={{
              width: "40px",
              height: `${Math.random() * 60 + 20}%`,
            }}
          />
        ))}
      </div>
    </div>
  </div>
);

// Error state component
const ChartError: React.FC<{ error: string; onRetry?: () => void }> = ({
  error,
  onRetry,
}) => (
  <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="text-red-500 mb-3">
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h4 className="text-lg font-semibold text-gray-900 mb-2">
        Unable to Load Chart
      </h4>
      <p className="text-gray-600 text-sm mb-4">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Retry
        </button>
      )}
    </div>
  </div>
);

// Empty state component
const ChartEmpty: React.FC<{ message?: string }> = ({
  message = "No data available",
}) => (
  <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="text-gray-400 mb-3">
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </div>
      <h4 className="text-lg font-semibold text-gray-900 mb-2">No Data</h4>
      <p className="text-gray-600 text-sm">{message}</p>
    </div>
  </div>
);

export const SubjectPerformanceChart: React.FC<
  SubjectPerformanceChartProps
> = ({
  data,
  title = "Performance Overview",
  loading = false,
  error = null,
  config = DEFAULT_CHART_CONFIG,
  onDataPointClick,
  className = "",
  isClassChart = false,
}) => {
  const { colors, chartConfig } = useChartTheme();

  // Handle different states
  if (loading) {
    return <ChartSkeleton config={config} />;
  }

  if (error) {
    return (
      <ChartError error={error} onRetry={() => window.location.reload()} />
    );
  }

  if (!data || data.length === 0) {
    return (
      <ChartEmpty
        message={
          isClassChart
            ? "No class performance data available"
            : "No subject performance data available"
        }
      />
    );
  }

  // Performance optimization: memoize the chart data
  const chartData = React.useMemo(() => {
    return data.map((item) => {
      if (isClassChart) {
        const classItem = item as ClassPerformanceData;
        return {
          ...classItem,
          // Ensure pass rate is within valid range
          passRate: Math.min(100, Math.max(0, classItem.passRate)),
        };
      } else {
        const subjectItem = item as SubjectPerformanceData;
        return {
          ...subjectItem,
          // Ensure average is within valid range
          average: Math.min(100, Math.max(0, subjectItem.average)),
        };
      }
    });
  }, [data, isClassChart]);

  // Handle bar click with accessibility
  const handleBarClick = React.useCallback(
    (data: any) => {
      if (onDataPointClick && data && data.payload) {
        onDataPointClick(data.payload);
      }
    },
    [onDataPointClick],
  );

  return (
    <div
      className={`bg-white dark:bg-neutral-800 rounded-xl shadow-soft border border-neutral-200 dark:border-neutral-700 p-6 ${className}`}
    >
      {/* Header with title and metadata */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          {title}
        </h3>
        <div className="flex items-center space-x-2 text-sm text-neutral-500 dark:text-neutral-400">
          <span>
            {data.length} {isClassChart ? "classes" : "subjects"}
          </span>
          <span>•</span>
          <span>
            {isClassChart
              ? data.reduce(
                  (sum, item) =>
                    sum + (item as ClassPerformanceData).totalStudents,
                  0,
                )
              : data.reduce(
                  (sum, item) =>
                    sum + (item as SubjectPerformanceData).studentCount,
                  0,
                )}{" "}
            total students
          </span>
        </div>
      </div>

      {/* Main chart */}
      <ResponsiveContainer width="100%" height={config.height}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          {/* Grid */}
          {config.showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={colors.grid}
              vertical={false}
            />
          )}

          {/* Axes */}
          <XAxis
            dataKey={isClassChart ? "className" : "subject"}
            tick={chartConfig.axis.tick}
            axisLine={chartConfig.axis.axisLine}
            tickLine={chartConfig.axis.tickLine}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={chartConfig.axis.tick}
            axisLine={chartConfig.axis.axisLine}
            tickLine={chartConfig.axis.tickLine}
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickFormatter={(value) => `${value}%`}
          />

          {/* Tooltip */}
          {config.showTooltip && (
            <Tooltip
              content={<CustomTooltip isClassChart={isClassChart} />}
              cursor={{ fill: "rgba(37, 99, 235, 0.1)" }}
            />
          )}

          {/* Main bars */}
          <Bar
            dataKey={isClassChart ? "passRate" : "average"}
            fill={config.barColor}
            radius={[config.borderRadius, config.borderRadius, 0, 0]}
            animationDuration={config.animationDuration}
            onClick={handleBarClick}
            className="cursor-pointer"
          >
            {/* Custom bar labels for better UX */}
            {chartData.map((entry, index) => {
              const value = isClassChart
                ? (entry as ClassPerformanceData).passRate
                : (entry as SubjectPerformanceData).average;
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    value >= 70
                      ? colors.success
                      : value >= 50
                        ? colors.warning
                        : colors.error
                  }
                />
              );
            })}
          </Bar>

          {/* Reference line for passing grade */}
          <ReferenceLine
            y={70}
            stroke={colors.success}
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{ value: "Passing Grade (70%)", position: "right" }}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Footer with insights */}
      <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-neutral-600 dark:text-neutral-400">
                Excellent (≥70%)
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-neutral-600 dark:text-neutral-400">
                Average (50-69%)
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-neutral-600 dark:text-neutral-400">
                Below Average (&lt;50%)
              </span>
            </div>
          </div>
          <div className="text-neutral-500 dark:text-neutral-400">
            Average:{" "}
            {Math.round(
              data.reduce((sum, item) => sum + item.average, 0) / data.length,
            )}
            %
          </div>
        </div>
      </div>
    </div>
  );
};

// Pass Rate Trend Chart Component
interface PassRateData {
  term: number;
  rate: number;
}

export const PassRateTrendChart: React.FC<{
  data: PassRateData[];
  title?: string;
}> = ({ data, title = "Pass Rate Trend" }) => {
  return (
    <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="term"
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
            formatter={(value: number) => `${value}%`}
            labelFormatter={(label: any) => `Term ${label.term}`}
          />
          <Line
            type="monotone"
            dataKey="rate"
            stroke="#22C55E"
            strokeWidth={2}
            dot={{ fill: "#22C55E", r: 4 }}
            name="Pass Rate"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Score Distribution Chart Component
interface ScoreDistributionData {
  range: string;
  count: number;
  percentage: number;
}

export const ScoreDistributionChart: React.FC<{
  data: ScoreDistributionData[];
  title?: string;
}> = ({ data, title = "Score Distribution" }) => {
  return (
    <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="range"
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
          <Bar dataKey="count" fill="#0EA5E9" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Subject Comparison Radar Chart Component
interface SubjectComparisonData {
  subject: string;
  score: number;
  classAverage: number;
}

export const SubjectComparisonRadar: React.FC<{
  data: SubjectComparisonData[];
  title?: string;
}> = ({ data, title = "Subject Comparison" }) => {
  const radarData = data.map((item) => ({
    subject: item.subject,
    score: item.score,
    classAverage: item.classAverage,
  }));

  return (
    <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#6B7280", fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: "#6B7280", fontSize: 10 }}
          />
          <Radar
            name="Your Score"
            dataKey="score"
            stroke="#2563EB"
            fill="#2563EB"
            fillOpacity={0.6}
          />
          <Radar
            name="Class Average"
            dataKey="classAverage"
            stroke="#EF4444"
            fill="#EF4444"
            fillOpacity={0.3}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              border: "none",
              borderRadius: "8px",
              color: "#F9FAFB",
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Result Summary Card Component
interface ResultSummaryData {
  total: number;
  passed: number;
  failed: number;
  passRate: number;
}

export const ResultSummaryCard: React.FC<{
  data: ResultSummaryData;
  title?: string;
}> = ({ data, title = "Results Summary" }) => {
  return (
    <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{data.passed}</div>
          <div className="text-sm text-gray-500">Passed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{data.failed}</div>
          <div className="text-sm text-gray-500">Failed</div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {data.passRate}%
          </div>
          <div className="text-sm text-gray-500">Pass Rate</div>
        </div>
      </div>
    </div>
  );
};

// Top Performers Chart Component
interface TopPerformerData {
  name: string;
  score: number;
  rank?: number;
}

export const TopPerformersChart: React.FC<{
  data: TopPerformerData[];
  title?: string;
}> = ({ data, title = "Top Performers" }) => {
  return (
    <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            type="number"
            tick={{ fill: "#6B7280", fontSize: 12 }}
            axisLine={{ stroke: "#E5E7EB" }}
          />
          <YAxis
            dataKey="name"
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
          <Bar dataKey="score" fill="#22C55E" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Class Comparison Chart Component
interface ClassComparisonData {
  className: string;
  averageScore: number;
  studentCount: number;
}

export const ClassComparisonChart: React.FC<{
  data: ClassComparisonData[];
  title?: string;
}> = ({ data, title = "Class Comparison" }) => {
  return (
    <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="className"
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
          <Bar dataKey="averageScore" fill="#0EA5E9" radius={[8, 8, 0, 0]} />
          <Bar dataKey="studentCount" fill="#F59E0B" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
