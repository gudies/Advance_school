import { ID, DateString, Currency, ClassLevel, Term } from './common';

export type FeeCategory = 
  | 'tuition' 
  | 'books' 
  | 'uniform' 
  | 'feeding' 
  | 'transport' 
  | 'ict' 
  | 'sports' 
  | 'exam' 
  | 'development_levy' 
  | 'pta';

export type PaymentMethod = 'cash' | 'mobile_money' | 'bank_transfer' | 'cheque';
export type PaymentStatus = 'paid' | 'partial' | 'pending' | 'overdue';

export interface FeeItem {
  id: ID;
  category: FeeCategory;
  description: string;
  amount: Currency;
  mandatory: boolean;
}

export interface FeeStructure {
  id: ID;
  classLevel: ClassLevel;
  term: Term;
  academicYear: string;
  items: FeeItem[];
  totalAmount: Currency;
}

export interface Payment {
  id: ID;
  studentId: ID;
  studentName: string;
  classLevel: ClassLevel;
  term: Term;
  academicYear: string;
  totalAmount: Currency;
  amountPaid: Currency;
  balance: Currency;
  method: PaymentMethod;
  reference?: string; // Momo ref or check number
  date: DateString;
  receivedBy: ID; // Staff ID
  receiptNumber: string;
  status: PaymentStatus;
  remarks?: string;
}

export interface Invoice {
  id: ID;
  studentId: ID;
  date: DateString;
  dueDate: DateString;
  items: { description: string; amount: Currency }[];
  total: Currency;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  term?: Term;
}

export type ExpenseCategory = 
  | 'salary' 
  | 'utilities' 
  | 'maintenance' 
  | 'supplies' 
  | 'equipment' 
  | 'events' 
  | 'transportation' 
  | 'other';

export interface Expense {
  id: ID;
  category: ExpenseCategory;
  description: string;
  amount: Currency;
  date: DateString;
  recordedBy: ID;
  approvedBy?: ID;
  status: 'pending' | 'approved' | 'rejected';
  receiptUrl?: string;
}

export interface IncomeRecord {
  id: ID;
  source: string; // 'fee', 'donation', 'grant', etc.
  description: string;
  amount: Currency;
  date: DateString;
  recordedBy: ID;
}

export interface Budget {
  id: ID;
  year: string;
  term?: Term;
  allocations: { category: ExpenseCategory; amount: Currency }[];
  totalBudget: Currency;
}

export interface FinancialSummary {
  period: string; // MM-YYYY or Term
  totalIncome: Currency;
  totalExpense: Currency;
  profitOrLoss: Currency;
  feeCollectionRate: number; // percentage
}
