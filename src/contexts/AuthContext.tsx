import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "@/services/api/auth";
import { studentService } from "@/services/api/students";
import { teacherService } from "@/services/api/teachers";
import { setToken, removeToken, getToken } from "@/services/storage/token";
import { setUser, removeUser, getUser } from "@/services/storage/user";
import { AuthContextType, AuthState } from "@/types/auth";
import { UserRole } from "@/types/user";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const initAuth = () => {
      const token = getToken();
      const user = getUser();

      if (token && user) {
        setState({
          user,
          token,
          isAuthenticated: true,
          loading: false,
          error: null,
        });
      } else {
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        });
      }
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await authService.login({ username, password });
      const token = response.access_token;
      console.log("Login successful, token:", token.substring(0, 20) + "...");

      // Set token first so subsequent API calls work
      setToken(token);

      // Get user info from backend (includes role)
      const currentUser = await authService.getCurrentUser();
      console.log("Current user from backend:", currentUser);

      // Get detailed profile based on role
      let user;
      if (currentUser.role === "STUDENT") {
        try {
          const studentUser = await studentService.getMyProfile();
          console.log("Student profile found:", studentUser);
          user = {
            id: studentUser.id,
            full_name: studentUser.full_name,
            loginid: studentUser.user?.full_name || studentUser.matricule,
            role: "STUDENT" as UserRole,
            is_active: true,
          };
        } catch (error: any) {
          console.error(
            "Student profile fetch failed:",
            error.response?.data?.detail || error.message,
          );
          throw new Error("Failed to fetch student profile");
        }
      } else if (currentUser.role === "TEACHER") {
        try {
          const teacherUser = await teacherService.getMyProfile();
          console.log("Teacher profile found:", teacherUser);
          user = {
            id: teacherUser.id,
            full_name: teacherUser.full_name,
            loginid: teacherUser.loginid,
            role: "TEACHER" as UserRole,
            is_active: true,
          };
        } catch (error: any) {
          console.error(
            "Teacher profile fetch failed:",
            error.response?.data?.detail || error.message,
          );
          throw new Error("Failed to fetch teacher profile");
        }
      } else {
        // Admin or other roles - use basic user info
        console.log("Admin/Superuser role detected, using basic user info");
        user = {
          id: currentUser.id,
          full_name: currentUser.full_name,
          loginid: currentUser.loginid,
          role: currentUser.role as UserRole,
          is_active: true,
        };
      }

      setUser(user);

      setState({
        user,
        token,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      // Clear any existing token on failed login
      removeToken();
      removeUser();

      const errorMessage =
        error.response?.data?.detail || error.message || "Login failed";
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: errorMessage,
      });
      throw error;
    }
  };

  const logout = () => {
    // Clear token and user data
    removeToken();
    removeUser();

    // Reset state
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    });

    // Force reload to clear any cached state
    window.location.href = "/auth/login";
  };

  const value: AuthContextType = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    login,
    logout,
    error: state.error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
