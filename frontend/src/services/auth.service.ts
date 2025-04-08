import api from './api';
import { User, LoginCredentials, RegisterData } from '../types/auth';

interface AuthResponse {
  user: User;
  token: string;
}

const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    return { user, token };
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    return { user, token };
  },

  logout(): void {
    localStorage.removeItem('token');
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  getStoredToken(): string | null {
    return localStorage.getItem('token');
  },
};

export default authService; 