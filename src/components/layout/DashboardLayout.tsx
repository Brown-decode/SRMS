import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopNavbar } from "./TopNavbar";
import { useTheme } from "@/contexts/ThemeContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDark } = useTheme();

  return (
    <div className="h-screen flex overflow-hidden bg-white dark:bg-neutral-900 test-dark">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <TopNavbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-white dark:bg-neutral-900 test-dark">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
