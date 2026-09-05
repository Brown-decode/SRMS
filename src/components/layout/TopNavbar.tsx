import React from "react";
import { Menu, Sun, Moon, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";

interface TopNavbarProps {
  onMenuClick: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="bg-card dark:bg-neutral-800 shadow-sm border-b border-neutral-200 dark:border-neutral-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Menu button only */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Right side - Theme toggle and user menu */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
              title="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-6 w-6" />
              ) : (
                <Moon className="h-6 w-6" />
              )}
            </button>

            {/* User dropdown */}
            <div className="relative">
              <div className="flex items-center space-x-3">
                <div className="text-right hidden lg:block">
                  <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {user?.full_name}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    {user?.role}
                  </div>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>

            {/* Logout button (mobile) */}
            <button
              onClick={logout}
              className="lg:hidden p-2 rounded-full text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            >
              <LogOut className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
