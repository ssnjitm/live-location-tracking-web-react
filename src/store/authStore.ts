import { create } from 'zustand';
import type { User as FirebaseUser } from 'firebase/auth';

interface AuthStore {
  user: FirebaseUser | null;
  isAdmin: boolean;
  setUser: (user: FirebaseUser | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAdmin: false,
  setUser: (user) => set({ user }),
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  logout: () => set({ user: null, isAdmin: false }),
}));