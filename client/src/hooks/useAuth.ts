import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import { ApiResponse, User } from '../types';

export const useAuth = () => {
  const { setAuth, clearAuth, token } = useAppStore();

  const loginMutation = useMutation({
    mutationFn: async (credentials: Record<string, string>) => {
      const res = await api.post<any, ApiResponse<{ token: string; user: User }>>('/auth/login', credentials);
      if (res.success && res.data) {
        setAuth(res.data.token, res.data.user);
      }
      return res;
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: Record<string, string>) => {
      const res = await api.post<any, ApiResponse<{ token: string; user: User }>>('/auth/register', credentials);
      if (res.success && res.data) {
        setAuth(res.data.token, res.data.user);
      }
      return res;
    },
  });

  const logout = () => {
    clearAuth();
  };

  return {
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout,
    isAuthenticated: !!token,
    isLoading: loginMutation.isPending || registerMutation.isPending,
  };
};
