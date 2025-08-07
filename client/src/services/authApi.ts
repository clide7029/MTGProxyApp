import { AxiosResponse } from 'axios';
import api from './api';
import { LoginCredentials, RegisterData, User } from '../store/slices/authSlice';
import { handleError } from '../utils/errorHandling';

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<User> => {
    try {
      const response: AxiosResponse<AuthResponse> = await api.post('/auth/login', credentials);
      localStorage.setItem('token', response.data.token);
      return response.data.user;
    } catch (error) {
      throw handleError(error);
    }
  },

  register: async (data: RegisterData): Promise<User> => {
    try {
      const response: AxiosResponse<AuthResponse> = await api.post('/auth/register', data);
      localStorage.setItem('token', response.data.token);
      return response.data.user;
    } catch (error) {
      throw handleError(error);
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('token');
    } catch (error) {
      throw handleError(error);
    }
  },

  refreshToken: async (): Promise<void> => {
    try {
      const response: AxiosResponse<{ token: string }> = await api.post('/auth/refresh');
      localStorage.setItem('token', response.data.token);
    } catch (error) {
      throw handleError(error);
    }
  },

  getCurrentUser: async (): Promise<User> => {
    try {
      const response: AxiosResponse<User> = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  }
};