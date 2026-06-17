import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User, LoginCredentials } from '../types/auth';

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

// Mock auth check against seed users
const checkCredentials = async (credentials: LoginCredentials): Promise<User> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  const storedUsers = localStorage.getItem('advance_users');
  const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];
  
  const user = users.find(u => u.email === credentials.email);
  if (!user || credentials.password !== `${user.role}123`) {
    throw new Error('Invalid email or password');
  }
  
  return user;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const user = await checkCredentials(credentials);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : 'Invalid email or password';
          set({ error: errMsg, isLoading: false });
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      setUser: (user) => {
        set({ user, isAuthenticated: true });
      },
    }),
    {
      name: 'advance-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
