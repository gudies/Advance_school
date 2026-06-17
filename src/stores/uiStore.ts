import { create } from 'zustand';

interface UIStore {
  isSidebarOpen: boolean;
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIStore>((set) => {
  // Initialize theme from system or localStorage
  const savedTheme = localStorage.getItem('advance-theme') as 'light' | 'dark' | null;
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
  
  if (initialTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  return {
    isSidebarOpen: true,
    theme: initialTheme,

    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    
    setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

    toggleTheme: () => set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('advance-theme', newTheme);
      
      if (newTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      
      return { theme: newTheme };
    }),

    setTheme: (theme) => set(() => {
      localStorage.setItem('advance-theme', theme);
      if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      return { theme };
    }),
  };
});
