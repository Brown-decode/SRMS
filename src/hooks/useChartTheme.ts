import { useTheme } from "@/contexts/ThemeContext";

export const useChartTheme = () => {
  const { isDark } = useTheme();

  return {
    isDark,
    colors: {
      // Background colors
      background: isDark ? "#1f2937" : "#ffffff",
      cardBackground: isDark ? "#374151" : "#ffffff",

      // Text colors
      text: isDark ? "#f9fafb" : "#111827",
      subText: isDark ? "#d1d5db" : "#6b7280",

      // Grid and axis colors
      grid: isDark ? "#374151" : "#e5e7eb",
      axis: isDark ? "#4b5563" : "#e5e7eb",

      // Tooltip colors
      tooltipBackground: isDark ? "#1f2937" : "#ffffff",
      tooltipBorder: isDark ? "#374151" : "#e5e7eb",
      tooltipText: isDark ? "#f9fafb" : "#111827",

      // Chart colors (these work well in both themes)
      primary: "#2563eb",
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#0ea5e9",
    },

    // Chart configuration
    chartConfig: {
      grid: {
        strokeDasharray: "3 3",
        stroke: isDark ? "#374151" : "#e5e7eb",
      },
      axis: {
        tick: { fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 12 },
        axisLine: { stroke: isDark ? "#4b5563" : "#e5e7eb" },
        tickLine: { stroke: isDark ? "#4b5563" : "#e5e7eb" },
      },
      tooltip: {
        contentStyle: {
          backgroundColor: isDark ? "#1f2937" : "#ffffff",
          border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
          borderRadius: "8px",
          color: isDark ? "#f9fafb" : "#111827",
        },
      },
    },
  };
};
