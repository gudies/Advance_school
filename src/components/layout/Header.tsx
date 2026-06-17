import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { useConfirmationStore } from '../../stores/confirmationStore';
import { Menu, Bell, Search, Sun, Moon, LogOut } from 'lucide-react';

export default function Header() {
  const { logout } = useAuthStore();
  const { isSidebarOpen, toggleSidebar, theme, toggleTheme } = useUIStore();
  const { askConfirm } = useConfirmationStore();

  return (
    <header 
      className="fixed top-0 right-0 bg-surface-primary/80 backdrop-blur-md border-b border-border-secondary z-[150] flex items-center justify-between px-4 transition-all duration-300"
      style={{ 
        height: 'var(--header-height)',
        left: isSidebarOpen ? 'var(--sidebar-width)' : 'var(--sidebar-collapsed-width)'
      }}
    >
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-md text-secondary hover:bg-surface-tertiary transition-colors"
        >
          <Menu size={20} />
        </button>
        
        <div className="hidden md:block max-w-md w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" size={18} />
            <input 
              type="text" 
              placeholder="Search students, staff, or settings..." 
              className="w-full bg-surface-secondary border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-shadow"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full text-secondary hover:bg-surface-tertiary transition-colors"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <button className="p-2 rounded-full text-secondary hover:bg-surface-tertiary transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full animate-pulse" />
        </button>

        <div className="h-8 w-[1px] bg-border-secondary mx-1"></div>

        <button 
          onClick={() => askConfirm({
            title: 'Sign Out',
            message: 'Are you sure you want to log out of the school management dashboard?',
            confirmLabel: 'Logout',
            type: 'danger',
            onConfirm: logout
          })}
          className="flex items-center gap-2 p-2 rounded-md text-secondary hover:bg-danger-50 hover:text-danger-600 transition-colors"
          title="Sign Out"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium hidden sm:block">Logout</span>
        </button>
      </div>
    </header>
  );
}
