import { create } from 'zustand';
import type { User, UserProfile } from '../types';
import { useAuthStore } from './authStore';
import { useProfileStore } from './profileStore';

interface AppState {
  token: string | null;
  user: User | null;
  profile: UserProfile | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  setProfile: (profile: UserProfile | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  token: localStorage.getItem('token'),
  user: null,
  profile: null,
  setAuth: (token, user) => {
    useAuthStore.getState().setAuth(token, user);
    set({ token, user });
  },
  clearAuth: () => {
    useAuthStore.getState().clearAuth();
    useProfileStore.getState().setProfile(null);
    set({ token: null, user: null, profile: null });
  },
  setProfile: (profile) => {
    useProfileStore.getState().setProfile(profile);
    set({ profile });
  },
}));
