import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/user";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  Building2,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const { user, logout } = useAuth();

  const navigation: NavItem[] = [
    {
      name: "Dashboard",
      href:
        user?.role === "TEACHER"
          ? "/teacher/dashboard"
          : user?.role === "STUDENT"
            ? "/student/dashboard"
            : "/admin/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      roles: ["ADMIN", "SUPERUSER", "TEACHER", "STUDENT"],
    },
    {
      name: "Class Assignments",
      href: "/admin/users",
      icon: <BookOpen className="h-5 w-5" />,
      roles: ["ADMIN", "SUPERUSER"],
    },
    {
      name: "Students",
      href: "/admin/students",
      icon: <GraduationCap className="h-5 w-5" />,
      roles: ["ADMIN", "SUPERUSER"],
    },
    {
      name: "Teachers",
      href: "/admin/teachers",
      icon: <Users className="h-5 w-5" />,
      roles: ["ADMIN", "SUPERUSER"],
    },
    {
      name: "Classes",
      href: "/admin/classes",
      icon: <Building2 className="h-5 w-5" />,
      roles: ["ADMIN", "SUPERUSER"],
    },
    {
      name: "Subjects",
      href: "/admin/subjects",
      icon: <BookOpen className="h-5 w-5" />,
      roles: ["ADMIN", "SUPERUSER"],
    },
    {
      name: "Results",
      href: "/admin/results",
      icon: <FileText className="h-5 w-5" />,
      roles: ["ADMIN", "SUPERUSER"],
    },
    {
      name: "My Classes",
      href: "/teacher/classes",
      icon: <Building2 className="h-5 w-5" />,
      roles: ["TEACHER"],
    },
    {
      name: "Subjects",
      href: "/teacher/subjects",
      icon: <BookOpen className="h-5 w-5" />,
      roles: ["TEACHER"],
    },
    {
      name: "Assessments",
      href: "/teacher/assessments",
      icon: <FileText className="h-5 w-5" />,
      roles: ["TEACHER"],
    },
    {
      name: "Scores",
      href: "/teacher/scores",
      icon: <FileText className="h-5 w-5" />,
      roles: ["TEACHER"],
    },
    {
      name: "Profile",
      href: "/teacher/profile",
      icon: <Users className="h-5 w-5" />,
      roles: ["TEACHER"],
    },
    {
      name: "My Results",
      href: "/student/results",
      icon: <BookOpen className="h-5 w-5" />,
      roles: ["STUDENT"],
    },
    {
      name: "Profile",
      href: "/student/profile",
      icon: <Users className="h-5 w-5" />,
      roles: ["STUDENT"],
    },
    {
      name: "Profile",
      href: "/admin/profile",
      icon: <Users className="h-5 w-5" />,
      roles: ["ADMIN", "SUPERUSER"],
    },
  ];

  const filteredNavigation = navigation.filter(
    (item) => user && item.roles.includes(user.role),
  );

  return (
    <>
      {/* Mobile sidebar overlay */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-neutral-900 bg-opacity-75"
            onClick={onClose}
          />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-card dark:bg-neutral-800 shadow-lg transform transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:inset-0
      `}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              SRMS
            </h1>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 px-2 space-y-1">
            {filteredNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "bg-primary-500 text-white"
                      : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100"
                  }`
                }
              >
                {React.isValidElement(item.icon)
                  ? React.cloneElement(item.icon, { className: "mr-3 h-5 w-5" })
                  : item.icon}
                {item.name}
              </NavLink>
            ))}
          </nav>

          <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-700">
            <button
              onClick={logout}
              className="group flex items-center px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100 w-full"
            >
              <LogOut className="h-5 w-5" />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
