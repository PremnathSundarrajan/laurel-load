import { apiRequest } from "./queryClient";
import type { LoginRequest } from "@shared/schema";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<{ user: AuthUser }> => {
    const response = await apiRequest("POST", "/api/auth/login", credentials);
    return response.json();
  },

  logout: async (): Promise<void> => {
    await apiRequest("POST", "/api/auth/logout");
  },

  getCurrentUser: async (): Promise<{ user: AuthUser }> => {
    const response = await apiRequest("GET", "/api/auth/me");
    return response.json();
  },
};
