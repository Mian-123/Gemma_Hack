import { create } from 'zustand';

interface AIState {
  inFlightCalls: Record<string, boolean>;
  lastResults: Record<string, any>;
  setInFlight: (feature: string, loading: boolean) => void;
  setLastResult: (feature: string, result: any) => void;
}

export const useAIStore = create<AIState>((set) => ({
  inFlightCalls: {},
  lastResults: {},
  setInFlight: (feature, loading) =>
    set((state) => ({
      inFlightCalls: { ...state.inFlightCalls, [feature]: loading },
    })),
  setLastResult: (feature, result) =>
    set((state) => ({
      lastResults: { ...state.lastResults, [feature]: result },
    })),
}));
