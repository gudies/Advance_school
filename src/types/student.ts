import { ID, DateString, Status, ClassLevel } from './common';

export type Gender = 'Male' | 'Female';

export type AdmissionStatus = 'applied' | 'under_review' | 'accepted' | 'enrolled' | 'rejected';

export interface Guardian {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  occupation?: string;
  address: string;
}

export interface StudentDocument {
  id: ID;
  title: string;
  url: string;
  type: string;
  uploadedAt: DateString;
}

export interface Student {
  id: ID;
  studentId: string; // e.g., ADV-2025-001
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: DateString;
  gender: Gender;
  classLevel: ClassLevel;
  section?: string;
  admissionDate: DateString;
  status: Status | AdmissionStatus;
  guardian: Guardian;
  address: string;
  previousSchool?: string;
  healthInfo?: string;
  photoUrl?: string;
  documents?: StudentDocument[];
}

export interface EnrollmentForm extends Omit<Student, 'id' | 'studentId' | 'status' | 'admissionDate'> {
  appliedDate: DateString;
}

export interface AttendanceRecord {
  id: ID;
  studentId: ID;
  date: DateString;
  status: 'present' | 'absent' | 'late' | 'excused';
  checkInTime?: string;
  notes?: string;
}
