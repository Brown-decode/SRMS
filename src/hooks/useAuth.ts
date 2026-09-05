import { useAuth as useAuthContext } from '@/contexts/AuthContext';
import { UserRole } from '@/types/user';

export const useAuth = () => {
  const auth = useAuthContext();
  
  const hasRole = (role: UserRole): boolean => {
    return auth.user?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return auth.user ? roles.includes(auth.user.role) : false;
  };

  const isAdmin = (): boolean => hasRole('ADMIN');
  const isTeacher = (): boolean => hasRole('TEACHER');
  const isStudent = (): boolean => hasRole('STUDENT');
  const isSuperuser = (): boolean => hasRole('SUPERUSER');

  const canAccessAdmin = (): boolean => hasAnyRole(['ADMIN', 'SUPERUSER']);
  const canAccessTeacher = (): boolean => isTeacher();
  const canAccessStudent = (): boolean => isStudent();

  return {
    ...auth,
    hasRole,
    hasAnyRole,
    isAdmin,
    isTeacher,
    isStudent,
    isSuperuser,
    canAccessAdmin,
    canAccessTeacher,
    canAccessStudent,
  };
};
