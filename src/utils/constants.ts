export const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL || "http://localhost:8000";

export const ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    UNAUTHORIZED: "/auth/unauthorized",
  },
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    USERS: "/auth/users",
    STUDENTS: "/students",
    TEACHERS: "/teachers",
    CLASSES: "/classes",
    SUBJECTS: "/subjects",
    CLASS_SUBJECTS: "/class-subjects",
  },
  TEACHER: {
    DASHBOARD: "/teacher/dashboard",
    ASSESSMENTS: "/assessment",
    CLASSES: "/classes",
    RESULTS: "/assessment",
    PROFILE: "/teachers/me",
  },
  STUDENT: {
    DASHBOARD: "/student/dashboard",
    RESULTS: "/students/me/results",
    CLASS: "/students/me/class",
    PROFILE: "/students/me",
  },
} as const;

export const USER_ROLES = {
  ADMIN: "ADMIN",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
  SUPERUSER: "SUPERUSER",
} as const;

export const STORAGE_KEYS = {
  TOKEN: "srms_access_token",
  USER: "srms_user",
} as const;
