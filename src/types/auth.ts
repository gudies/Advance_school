import { ID, DateString, Status } from './common';

export type UserRole = 'super_admin' | 'admin' | 'teacher' | 'parent' | 'student';

export type Permission = 
  | 'manage_users' 
  | 'manage_students' 
  | 'manage_staff' 
  | 'manage_fees' 
  | 'manage_academics' 
  | 'view_reports'
  | 'view_own_student'
  | 'view_own_child'
  | 'enter_grades'
  | 'pay_fees';

export interface User {
  id: ID;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  avatar?: string;
  status: Status;
  lastLogin?: DateString;
  createdAt: DateString;
  permissions: Permission[];
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ActivityLog {
  id: ID;
  userId: ID;
  userName: string;
  action: string;
  module: string;
  details?: string;
  ipAddress?: string;
  timestamp: DateString;
}
