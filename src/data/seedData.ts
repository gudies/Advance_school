import { User, Student, Staff, FeeStructure, Payment, StaffAttendance } from '../types';
import { LocalStorageAdapter } from '../services/adapters/localStorageAdapter';

export const seedUsers: User[] = [
  {
    id: 'usr_super',
    firstName: 'Kwame',
    lastName: 'Asante',
    email: 'super_admin@camiedbehills.edu.gh',
    role: 'super_admin',
    status: 'active',
    createdAt: new Date().toISOString(),
    permissions: ['manage_users', 'manage_students', 'manage_staff', 'manage_fees', 'manage_academics', 'view_reports']
  },
  {
    id: 'usr_teacher1',
    firstName: 'Ama',
    lastName: 'Mensah',
    email: 'teacher@camiedbehills.edu.gh',
    role: 'teacher',
    status: 'active',
    createdAt: new Date().toISOString(),
    permissions: ['view_own_student', 'enter_grades']
  },
  {
    id: 'usr_parent1',
    firstName: 'Kofi',
    lastName: 'Adjei',
    email: 'parent@camiedbehills.edu.gh',
    role: 'parent',
    status: 'active',
    createdAt: new Date().toISOString(),
    permissions: ['view_own_child', 'pay_fees']
  },
  {
    id: 'usr_student1',
    firstName: 'Akua',
    lastName: 'Adjei',
    email: 'student@camiedbehills.edu.gh',
    role: 'student',
    status: 'active',
    createdAt: new Date().toISOString(),
    permissions: ['view_own_student']
  }
];

