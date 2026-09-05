import { apiClient } from "./client";
import { ROUTES } from "@/utils/constants";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  full_name: string;
  loginid: string;
  role: string;
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    // Backend expects OAuth2PasswordRequestForm format
    const formData = new URLSearchParams();
    formData.append("username", credentials.username);
    formData.append("password", credentials.password);

    return apiClient.post<LoginResponse>(
      `${ROUTES.AUTH.LOGIN}`,
      formData.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );
  },

  getCurrentUser: async (): Promise<User> => {
    return await apiClient.get<User>("/auth/me");
  },

  getUsers: async (): Promise<User[]> => {
    return await apiClient.get<User[]>(`${ROUTES.ADMIN.USERS}`);
  },

  createAdmin: async (userData: {
    full_name: string;
    email: string;
    password: string;
  }): Promise<User> => {
    return await apiClient.post<User>("/auth/admin", userData);
  },
};
