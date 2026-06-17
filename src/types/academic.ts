import { ID, DateString, ClassLevel, Term } from './common';

export type Subject = 
  | 'English Language'
  | 'Mathematics'
  | 'Integrated Science'
  | 'Social Studies'
  | 'ICT'
  | 'French'
  | 'Ghanaian Language'
  | 'RME'
  | 'Creative Arts'
  | 'Career Technology'
  | 'Physical Education';

export type GradeValue = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

export interface GradeScale {
  minScore: number;
  maxScore: number;
  grade: GradeValue;
  remark: string; // Excellent, Very Good, Good, Credit, Pass, Weak, Very Weak
}

export const GHANA_GRADING_SCALE: GradeScale[] = [
  { minScore: 80, maxScore: 100, grade: '1', remark: 'Excellent' },
  { minScore: 70, maxScore: 79, grade: '2', remark: 'Very Good' },
  { minScore: 60, maxScore: 69, grade: '3', remark: 'Good' },
  { minScore: 50, maxScore: 59, grade: '4', remark: 'Credit' },
  { minScore: 40, maxScore: 49, grade: '5', remark: 'Pass' },
  { minScore: 30, maxScore: 39, grade: '6', remark: 'Weak' },
  { minScore: 0, maxScore: 29, grade: '7', remark: 'Very Weak' },
];

export type ExamType = 'class_test' | 'mid_term' | 'end_of_term' | 'mock';

export interface Assessment {
  id: ID;
  title: string;
  classLevel: ClassLevel;
  subject: Subject;
  type: ExamType;
  maxScore: number;
  date: DateString;
  teacherId: ID;
}

export interface ExamResult {
  id: ID;
  assessmentId: ID;
  studentId: ID;
  score: number;
  comments?: string;
}

export interface SubjectResult {
  subject: Subject;
  classWorkScore: number; // usually 30%
  examScore: number; // usually 70%
  totalScore: number;
  grade: GradeValue;
  remark: string;
  positionInSubject: number;
}

export interface ReportCard {
  id: ID;
  studentId: ID;
  studentName: string;
  classLevel: ClassLevel;
  term: Term;
  academicYear: string;
  results: SubjectResult[];
  totalScore: number;
  averageScore: number;
  overallPosition: number;
  classSize: number;
  attendanceSummary: {
    totalDays: number;
    daysPresent: number;
    daysAbsent: number;
  };
  teacherComment: string;
  headTeacherComment: string;
  nextTermBegins: DateString;
  dateIssued: DateString;
}

export interface TimetablePeriod {
  id: ID;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  startTime: string; // HH:MM
  endTime: string;
  subject: Subject | 'Break' | 'Assembly';
  teacherId?: ID;
}

export interface Timetable {
  id: ID;
  classLevel: ClassLevel;
  term: Term;
  academicYear: string;
  periods: TimetablePeriod[];
}

export interface Assignment {
  id: ID;
  title: string;
  description: string;
  classLevel: ClassLevel;
  subject: Subject;
  teacherId: ID;
  dueDate: DateString;
  maxScore: number;
}