export const seedStudents: Student[] = [
  {
    id: 'stu_001', studentId: 'ADV-2025-001', firstName: 'Akua', lastName: 'Adjei',
    dateOfBirth: '2012-05-14T00:00:00.000Z', gender: 'Female', classLevel: 'JHS 1',
    admissionDate: '2024-09-01T00:00:00.000Z', status: 'active',
    guardian: { name: 'Kofi Adjei', relationship: 'Father', phone: '024-123-4567', email: 'parent@camiedbehills.edu.gh', address: 'East Legon, Accra' },
    address: 'East Legon, Accra'
  },
  {
    id: 'stu_002', studentId: 'ADV-2025-002', firstName: 'Kwabena', lastName: 'Osei',
    dateOfBirth: '2011-08-22T00:00:00.000Z', gender: 'Male', classLevel: 'JHS 2',
    admissionDate: '2023-09-01T00:00:00.000Z', status: 'active',
    guardian: { name: 'Yaa Osei', relationship: 'Mother', phone: '020-987-6543', address: 'Madina, Accra' },
    address: 'Madina, Accra'
  },
  {
    id: 'stu_003', studentId: 'ADV-2025-003', firstName: 'Abena', lastName: 'Mensah',
    dateOfBirth: '2013-03-10T00:00:00.000Z', gender: 'Female', classLevel: 'Primary 6',
    admissionDate: '2024-09-01T00:00:00.000Z', status: 'active',
    guardian: { name: 'Kwame Mensah', relationship: 'Father', phone: '027-555-1111', address: 'Tema, Accra' },
    address: 'Tema, Accra'
  },
  {
    id: 'stu_004', studentId: 'ADV-2025-004', firstName: 'Yaw', lastName: 'Boateng',
    dateOfBirth: '2010-11-05T00:00:00.000Z', gender: 'Male', classLevel: 'JHS 3',
    admissionDate: '2022-09-01T00:00:00.000Z', status: 'active',
    guardian: { name: 'Esi Boateng', relationship: 'Mother', phone: '024-333-7777', address: 'Dansoman, Accra' },
    address: 'Dansoman, Accra'
  },
  {
    id: 'stu_005', studentId: 'ADV-2025-005', firstName: 'Esi', lastName: 'Owusu',
    dateOfBirth: '2014-07-19T00:00:00.000Z', gender: 'Female', classLevel: 'Primary 4',
    admissionDate: '2024-09-01T00:00:00.000Z', status: 'active',
    guardian: { name: 'Nana Owusu', relationship: 'Father', phone: '020-999-2222', address: 'Osu, Accra' },
    address: 'Osu, Accra'
  },
  {
    id: 'stu_006', studentId: 'ADV-2025-006', firstName: 'Kofi', lastName: 'Asante',
    dateOfBirth: '2015-01-28T00:00:00.000Z', gender: 'Male', classLevel: 'Primary 3',
    admissionDate: '2024-09-01T00:00:00.000Z', status: 'active',
    guardian: { name: 'Akua Asante', relationship: 'Mother', phone: '027-444-5555', address: 'Lapaz, Accra' },
    address: 'Lapaz, Accra'
  },
  {
    id: 'stu_007', studentId: 'ADV-2025-007', firstName: 'Ama', lastName: 'Darko',
    dateOfBirth: '2016-09-12T00:00:00.000Z', gender: 'Female', classLevel: 'KG 2',
    admissionDate: '2025-01-06T00:00:00.000Z', status: 'active',
    guardian: { name: 'Michael Darko', relationship: 'Father', phone: '024-777-8888', address: 'Cantonments, Accra' },
    address: 'Cantonments, Accra'
  },
  {
    id: 'stu_008', studentId: 'ADV-2025-008', firstName: 'Kweku', lastName: 'Annan',
    dateOfBirth: '2009-04-03T00:00:00.000Z', gender: 'Male', classLevel: 'SS 1',
    admissionDate: '2024-09-01T00:00:00.000Z', status: 'active',
    guardian: { name: 'Grace Annan', relationship: 'Mother', phone: '020-666-3333', address: 'Achimota, Accra' },
    address: 'Achimota, Accra'
  },
  {
    id: 'stu_009', studentId: 'ADV-2025-009', firstName: 'Efua', lastName: 'Tetteh',
    dateOfBirth: '2017-12-25T00:00:00.000Z', gender: 'Female', classLevel: 'Nursery 2',
    admissionDate: '2025-01-06T00:00:00.000Z', status: 'active',
    guardian: { name: 'Samuel Tetteh', relationship: 'Father', phone: '027-111-4444', address: 'Spintex, Accra' },
    address: 'Spintex, Accra'
  },
  {
    id: 'stu_010', studentId: 'ADV-2025-010', firstName: 'Yaa', lastName: 'Frimpong',
    dateOfBirth: '2012-06-18T00:00:00.000Z', gender: 'Female', classLevel: 'JHS 1',
    admissionDate: '2024-09-01T00:00:00.000Z', status: 'active',
    guardian: { name: 'Joseph Frimpong', relationship: 'Father', phone: '024-222-9999', address: 'Airport Residential, Accra' },
    address: 'Airport Residential, Accra'
  },
  {
    id: 'stu_011', studentId: 'ADV-2025-011', firstName: 'Kwasi', lastName: 'Mensah',
    dateOfBirth: '2013-02-14T00:00:00.000Z', gender: 'Male', classLevel: 'Primary 5',
    admissionDate: '2023-09-01T00:00:00.000Z', status: 'active',
    guardian: { name: 'Rita Mensah', relationship: 'Mother', phone: '020-888-1111', address: 'Adabraka, Accra' },
    address: 'Adabraka, Accra'
  },
  {
    id: 'stu_012', studentId: 'ADV-2025-012', firstName: 'Adwoa', lastName: 'Kyei',
    dateOfBirth: '2008-10-30T00:00:00.000Z', gender: 'Female', classLevel: 'SS 2',
    admissionDate: '2023-09-01T00:00:00.000Z', status: 'active',
    guardian: { name: 'Emmanuel Kyei', relationship: 'Father', phone: '027-333-6666', address: 'Dzorwulu, Accra' },
    address: 'Dzorwulu, Accra'
  },
];

