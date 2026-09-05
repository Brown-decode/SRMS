export type UserRole = "ADMIN" | "TEACHER" | "STUDENT" | "SUPERUSER";

export interface User {
  id: number;
  full_name: string;
  loginid: string;
  role: UserRole;
  is_active: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface UserCreate {
  full_name: string;
  loginid: string;
}

export interface AdminCreate {
  full_name: string;
  email: string;
  password: string;
}

export interface TeacherResponse {
  id: number;
  user_id: number;
  full_name: string;
  loginid: string;
}
