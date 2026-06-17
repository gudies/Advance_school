import { type UserRole } from '../types/auth';

export interface NavItem {
  label: string;
  path: string;
  icon: string;
  children?: NavItem[];
}

export const ROLE_NAV_ITEMS: Record<UserRole, NavItem[]> = {
  super_admin: [
    { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'Admin Panel', path: '/admin', icon: 'Shield', children: [
      { label: 'User Management', path: '/admin/users', icon: 'Users' },
      { label: 'Settings', path: '/admin/settings', icon: 'Settings' },
      { label: 'Approvals', path: '/admin/approvals', icon: 'CheckCircle' },
      { label: 'Activity Log', path: '/admin/activity-log', icon: 'Activity' },
    ]},
    { label: 'Students', path: '/students', icon: 'GraduationCap', children: [
      { label: 'All Students', path: '/students', icon: 'Users' },
      { label: 'Enrollment', path: '/students/enroll', icon: 'UserPlus' },
      { label: 'Admissions', path: '/students/admissions', icon: 'ClipboardList' },
    ]},
    { label: 'Staff', path: '/staff', icon: 'Briefcase', children: [
      { label: 'All Staff', path: '/staff', icon: 'Users' },
      { label: 'Register Staff', path: '/staff/register', icon: 'UserPlus' },
      { label: 'Attendance', path: '/staff/attendance', icon: 'CalendarCheck' },
      { label: 'Leave Management', path: '/staff/leave', icon: 'CalendarOff' },
      { label: 'Departments', path: '/staff/departments', icon: 'Building2' },
    ]},
    { label: 'Fee Management', path: '/fees', icon: 'Wallet', children: [
      { label: 'Overview', path: '/fees', icon: 'BarChart3' },
      { label: 'Fee Setup', path: '/fees/setup', icon: 'Settings' },
      { label: 'Payments', path: '/fees/payments', icon: 'CreditCard' },
      { label: 'Outstanding', path: '/fees/outstanding', icon: 'AlertCircle' },
    ]},
    { label: 'Finance', path: '/finance', icon: 'DollarSign', children: [
      { label: 'Dashboard', path: '/finance', icon: 'BarChart3' },
      { label: 'Invoices', path: '/finance/invoices', icon: 'FileText' },
      { label: 'Income', path: '/finance/income', icon: 'TrendingUp' },
      { label: 'Expenses', path: '/finance/expenses', icon: 'TrendingDown' },
      { label: 'Budget', path: '/finance/budget', icon: 'PieChart' },
    ]},
    { label: 'Expenditure', path: '/expenditure', icon: 'Receipt', children: [
      { label: 'Overview', path: '/expenditure', icon: 'BarChart3' },
      { label: 'Record Expense', path: '/expenditure/record', icon: 'Plus' },
      { label: 'Procurement', path: '/expenditure/procurement', icon: 'ShoppingCart' },
      { label: 'Approvals', path: '/expenditure/approvals', icon: 'CheckCircle' },
    ]},
    { label: 'Payroll', path: '/payroll', icon: 'Banknote', children: [
      { label: 'Dashboard', path: '/payroll', icon: 'BarChart3' },
      { label: 'Payslips', path: '/payroll/payslips', icon: 'FileText' },
      { label: 'History', path: '/payroll/history', icon: 'Clock' },
    ]},
    { label: 'Academics', path: '/academics', icon: 'BookOpen', children: [
      { label: 'Overview', path: '/academics', icon: 'BarChart3' },
      { label: 'Exam Results', path: '/academics/results', icon: 'ClipboardList' },
      { label: 'Report Cards', path: '/academics/report-cards', icon: 'FileText' },
      { label: 'Assessments', path: '/academics/assessments', icon: 'PenTool' },
      { label: 'Attendance', path: '/academics/attendance', icon: 'CalendarCheck' },
    ]},
    { label: 'Canteen', path: '/canteen', icon: 'UtensilsCrossed', children: [
      { label: 'Dashboard', path: '/canteen', icon: 'BarChart3' },
      { label: 'Menu', path: '/canteen/menu', icon: 'Book' },
      { label: 'Sales', path: '/canteen/sales', icon: 'ShoppingBag' },
      { label: 'Inventory', path: '/canteen/inventory', icon: 'Package' },
    ]},
    { label: 'Communication', path: '/communication', icon: 'MessageSquare', children: [
      { label: 'Announcements', path: '/communication/announcements', icon: 'Megaphone' },
      { label: 'Messages', path: '/communication/messages', icon: 'Mail' },
      { label: 'Events', path: '/communication/events', icon: 'Calendar' },
    ]},
    { label: 'Reports', path: '/reports', icon: 'FileBarChart', children: [
      { label: 'Academic', path: '/reports/academic', icon: 'BookOpen' },
      { label: 'Financial', path: '/reports/financial', icon: 'DollarSign' },
      { label: 'Fee Payments', path: '/reports/fee-payments', icon: 'Wallet' },
      { label: 'Audit', path: '/reports/audit', icon: 'Shield' },
    ]},
  ],
  admin: [
    { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'Students', path: '/students', icon: 'GraduationCap' },
    { label: 'Staff', path: '/staff', icon: 'Briefcase' },
    { label: 'Fee Management', path: '/fees', icon: 'Wallet' },
    { label: 'Finance', path: '/finance', icon: 'DollarSign' },
    { label: 'Academics', path: '/academics', icon: 'BookOpen' },
    { label: 'Communication', path: '/communication', icon: 'MessageSquare' },
    { label: 'Reports', path: '/reports', icon: 'FileBarChart' },
  ],
  teacher: [
    { label: 'Dashboard', path: '/teacher', icon: 'LayoutDashboard' },
    { label: 'My Classes', path: '/teacher/grades', icon: 'BookOpen' },
    { label: 'Attendance', path: '/teacher/attendance', icon: 'CalendarCheck' },
    { label: 'Timetable', path: '/teacher/timetable', icon: 'Clock' },
    { label: 'Assignments', path: '/teacher/assignments', icon: 'PenTool' },
    { label: 'Messages', path: '/teacher/messages', icon: 'MessageSquare' },
    { label: 'My Payslip', path: '/teacher/payslip', icon: 'Banknote' },
  ],
  parent: [
    { label: 'Dashboard', path: '/parent', icon: 'LayoutDashboard' },
    { label: 'Performance', path: '/parent/performance', icon: 'TrendingUp' },
    { label: 'Attendance', path: '/parent/attendance', icon: 'CalendarCheck' },
    { label: 'Fee Payment', path: '/parent/fees', icon: 'Wallet' },
    { label: 'Messages', path: '/parent/messages', icon: 'MessageSquare' },
    { label: 'Announcements', path: '/parent/announcements', icon: 'Megaphone' },
  ],
  student: [
    { label: 'Dashboard', path: '/student', icon: 'LayoutDashboard' },
    { label: 'My Results', path: '/student/results', icon: 'Award' },
    { label: 'Assignments', path: '/student/assignments', icon: 'PenTool' },
    { label: 'Timetable', path: '/student/timetable', icon: 'Clock' },
    { label: 'Attendance', path: '/student/attendance', icon: 'CalendarCheck' },
    { label: 'Announcements', path: '/student/announcements', icon: 'Megaphone' },
  ],
};

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Administrator',
  admin: 'Administrator',
  teacher: 'Teacher',
  parent: 'Parent',
  student: 'Student',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: 'var(--color-primary-600)',
  admin: 'var(--color-primary-500)',
  teacher: 'var(--color-accent-500)',
  parent: 'var(--color-info-500)',
  student: 'var(--color-warning-500)',
};
