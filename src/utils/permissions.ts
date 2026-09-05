import { UserRole } from '@/types/user';

export const ROLE_PERMISSIONS = {
  SUPERUSER: [
    'admin:users:create',
    'admin:users:read',
    'admin:students:create',
    'admin:students:read',
    'admin:students:update',
    'admin:students:delete',
    'admin:teachers:create',
    'admin:teachers:read',
    'admin:teachers:update',
    'admin:teachers:delete',
    'admin:classes:create',
    'admin:classes:read',
    'admin:classes:update',
    'admin:classes:delete',
    'admin:subjects:create',
    'admin:subjects:read',
    'admin:subjects:update',
    'admin:subjects:delete',
    'admin:class-subjects:create',
    'admin:class-subjects:read',
    'admin:class-subjects:update',
    'admin:class-subjects:delete',
    'assessments:read',
    'assessments:update',
    'assessments:delete',
  ],
  ADMIN: [
    'admin:students:create',
    'admin:students:read',
    'admin:students:update',
    'admin:students:delete',
    'admin:teachers:create',
    'admin:teachers:read',
    'admin:teachers:update',
    'admin:teachers:delete',
    'admin:classes:create',
    'admin:classes:read',
    'admin:classes:update',
    'admin:classes:delete',
    'admin:subjects:create',
    'admin:subjects:read',
    'admin:subjects:update',
    'admin:subjects:delete',
    'admin:class-subjects:create',
    'admin:class-subjects:read',
    'admin:class-subjects:update',
    'admin:class-subjects:delete',
    'assessments:read',
    'assessments:update',
    'assessments:delete',
  ],
  TEACHER: [
    'teacher:assessments:create',
    'teacher:assessments:read',
    'teacher:assessments:update',
    'teacher:assessments:delete',
    'teacher:scores:create',
    'teacher:scores:read',
    'teacher:classes:read',
    'teacher:results:read',
    'teacher:profile:read',
  ],
  STUDENT: [
    'student:profile:read',
    'student:results:read',
    'student:class:read',
  ],
};

export const hasPermission = (role: UserRole, permission: string): boolean => {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
};

export const hasAnyPermission = (role: UserRole, permissions: string[]): boolean => {
  return permissions.some(permission => hasPermission(role, permission));
};

export const getDashboardRoute = (role: UserRole): string => {
  switch (role) {
    case 'SUPERUSER':
    case 'ADMIN':
      return '/admin/dashboard';
    case 'TEACHER':
      return '/teacher/dashboard';
    case 'STUDENT':
      return '/student/dashboard';
    default:
      return '/auth/login';
  }
};
