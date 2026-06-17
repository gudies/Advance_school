import React from 'react';
import { useAuthStore } from '../../../stores/authStore';
import { Permission } from '../../../types/auth';

interface PermissionGateProps {
  children: React.ReactNode;
  permission: Permission;
  fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permission,
  fallback = null,
}) => {
  const { user } = useAuthStore();

  const hasPermission = user?.permissions.includes(permission) || user?.role === 'super_admin';

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
