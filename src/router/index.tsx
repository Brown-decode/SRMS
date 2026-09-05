import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { RoleBasedRedirect } from "@/components/common/RoleBasedRedirect";
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Auth Pages
import { LoginPage } from "@/pages/auth/LoginPage";
import { UnauthorizedPage } from "@/pages/auth/UnauthorizedPage";

// Dashboard Pages
import { AdminDashboardPage } from "@/pages/admin/DashboardPage";
import { TeacherDashboardPage } from "@/pages/teacher/DashboardPage";
import { StudentDashboardPage } from "@/pages/student/DashboardPage";

// Management Pages
import { StudentsPage } from "@/pages/admin/StudentsPage";
import { TeachersPage } from "@/pages/admin/TeachersPage";
import { ClassesPage } from "@/pages/admin/ClassesPage";
import { SubjectsPage } from "@/pages/admin/SubjectsPage";
import { ResultsPage as AdminResultsPage } from "@/pages/admin/ResultsPage";
import { TeacherAssignmentsPage } from "@/pages/admin/TeacherAssignmentsPage";

// Teacher Pages
import { ScoresPage } from "@/pages/teacher/ScoresPage";
import { ClassesPage as TeacherClassesPage } from "@/pages/teacher/ClassesPage";
import { TeacherSubjectsPage } from "@/pages/teacher/SubjectsPage";
import { TeacherAssessmentsPage } from "@/pages/teacher/AssessmentsPage";
import { TeacherProfilePage } from "@/pages/teacher/TeacherProfilePage";
import { AssessmentDebug } from "@/components/debug/AssessmentDebug";
import { ClassPerformanceDebug } from "@/components/debug/ClassPerformanceDebug";
import { TeacherAssignmentsDebug } from "@/components/debug/TeacherAssignmentsDebug";
import { SimpleDebug } from "@/components/debug/SimpleDebug";

// Student Pages
import { StudentResultsPage } from "@/pages/student/ResultsPage";
import { ProfilePage as StudentProfilePage } from "@/pages/student/ProfilePage";

// Admin Pages
import { AdminProfilePage } from "@/pages/admin/AdminProfilePage";

// Error Pages
import { NotFoundPage } from "@/pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/auth/login",
    element: (
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    ),
  },
  {
    path: "/auth/unauthorized",
    element: (
      <AuthProvider>
        <UnauthorizedPage />
      </AuthProvider>
    ),
  },
  {
    path: "/",
    element: (
      <AuthProvider>
        <ProtectedRoute>
          <AppLayout>
            <Outlet />
          </AppLayout>
        </ProtectedRoute>
      </AuthProvider>
    ),
    children: [
      {
        index: true,
        element: <RoleBasedRedirect />,
      },
      {
        path: "admin",
        element: (
          <DashboardLayout>
            <Outlet />
          </DashboardLayout>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="/admin/dashboard" replace />,
          },
          {
            path: "dashboard",
            element: <AdminDashboardPage />,
          },
          {
            path: "users",
            element: <TeacherAssignmentsPage />,
          },
          {
            path: "students",
            element: <StudentsPage />,
          },
          {
            path: "teachers",
            element: <TeachersPage />,
          },
          {
            path: "classes",
            element: <ClassesPage />,
          },
          {
            path: "subjects",
            element: <SubjectsPage />,
          },
          {
            path: "results",
            element: <AdminResultsPage />,
          },
          {
            path: "profile",
            element: <AdminProfilePage />,
          },
        ],
      },
      {
        path: "teacher",
        element: (
          <DashboardLayout>
            <Outlet />
          </DashboardLayout>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="/teacher/dashboard" replace />,
          },
          {
            path: "dashboard",
            element: <TeacherDashboardPage />,
          },
          {
            path: "assessments",
            element: <TeacherAssessmentsPage />,
          },
          {
            path: "scores",
            element: <ScoresPage />,
          },
          {
            path: "debug-assessments",
            element: <AssessmentDebug />,
          },
          {
            path: "debug-class-performance",
            element: <ClassPerformanceDebug />,
          },
          {
            path: "debug-teacher-assignments",
            element: <TeacherAssignmentsDebug />,
          },
          {
            path: "debug-simple",
            element: <SimpleDebug />,
          },
          {
            path: "classes",
            element: <TeacherClassesPage />,
          },
          {
            path: "subjects",
            element: <TeacherSubjectsPage />,
          },
          {
            path: "profile",
            element: <TeacherProfilePage />,
          },
        ],
      },
      {
        path: "student",
        element: (
          <DashboardLayout>
            <Outlet />
          </DashboardLayout>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="/student/dashboard" replace />,
          },
          {
            path: "dashboard",
            element: <StudentDashboardPage />,
          },
          {
            path: "results",
            element: <StudentResultsPage />,
          },
          {
            path: "profile",
            element: <StudentProfilePage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
