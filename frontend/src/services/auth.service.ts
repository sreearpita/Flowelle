import api from './api';
import { DataExport, PrivacySettings, User, LoginCredentials, RegisterData } from '../types/auth';

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

  async updateProfile(profileData: Partial<User>): Promise<User> {
    const response = await api.put<User>('/auth/me', profileData);
    return response.data;
  },

  async getPrivacySettings(): Promise<PrivacySettings> {
    const response = await api.get<PrivacySettings>('/auth/me/privacy');
    return response.data;
  },

  async updatePrivacySettings(settings: Partial<PrivacySettings>): Promise<PrivacySettings> {
    const response = await api.put<PrivacySettings>('/auth/me/privacy', settings);
    return response.data;
  },

  async exportData(): Promise<DataExport> {
    const response = await api.get<DataExport>('/auth/me/export');
    return response.data;
  },

  async deleteData(): Promise<PrivacySettings> {
    const response = await api.delete<PrivacySettings>('/auth/me/data');
    return response.data;
  },
};

export default authService; 
