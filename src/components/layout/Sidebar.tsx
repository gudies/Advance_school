import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { ROLE_NAV_ITEMS, NavItem } from '../../constants/roles';
import { Link, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuthStore();
  const { isSidebarOpen } = useUIStore();
  const location = useLocation();

  if (!user) return null;

  const navItems = ROLE_NAV_ITEMS[user.role] || [];

  const renderIcon = (iconName: string) => {
    const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ size?: number }>>)[iconName];
    return IconComponent ? <IconComponent size={20} /> : <Icons.Circle size={20} />;
  };

  return (
    <aside 
      className={`fixed left-0 top-0 h-full bg-surface-primary border-r border-border-secondary transition-all duration-300 z-[200] flex flex-col`}
      style={{ width: isSidebarOpen ? 'var(--sidebar-width)' : 'var(--sidebar-collapsed-width)' }}
    >
      {/* Brand area */}
      <div className="h-[64px] flex items-center px-4 border-b border-border-secondary shrink-0 overflow-hidden" style={{ height: 'var(--header-height)' }}>
        <div className="w-10 h-10 flex items-center justify-center shrink-0">
          <img src="/logo_transparent.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <div className={`ml-3 whitespace-nowrap transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
          <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 leading-tight">Camied Behills</h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Int. School</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
        {navItems.map((item: NavItem) => {
          const isActive = location.pathname.startsWith(item.path);
          
          return (
            <div key={item.path}>
              <Link 
                to={item.path}
                className={`flex items-center px-3 py-2.5 rounded-md transition-all duration-200 group ${
                  isActive 
                    ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 font-medium' 
                    : 'text-secondary hover:bg-surface-tertiary hover:text-primary-600'
                }`}
                title={!isSidebarOpen ? item.label : undefined}
              >
                <div className={`shrink-0 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-tertiary group-hover:text-primary-500'}`}>
                  {renderIcon(item.icon)}
                </div>
                <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                  {item.label}
                </span>
                
                {item.children && isSidebarOpen && (
                  <div className="ml-auto">
                    <Icons.ChevronDown size={16} className={`transition-transform ${isActive ? 'rotate-180' : ''}`} />
                  </div>
                )}
              </Link>
              
              {/* Children (Only show if parent active and sidebar open) */}
              {item.children && isActive && isSidebarOpen && (
                <div className="mt-1 ml-4 pl-4 border-l border-border-secondary space-y-1">
                  {item.children.map((child: NavItem) => {
                    const isChildActive = location.pathname === child.path;
                    return (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                          isChildActive
                            ? 'text-primary-600 font-medium bg-surface-primary'
                            : 'text-tertiary hover:text-primary-500 hover:bg-surface-tertiary'
                        }`}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User profile snippet at bottom */}
      <div className={`border-t border-border-secondary p-4 shrink-0 overflow-hidden transition-all duration-300 ${!isSidebarOpen ? 'flex justify-center' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex-center font-bold shrink-0">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div className={`whitespace-nowrap transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
            <p className="font-semibold text-sm truncate w-32">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-tertiary capitalize">{user.role.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
