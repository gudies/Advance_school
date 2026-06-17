import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import Sidebar from './Sidebar';
import Header from './Header';

export default function DashboardLayout() {
  const { isAuthenticated } = useAuthStore();
  const { isSidebarOpen } = useUIStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-surface-secondary text-text-primary" style={{ minHeight: '100vh', backgroundColor: 'var(--color-surface-secondary)', color: 'var(--color-text-primary)' }}>
      <Sidebar />
      <Header />
      
      <main 
        className="transition-all duration-300 relative"
        style={{ 
          marginLeft: isSidebarOpen ? 'var(--sidebar-width)' : 'var(--sidebar-collapsed-width)',
          paddingTop: 'var(--header-height)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div className="p-4 sm:p-6 md:p-8 flex-1 max-w-[1600px] w-full mx-auto" style={{ padding: '2rem', flex: 1, maxWidth: '1600px', width: '100%', margin: '0 auto' }}>
          {/* Outlet renders the child route component */}
          <Outlet />
        </div>
      </main>
    </div>
  );
}
