import { useState, useCallback, useMemo } from 'react';
import { LocalStorageAdapter } from '../../../services/adapters/localStorageAdapter';
import { FeeStructure, Payment, ID, Student } from '../../../types';
import { useNotificationStore } from '../../../stores/notificationStore';

export function useFees() {
  const feeAdapter = useMemo(() => new LocalStorageAdapter<FeeStructure>('advance_fee_structures'), []);
  const paymentAdapter = useMemo(() => new LocalStorageAdapter<Payment>('advance_payments'), []);
  const studentAdapter = useMemo(() => new LocalStorageAdapter<Student>('advance_students'), []);
  
  const addToast = useNotificationStore(state => state.addToast);

  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>(() => feeAdapter.getAll());
  const [payments, setPayments] = useState<Payment[]>(() => paymentAdapter.getAll());

  const refreshFees = useCallback(() => setFeeStructures(feeAdapter.getAll()), [feeAdapter]);
  const refreshPayments = useCallback(() => setPayments(paymentAdapter.getAll()), [paymentAdapter]);

  const addFeeStructure = useCallback((structure: Omit<FeeStructure, 'id'>) => {
    try {
      feeAdapter.create(structure);
      refreshFees();
      addToast({ type: 'success', title: 'Success', message: 'Fee structure created successfully.' });
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to create fee structure.' });
    }
  }, [feeAdapter, refreshFees, addToast]);

  const updateFeeStructure = useCallback((id: ID, updates: Partial<FeeStructure>) => {
    try {
      feeAdapter.update(id, updates);
      refreshFees();
      addToast({ type: 'success', title: 'Success', message: 'Fee structure updated successfully.' });
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to update fee structure.' });
    }
  }, [feeAdapter, refreshFees, addToast]);

  const recordPayment = useCallback((payment: Omit<Payment, 'id' | 'receiptNumber'>) => {
    try {
      // Generate receipt number
      const date = new Date();
      const year = date.getFullYear();
      const count = paymentAdapter.count() + 1;
      const receiptNumber = `RCP-${year}-${count.toString().padStart(4, '0')}`;

      paymentAdapter.create({ ...payment, receiptNumber });
      refreshPayments();
      addToast({ type: 'success', title: 'Payment Recorded', message: `Payment recorded successfully. Receipt: ${receiptNumber}` });
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to record payment.' });
    }
  }, [paymentAdapter, refreshPayments, addToast]);

  const getOutstandingBalances = useCallback(() => {
    const students = studentAdapter.getWhere(s => s.status === 'active' || s.status === 'enrolled');
    
    return students.map(student => {
      // Find applicable fee structure for student's class
      const feeStructure = feeStructures.find(fs => fs.classLevel === student.classLevel);
      const totalDue = feeStructure ? feeStructure.totalAmount : 0;
      
      // Calculate total paid by student
      const studentPayments = payments.filter(p => p.studentId === student.id);
      const totalPaid = studentPayments.reduce((sum, p) => sum + p.amountPaid, 0);
      
      return {
        student,
        totalDue,
        totalPaid,
        balance: totalDue - totalPaid
      };
    }).filter(record => record.balance > 0);
  }, [studentAdapter, feeStructures, payments]);

  const getTotalCollected = useCallback(() => {
    return payments.reduce((sum, p) => sum + p.amountPaid, 0);
  }, [payments]);

  return {
    feeStructures,
    payments,
    refreshFees,
    refreshPayments,
    addFeeStructure,
    updateFeeStructure,
    recordPayment,
    getOutstandingBalances,
    getTotalCollected
  };
}
