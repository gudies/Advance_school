import { useState, useCallback, useMemo } from 'react';
import { LocalStorageAdapter } from '../../../services/adapters/localStorageAdapter';
import { Invoice, IncomeRecord, Budget, Payment, Expense, FinancialSummary, FeeStructure, FeeItem } from '../../../types/finance';
import { Student } from '../../../types/student';
import { Term } from '../../../types/common';

export function useFinance() {
  const invoiceAdapter = useMemo(() => new LocalStorageAdapter<Invoice>('advance_invoices'), []);
  const incomeAdapter = useMemo(() => new LocalStorageAdapter<IncomeRecord>('advance_income'), []);
  const budgetAdapter = useMemo(() => new LocalStorageAdapter<Budget>('advance_budgets'), []);
  const paymentAdapter = useMemo(() => new LocalStorageAdapter<Payment>('advance_payments'), []);
  const expenseAdapter = useMemo(() => new LocalStorageAdapter<Expense>('advance_expenses'), []);
  const studentAdapter = useMemo(() => new LocalStorageAdapter<Student>('advance_students'), []);

  const [invoices, setInvoices] = useState<Invoice[]>(() => invoiceAdapter.getAll());
  const [incomeRecords, setIncomeRecords] = useState<IncomeRecord[]>(() => incomeAdapter.getAll());
  const [budgets, setBudgets] = useState<Budget[]>(() => budgetAdapter.getAll());

  const refreshInvoices = useCallback(() => {
    setInvoices(invoiceAdapter.getAll());
  }, [invoiceAdapter]);

  const refreshIncome = useCallback(() => {
    setIncomeRecords(incomeAdapter.getAll());
  }, [incomeAdapter]);

  const refreshBudgets = useCallback(() => {
    setBudgets(budgetAdapter.getAll());
  }, [budgetAdapter]);

  const createInvoice = useCallback((newInvoice: Invoice) => {
    invoiceAdapter.create(newInvoice);
    refreshInvoices();
  }, [invoiceAdapter, refreshInvoices]);

  const updateInvoiceStatus = useCallback((invoiceId: string, status: Invoice['status']) => {
    const existing = invoiceAdapter.getById(invoiceId);
    if (existing) {
      invoiceAdapter.update(invoiceId, { ...existing, status });
      refreshInvoices();
    }
  }, [invoiceAdapter, refreshInvoices]);

  const addIncomeRecord = useCallback((record: IncomeRecord) => {
    incomeAdapter.create(record);
    refreshIncome();
  }, [incomeAdapter, refreshIncome]);

  const saveBudget = useCallback((budget: Budget) => {
    const all = budgetAdapter.getAll();
    const existing = all.find((b) => b.year === budget.year && b.term === budget.term);
    if (existing) {
      budgetAdapter.update(existing.id, budget);
    } else {
      budgetAdapter.create(budget);
    }
    refreshBudgets();
  }, [budgetAdapter, refreshBudgets]);

  const getFinancialSummary = useCallback((): FinancialSummary => {
    const paymentsList = paymentAdapter.getAll();
    const nonFeeIncome = incomeAdapter.getAll();
    const expensesList = expenseAdapter.getAll();

    // Total Fee Income
    const feeIncome = paymentsList.reduce((acc, p) => acc + p.amountPaid, 0);
    // Other Income
    const otherIncome = nonFeeIncome.reduce((acc, i) => acc + i.amount, 0);
    const totalIncome = feeIncome + otherIncome;

    // Approved Expenses
    const totalExpense = expensesList
      .filter((e) => e.status === 'approved')
      .reduce((acc, e) => acc + e.amount, 0);

    const profitOrLoss = totalIncome - totalExpense;

    // Fee collection rate
    // Billed fees = Paid + Outstanding
    const totalCollected = feeIncome;
    const totalOutstanding = paymentsList.reduce((acc, p) => acc + p.balance, 0);
    const totalBilled = totalCollected + totalOutstanding;
    const feeCollectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 100;

    return {
      period: '2025/2026 Academic Year',
      totalIncome,
      totalExpense,
      profitOrLoss,
      feeCollectionRate
    };
  }, [paymentAdapter, incomeAdapter, expenseAdapter]);

  const autoGenerateInvoicesForTerm = useCallback((academicYear: string, term: Term) => {
    const studentsList = studentAdapter.getAll();
    const feeStructuresAdapter = new LocalStorageAdapter<FeeStructure>('advance_fee_structures');
    const structures = feeStructuresAdapter.getAll();

    let createdCount = 0;
    studentsList.forEach((student) => {
      // Find fee structure matching student class and term
      const structure = structures.find(
        (s) => s.classLevel === student.classLevel && s.term === term && s.academicYear === academicYear
      );

      if (structure) {
        // Check if invoice already exists for this student, term, and academicYear
        const exists = invoiceAdapter.getAll().some(
          (inv) => inv.studentId === student.id && inv.dueDate.includes(academicYear.split('/')[0]) // simple check
        );

        if (!exists) {
          const newInvoice: Invoice = {
            id: `inv_${Math.random().toString(36).substring(7)}`,
            studentId: student.id,
            date: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days due
            items: structure.items.map((i: FeeItem) => ({
              description: i.description,
              amount: i.amount
            })),
            total: structure.totalAmount,
            status: 'sent',
            term: structure.term
          };
          invoiceAdapter.create(newInvoice);
          createdCount++;
        }
      }
    });

    if (createdCount > 0) refreshInvoices();
    return createdCount;
  }, [studentAdapter, invoiceAdapter, refreshInvoices]);

  return {
    invoices,
    incomeRecords,
    budgets,
    createInvoice,
    updateInvoiceStatus,
    addIncomeRecord,
    saveBudget,
    getFinancialSummary,
    autoGenerateInvoicesForTerm,
    refreshInvoices,
    refreshIncome,
    refreshBudgets
  };
}
