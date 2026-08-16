import { createContext } from 'react';
import type { AdminUser } from './api';

export type AuthContextType = {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
};

// Singleton context — lives outside HMR invalidation boundary
export const AuthContext = createContext<AuthContextType | null>(null);
