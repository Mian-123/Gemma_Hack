import { create } from 'zustand';
import { User, UserProfile } from '../types';

interface AppState {
  token: string | null;
  user: User | null;
  profile: UserProfile | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  setProfile: (profile: UserProfile) => void;
}

export const useAppStore = create<AppState>((set) => ({
  token: localStorage.getItem('token'),
  user: null,
  profile: null,
  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    set({ token, user });
  },
  clearAuth: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, profile: null });
  },
  setProfile: (profile) => set({ profile }),
}));