export const seedStaff: Staff[] = [
  {
    id: 'stf_001', staffId: 'STF-001', firstName: 'Ama', lastName: 'Mensah',
    email: 'teacher@camiedbehills.edu.gh', phone: '024-555-1234', role: 'teacher',
    departmentId: 'dept_001', qualification: 'B.Ed Mathematics',
    dateOfEmployment: '2020-01-15T00:00:00.000Z', salary: 4500, status: 'active'
  },
  {
    id: 'stf_002', staffId: 'STF-002', firstName: 'Kwasi', lastName: 'Appiah',
    email: 'k.appiah@camiedbehills.edu.gh', phone: '027-444-5678', role: 'head_teacher',
    departmentId: 'dept_002', qualification: 'M.Ed Administration',
    dateOfEmployment: '2018-09-01T00:00:00.000Z', salary: 6000, status: 'active'
  },
  {
    id: 'stf_003', staffId: 'STF-003', firstName: 'Abena', lastName: 'Sarpong',
    email: 'a.sarpong@camiedbehills.edu.gh', phone: '020-321-7654', role: 'teacher',
    departmentId: 'dept_001', qualification: 'B.Sc English Language',
    dateOfEmployment: '2021-03-10T00:00:00.000Z', salary: 4200, status: 'active'
  },
  {
    id: 'stf_004', staffId: 'STF-004', firstName: 'Kwadwo', lastName: 'Boakye',
    email: 'k.boakye@camiedbehills.edu.gh', phone: '024-111-2222', role: 'teacher',
    departmentId: 'dept_003', qualification: 'B.Sc Integrated Science',
    dateOfEmployment: '2019-09-01T00:00:00.000Z', salary: 4500, status: 'active'
  },
  {
    id: 'stf_005', staffId: 'STF-005', firstName: 'Efua', lastName: 'Amoah',
    email: 'e.amoah@camiedbehills.edu.gh', phone: '027-555-3333', role: 'accountant',
    departmentId: 'dept_004', qualification: 'B.Com Accounting',
    dateOfEmployment: '2020-06-01T00:00:00.000Z', salary: 5000, status: 'active'
  },
  {
    id: 'stf_006', staffId: 'STF-006', firstName: 'Yaw', lastName: 'Donkor',
    email: 'y.donkor@camiedbehills.edu.gh', phone: '020-444-5555', role: 'secretary',
    departmentId: 'dept_004', qualification: 'HND Secretarial Studies',
    dateOfEmployment: '2022-01-10T00:00:00.000Z', salary: 3500, status: 'active'
  },
  {
    id: 'stf_007', staffId: 'STF-007', firstName: 'Akosua', lastName: 'Nyarko',
    email: 'a.nyarko@camiedbehills.edu.gh', phone: '024-666-7777', role: 'librarian',
    departmentId: 'dept_005', qualification: 'Diploma Library Science',
    dateOfEmployment: '2021-09-01T00:00:00.000Z', salary: 3800, status: 'active'
  },
  {
    id: 'stf_008', staffId: 'STF-008', firstName: 'Kojo', lastName: 'Antwi',
    email: 'k.antwi@camiedbehills.edu.gh', phone: '027-888-9999', role: 'security',
    departmentId: 'dept_006', qualification: 'BECE',
    dateOfEmployment: '2019-01-05T00:00:00.000Z', salary: 2500, status: 'active'
  },
  {
    id: 'stf_009', staffId: 'STF-009', firstName: 'Adwoa', lastName: 'Manu',
    email: 'a.manu@camiedbehills.edu.gh', phone: '020-999-1111', role: 'cleaner',
    departmentId: 'dept_006', qualification: 'BECE',
    dateOfEmployment: '2020-03-15T00:00:00.000Z', salary: 2200, status: 'active'
  },
  {
    id: 'stf_010', staffId: 'STF-010', firstName: 'Kweku', lastName: 'Ofori',
    email: 'k.ofori@camiedbehills.edu.gh', phone: '024-777-8888', role: 'teacher',
    departmentId: 'dept_001', qualification: 'B.Ed Social Studies',
    dateOfEmployment: '2022-09-01T00:00:00.000Z', salary: 4000, status: 'active'
  },
];

