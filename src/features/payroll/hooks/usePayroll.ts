import { useState, useCallback, useMemo } from 'react';
import { LocalStorageAdapter } from '../../../services/adapters/localStorageAdapter';
import { PayslipInfo, Staff } from '../../../types/staff';
import { Expense } from '../../../types/finance';

export function usePayroll() {
  const payslipAdapter = useMemo(() => new LocalStorageAdapter<PayslipInfo>('advance_payslips'), []);
  const staffAdapter = useMemo(() => new LocalStorageAdapter<Staff>('advance_staff'), []);
  const expenseAdapter = useMemo(() => new LocalStorageAdapter<Expense>('advance_expenses'), []);

  const [payslips, setPayslips] = useState<PayslipInfo[]>(() => payslipAdapter.getAll());

  const refreshPayslips = useCallback(() => {
    setPayslips(payslipAdapter.getAll());
  }, [payslipAdapter]);

  const runMonthlyPayroll = useCallback((month: string, actorId: string) => {
    const staffList = staffAdapter.getAll().filter((s) => s.status === 'active');
    let generatedCount = 0;

    staffList.forEach((staff) => {
      // Check if payslip already exists for this employee and month
      const exists = payslipAdapter.getAll().some(
        (p) => p.staffId === staff.id && p.month === month
      );

      if (!exists) {
        const basicSalary = staff.salary || 1000; // fallback basic
        
        // 10% Transport/Housing allowance
        const allowanceAmount = Math.round(basicSalary * 0.1);
        const allowances = [{ name: 'Transport & Utility Allowance', amount: allowanceAmount }];
        
        // Ghanaian standard deductions
        const ssnitAmount = Math.round(basicSalary * 0.055); // 5.5% employee SSNIT
        const taxAmount = Math.round(basicSalary * 0.1); // 10% simple income tax
        const deductions = [
          { name: 'SSNIT (5.5%)', amount: ssnitAmount },
          { name: 'Income Tax (10%)', amount: taxAmount }
        ];

        const netSalary = basicSalary + allowanceAmount - ssnitAmount - taxAmount;

        const payslip: PayslipInfo = {
          id: `pay_${Math.random().toString(36).substring(7)}`,
          staffId: staff.id,
          month,
          basicSalary,
          allowances,
          deductions,
          netSalary,
          status: 'paid',
          paymentDate: new Date().toISOString().split('T')[0]
        };

        payslipAdapter.create(payslip);

        // Record approved expense under salary category
        const expense: Expense = {
          id: `exp_${Math.random().toString(36).substring(7)}`,
          category: 'salary',
          description: `Monthly salary payout for ${staff.firstName} ${staff.lastName} (${month})`,
          amount: netSalary,
          date: new Date().toISOString().split('T')[0],
          recordedBy: actorId,
          status: 'approved'
        };
        expenseAdapter.create(expense);

        generatedCount++;
      }
    });

    if (generatedCount > 0) refreshPayslips();
    return generatedCount;
  }, [staffAdapter, payslipAdapter, expenseAdapter, refreshPayslips]);

  const getPayrollSummary = useCallback((month: string) => {
    const monthPayslips = payslips.filter((p) => p.month === month);
    const totalNet = monthPayslips.reduce((acc, p) => acc + p.netSalary, 0);
    const totalBasic = monthPayslips.reduce((acc, p) => acc + p.basicSalary, 0);
    const totalDeductions = monthPayslips.reduce(
      (acc, p) => acc + p.deductions.reduce((sum, d) => sum + d.amount, 0),
      0
    );

    return {
      count: monthPayslips.length,
      totalNet,
      totalBasic,
      totalDeductions
    };
  }, [payslips]);

  return {
    payslips,
    runMonthlyPayroll,
    getPayrollSummary,
    refreshPayslips
  };
}
