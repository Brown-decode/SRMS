import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const RoleBasedRedirect: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  switch (user.role) {
    case "ADMIN":
      return <Navigate to="/admin/dashboard" replace />;
    case "TEACHER":
      return <Navigate to="/teacher/dashboard" replace />;
    case "STUDENT":
      return <Navigate to="/student/dashboard" replace />;
    default:
      return <Navigate to="/auth/login" replace />;
  }
};