export const seedFeeStructures: FeeStructure[] = [
  {
    id: 'fs_jhs1_term1', classLevel: 'JHS 1', term: 'Term 1', academicYear: '2025/2026', totalAmount: 1250,
    items: [
      { id: 'fi_1', category: 'tuition', description: 'Tuition Fee', amount: 800, mandatory: true },
      { id: 'fi_2', category: 'ict', description: 'ICT Levy', amount: 150, mandatory: true },
      { id: 'fi_3', category: 'feeding', description: 'Feeding Fee', amount: 300, mandatory: false }
    ]
  },
  {
    id: 'fs_jhs2_term1', classLevel: 'JHS 2', term: 'Term 1', academicYear: '2025/2026', totalAmount: 1300,
    items: [
      { id: 'fi_4', category: 'tuition', description: 'Tuition Fee', amount: 850, mandatory: true },
      { id: 'fi_5', category: 'ict', description: 'ICT Levy', amount: 150, mandatory: true },
      { id: 'fi_6', category: 'feeding', description: 'Feeding Fee', amount: 300, mandatory: false }
    ]
  },
  {
    id: 'fs_p6_term1', classLevel: 'Primary 6', term: 'Term 1', academicYear: '2025/2026', totalAmount: 950,
    items: [
      { id: 'fi_7', category: 'tuition', description: 'Tuition Fee', amount: 600, mandatory: true },
      { id: 'fi_8', category: 'ict', description: 'ICT Levy', amount: 100, mandatory: true },
      { id: 'fi_9', category: 'feeding', description: 'Feeding Fee', amount: 250, mandatory: false }
    ]
  },
  {
    id: 'fs_kg2_term1', classLevel: 'KG 2', term: 'Term 1', academicYear: '2025/2026', totalAmount: 800,
    items: [
      { id: 'fi_10', category: 'tuition', description: 'Tuition Fee', amount: 500, mandatory: true },
      { id: 'fi_11', category: 'feeding', description: 'Feeding Fee', amount: 300, mandatory: true }
    ]
  },
  {
    id: 'fs_ss1_term1', classLevel: 'SS 1', term: 'Term 1', academicYear: '2025/2026', totalAmount: 1800,
    items: [
      { id: 'fi_12', category: 'tuition', description: 'Tuition Fee', amount: 1200, mandatory: true },
      { id: 'fi_13', category: 'ict', description: 'ICT Levy', amount: 200, mandatory: true },
      { id: 'fi_14', category: 'exam', description: 'Examination Fee', amount: 150, mandatory: true },
      { id: 'fi_15', category: 'feeding', description: 'Feeding Fee', amount: 250, mandatory: false }
    ]
  },
];

export const seedPayments: Payment[] = [
  {
    id: 'pay_001', studentId: 'stu_001', studentName: 'Akua Adjei', classLevel: 'JHS 1',
    term: 'Term 1', academicYear: '2025/2026', totalAmount: 1250, amountPaid: 1250, balance: 0,
    method: 'mobile_money', reference: 'MOMO123456789',
    date: '2025-09-15T10:30:00.000Z', receivedBy: 'stf_005', receiptNumber: 'RCP-2025-0001', status: 'paid'
  },
  {
    id: 'pay_002', studentId: 'stu_002', studentName: 'Kwabena Osei', classLevel: 'JHS 2',
    term: 'Term 1', academicYear: '2025/2026', totalAmount: 1300, amountPaid: 800, balance: 500,
    method: 'cash',
    date: '2025-09-20T14:00:00.000Z', receivedBy: 'stf_005', receiptNumber: 'RCP-2025-0002', status: 'partial'
  },
  {
    id: 'pay_003', studentId: 'stu_003', studentName: 'Abena Mensah', classLevel: 'Primary 6',
    term: 'Term 1', academicYear: '2025/2026', totalAmount: 950, amountPaid: 950, balance: 0,
    method: 'bank_transfer', reference: 'TRF-GCB-78901',
    date: '2025-09-10T09:15:00.000Z', receivedBy: 'stf_005', receiptNumber: 'RCP-2025-0003', status: 'paid'
  },
  {
    id: 'pay_004', studentId: 'stu_005', studentName: 'Esi Owusu', classLevel: 'Primary 4',
    term: 'Term 1', academicYear: '2025/2026', totalAmount: 850, amountPaid: 400, balance: 450,
    method: 'mobile_money', reference: 'MOMO987654321',
    date: '2025-10-05T11:00:00.000Z', receivedBy: 'stf_005', receiptNumber: 'RCP-2025-0004', status: 'partial'
  },
  {
    id: 'pay_005', studentId: 'stu_008', studentName: 'Kweku Annan', classLevel: 'SS 1',
    term: 'Term 1', academicYear: '2025/2026', totalAmount: 1800, amountPaid: 1800, balance: 0,
    method: 'bank_transfer', reference: 'TRF-ECO-12345',
    date: '2025-09-05T08:30:00.000Z', receivedBy: 'stf_005', receiptNumber: 'RCP-2025-0005', status: 'paid'
  },
  {
    id: 'pay_006', studentId: 'stu_010', studentName: 'Yaa Frimpong', classLevel: 'JHS 1',
    term: 'Term 1', academicYear: '2025/2026', totalAmount: 1250, amountPaid: 600, balance: 650,
    method: 'cash',
    date: '2025-09-25T15:45:00.000Z', receivedBy: 'stf_006', receiptNumber: 'RCP-2025-0006', status: 'partial'
  },
  {
    id: 'pay_007', studentId: 'stu_007', studentName: 'Ama Darko', classLevel: 'KG 2',
    term: 'Term 1', academicYear: '2025/2026', totalAmount: 800, amountPaid: 800, balance: 0,
    method: 'mobile_money', reference: 'MOMO555666777',
    date: '2025-09-12T10:00:00.000Z', receivedBy: 'stf_005', receiptNumber: 'RCP-2025-0007', status: 'paid'
  },
];

