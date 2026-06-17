import { useState, useCallback, useMemo } from 'react';
import { LocalStorageAdapter } from '../../../../services/adapters/localStorageAdapter';
import { Student, AttendanceRecord } from '../../../../types/student';
import { Invoice, Payment, PaymentMethod } from '../../../../types/finance';
import { ExamResult, Assessment, GHANA_GRADING_SCALE } from '../../../../types/academic';

export function useParent(parentEmail: string) {
  const studentAdapter = useMemo(() => new LocalStorageAdapter<Student>('advance_students'), []);
  const attendanceAdapter = useMemo(() => new LocalStorageAdapter<AttendanceRecord>('advance_student_attendance'), []);
  const invoiceAdapter = useMemo(() => new LocalStorageAdapter<Invoice>('advance_invoices'), []);
  const resultAdapter = useMemo(() => new LocalStorageAdapter<ExamResult>('advance_exam_results'), []);
  const assessmentAdapter = useMemo(() => new LocalStorageAdapter<Assessment>('advance_assessments'), []);
  const paymentAdapter = useMemo(() => new LocalStorageAdapter<Payment>('advance_payments'), []);

  // Fetch children whose guardian email matches parent email
  const children = useMemo(() => {
    return studentAdapter.getAll().filter(
      (s) => s.guardian && s.guardian.email && s.guardian.email.toLowerCase() === parentEmail.toLowerCase()
    );
  }, [studentAdapter, parentEmail]);

  // Seed default student attendance if empty
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const all = attendanceAdapter.getAll();
    if (all.length === 0 && children.length > 0) {
      const seed: AttendanceRecord[] = [];
      children.forEach((child) => {
        // Seed 10 days of attendance
        for (let i = 0; i < 10; i++) {
          const dateStr = new Date(new Date().setDate(new Date().getDate() - i)).toISOString().split('T')[0];
          seed.push({
            id: `att_${child.id}_${i}`,
            studentId: child.id,
            date: dateStr,
            status: i === 3 ? 'late' : i === 7 ? 'absent' : 'present',
            notes: i === 3 ? 'Traffic delay' : i === 7 ? 'Sick leave' : 'On time'
          });
        }
      });
      seed.forEach(x => attendanceAdapter.create(x));
      return attendanceAdapter.getAll();
    }
    return all;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => invoiceAdapter.getAll());

  const refreshInvoices = useCallback(() => {
    setInvoices(invoiceAdapter.getAll());
  }, [invoiceAdapter]);

  const refreshAttendance = useCallback(() => {
    setAttendance(attendanceAdapter.getAll());
  }, [attendanceAdapter]);

  const getAttendanceForChild = useCallback((childId: string) => {
    return attendance.filter((a) => a.studentId === childId);
  }, [attendance]);

  const getInvoicesForChild = useCallback((childId: string) => {
    return invoices.filter((i) => i.studentId === childId);
  }, [invoices]);

  const getResultsForChild = useCallback((childId: string) => {
    const allResults = resultAdapter.getAll();
    const allAssessments = assessmentAdapter.getAll();

    return allResults
      .filter((r) => r.studentId === childId)
      .map((r) => {
        const assess = allAssessments.find((a) => a.id === r.assessmentId);
        const scale = GHANA_GRADING_SCALE.find((s) => r.score >= s.minScore && r.score <= s.maxScore);
        return {
          ...r,
          assessmentName: assess ? assess.title : 'Unknown Assessment',
          subject: assess ? assess.subject : 'General',
          type: assess ? assess.type : 'class_test',
          grade: scale ? scale.grade : '9',
          remark: r.comments || (scale ? scale.remark : 'Fail')
        };
      });
  }, [resultAdapter, assessmentAdapter]);

  const payInvoice = useCallback((invoiceId: string, method: PaymentMethod, reference: string) => {
    const inv = invoiceAdapter.getById(invoiceId);
    if (!inv) return false;

    const stud = studentAdapter.getById(inv.studentId);

    // Create payment entry
    const newPayment: Payment = {
      id: `pay_${Math.random().toString(36).substring(7)}`,
      studentId: inv.studentId,
      studentName: stud ? `${stud.firstName} ${stud.lastName}` : 'Student',
      classLevel: stud ? stud.classLevel : 'JHS 1',
      term: 'Term 2',
      academicYear: '2025/2026',
      totalAmount: inv.total,
      amountPaid: inv.total,
      balance: 0,
      method,
      reference,
      date: new Date().toISOString(),
      receivedBy: 'stf_005',
      receiptNumber: `RCP-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'paid'
    };
    paymentAdapter.create(newPayment);

    // Update invoice status
    invoiceAdapter.update(invoiceId, {
      status: 'paid'
    });

    refreshInvoices();
    return true;
  }, [invoiceAdapter, paymentAdapter, studentAdapter, refreshInvoices]);

  return {
    children,
    getAttendanceForChild,
    getInvoicesForChild,
    getResultsForChild,
    payInvoice,
    refreshAttendance,
    refreshInvoices
  };
}
