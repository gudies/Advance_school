import { ID, DateString, Status, Currency } from './common';

export type StaffRole = 
  | 'teacher' 
  | 'head_teacher' 
  | 'accountant' 
  | 'secretary' 
  | 'librarian' 
  | 'security' 
  | 'cleaner' 
  | 'driver' 
  | 'cook' 
  | 'admin_staff';

export interface Department {
  id: ID;
  name: string;
  headId?: ID;
  description?: string;
}

export type LeaveType = 'annual' | 'sick' | 'maternity' | 'paternity' | 'unpaid' | 'other';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: ID;
  staffId: ID;
  type: LeaveType;
  startDate: DateString;
  endDate: DateString;
  reason: string;
  status: LeaveStatus;
  appliedOn: DateString;
  reviewedBy?: ID;
  reviewedOn?: DateString;
  comments?: string;
}

export interface Staff {
  id: ID;
  staffId: string; // STF-001
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: StaffRole;
  departmentId: ID;
  qualification: string;
  dateOfEmployment: DateString;
  salary: Currency;
  bankAccount?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
  };
  status: Status;
  photoUrl?: string;
}

export interface Teacher extends Staff {
  role: 'teacher' | 'head_teacher';
  assignedClasses: string[];
  subjects: string[];
}

export interface StaffAttendance {
  id: ID;
  staffId: ID;
  date: DateString;
  status: 'present' | 'absent' | 'late' | 'excused';
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
}

export interface PayslipInfo {
  id: ID;
  staffId: ID;
  month: string; // YYYY-MM
  basicSalary: Currency;
  allowances: { name: string; amount: Currency }[];
  deductions: { name: string; amount: Currency }[];
  netSalary: Currency;
  status: 'paid' | 'pending';
  paymentDate?: DateString;
}