const generateStaffAttendance = (): StaffAttendance[] => {
  const records: StaffAttendance[] = [];
  const statuses: Array<'present' | 'absent' | 'late' | 'excused'> = ['present', 'present', 'present', 'present', 'present', 'late', 'absent', 'excused'];
  
  for (let d = 1; d <= 20; d++) {
    const dayStr = String(d).padStart(2, '0');
    const date = `2025-10-${dayStr}T00:00:00.000Z`;
    const dayOfWeek = new Date(date).getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

    seedStaff.forEach((staff) => {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      records.push({
        id: `sa_${staff.id}_${dayStr}`,
        staffId: staff.id,
        date,
        status,
        checkInTime: status === 'present' ? '07:30' : status === 'late' ? '08:15' : undefined,
        checkOutTime: status !== 'absent' ? '16:00' : undefined,
      });
    });
  }
  return records;
};

export function initializeSeedData() {
  const usersAdapter = new LocalStorageAdapter<User>('advance_users');
  const studentsAdapter = new LocalStorageAdapter<Student>('advance_students');
  const staffAdapter = new LocalStorageAdapter<Staff>('advance_staff');
  const feesAdapter = new LocalStorageAdapter<FeeStructure>('advance_fee_structures');
  const paymentsAdapter = new LocalStorageAdapter<Payment>('advance_payments');
  const staffAttendanceAdapter = new LocalStorageAdapter<StaffAttendance>('advance_staff_attendance');

  // Check if we need to migrate/re-seed due to branding change
  const existingUsers = usersAdapter.getAll();
  const needsReSeed = existingUsers.length > 0 && !existingUsers.some(u => u.email.endsWith('@camiedbehills.edu.gh'));

  if (needsReSeed) {
    console.log('Detected old branding domain in seed data. Resetting localStorage...');
    localStorage.removeItem('advance_users');
    localStorage.removeItem('advance_students');
    localStorage.removeItem('advance_staff');
    localStorage.removeItem('advance_fee_structures');
    localStorage.removeItem('advance_payments');
    localStorage.removeItem('advance_staff_attendance');
    localStorage.removeItem('advance-auth');
    
    // Refresh adapters
    window.location.reload();
    return;
  }

  if (usersAdapter.count() === 0) {
    usersAdapter.seed(seedUsers);
    console.log('Seeded Users');
  }
  if (studentsAdapter.count() === 0) {
    studentsAdapter.seed(seedStudents);
    console.log('Seeded Students');
  }
  if (staffAdapter.count() === 0) {
    staffAdapter.seed(seedStaff);
    console.log('Seeded Staff');
  }
  if (feesAdapter.count() === 0) {
    feesAdapter.seed(seedFeeStructures);
    console.log('Seeded Fee Structures');
  }
  if (paymentsAdapter.count() === 0) {
    paymentsAdapter.seed(seedPayments);
    console.log('Seeded Payments');
  }
  if (staffAttendanceAdapter.count() === 0) {
    staffAttendanceAdapter.seed(generateStaffAttendance());
    console.log('Seeded Staff Attendance');
  }
}
