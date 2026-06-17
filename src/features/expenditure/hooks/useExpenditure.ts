import { useState, useCallback, useMemo } from 'react';
import { LocalStorageAdapter } from '../../../services/adapters/localStorageAdapter';
import { Expense } from '../../../types/finance';

export interface ProcurementItem {
  id: string;
  itemName: string;
  qty: number;
  estimatedPrice: number;
  status: 'pending' | 'ordered' | 'delivered' | 'cancelled';
  requestedBy: string;
  dateRequested: string;
}

export function useExpenditure() {
  const expenseAdapter = useMemo(() => new LocalStorageAdapter<Expense>('advance_expenses'), []);
  const procurementAdapter = useMemo(() => new LocalStorageAdapter<ProcurementItem>('advance_procurements'), []);

  const [expenses, setExpenses] = useState<Expense[]>(() => expenseAdapter.getAll());
  const [procurements, setProcurements] = useState<ProcurementItem[]>(() => procurementAdapter.getAll());

  const refreshExpenses = useCallback(() => {
    setExpenses(expenseAdapter.getAll());
  }, [expenseAdapter]);

  const refreshProcurements = useCallback(() => {
    setProcurements(procurementAdapter.getAll());
  }, [procurementAdapter]);

  const recordExpense = useCallback((newExpense: Expense) => {
    expenseAdapter.create(newExpense);
    refreshExpenses();
  }, [expenseAdapter, refreshExpenses]);

  const deleteExpense = useCallback((id: string) => {
    expenseAdapter.delete(id);
    refreshExpenses();
  }, [expenseAdapter, refreshExpenses]);

  const createProcurementRequest = useCallback((newItem: ProcurementItem) => {
    procurementAdapter.create(newItem);
    refreshProcurements();
  }, [procurementAdapter, refreshProcurements]);

  const updateProcurementStatus = useCallback((id: string, status: ProcurementItem['status']) => {
    const existing = procurementAdapter.getById(id);
    if (existing) {
      const updated = { ...existing, status };
      procurementAdapter.update(id, updated);
      refreshProcurements();

      // If status becomes delivered, we can optionally auto-record an approved expense!
      if (status === 'delivered') {
        const expense: Expense = {
          id: `exp_${Math.random().toString(36).substring(7)}`,
          category: 'equipment', // default
          description: `Procured item: ${existing.itemName} (Qty: ${existing.qty})`,
          amount: existing.estimatedPrice * existing.qty,
          date: new Date().toISOString().split('T')[0],
          recordedBy: existing.requestedBy,
          status: 'approved'
        };
        expenseAdapter.create(expense);
        refreshExpenses();
      }
    }
  }, [procurementAdapter, expenseAdapter, refreshProcurements, refreshExpenses]);

  return {
    expenses,
    procurements,
    recordExpense,
    deleteExpense,
    createProcurementRequest,
    updateProcurementStatus,
    refreshExpenses,
    refreshProcurements
  };
}
