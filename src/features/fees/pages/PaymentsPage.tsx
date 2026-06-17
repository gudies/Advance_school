import React, { useState, useMemo } from 'react';
import { useFees } from '../hooks/useFees';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Card, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Modal } from '../../../components/ui/Modal';
import { DataTable, Column } from '../../../components/data-display/DataTable';
import { Badge } from '../../../components/ui/Badge';
import { LocalStorageAdapter } from '../../../services/adapters/localStorageAdapter';
import { Payment, Student, CLASS_LEVELS, TERMS, CURRENCY_SYMBOL } from '../../../types';
import { Plus, Search } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';

export default function PaymentsPage() {
  const { payments, recordPayment, feeStructures } = useFees();
  const { user } = useAuthStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [termFilter, setTermFilter] = useState('');

  // Form State
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [method, setMethod] = useState<Payment['method']>('cash');
  const [reference, setReference] = useState('');
  const [remarks, setRemarks] = useState('');

  // Search students for payment modal
  const studentAdapter = useMemo(() => new LocalStorageAdapter<Student>('advance_students'), []);
  const activeStudents = useMemo(() => studentAdapter.getWhere(s => s.status === 'active' || s.status === 'enrolled'), [studentAdapter]);

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchesSearch = p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || p.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClass = classFilter ? p.classLevel === classFilter : true;
      const matchesTerm = termFilter ? p.term === termFilter : true;
      return matchesSearch && matchesClass && matchesTerm;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [payments, searchQuery, classFilter, termFilter]);

  const handleStudentSelect = (studentId: string) => {
    const student = activeStudents.find(s => s.id === studentId);
    if (student) setSelectedStudent(student);
  };

  const calculatePaymentDetails = () => {
    if (!selectedStudent) return { totalDue: 0, previousPayments: 0, currentBalance: 0, newBalance: 0 };

    const structure = feeStructures.find(fs => fs.classLevel === selectedStudent.classLevel);
    const totalDue = structure ? structure.totalAmount : 0;
    
    const previousPayments = payments
      .filter(p => p.studentId === selectedStudent.id)
      .reduce((sum, p) => sum + p.amountPaid, 0);

    const currentBalance = totalDue - previousPayments;
    const newBalance = Math.max(0, currentBalance - amountPaid);

    return { totalDue, previousPayments, currentBalance, newBalance };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !user) return;

    const { totalDue, newBalance } = calculatePaymentDetails();
    
    // Status depends on balance
    const status = newBalance <= 0 ? 'paid' : 'partial';

    recordPayment({
      studentId: selectedStudent.id,
      studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
      classLevel: selectedStudent.classLevel,
      term: 'Term 1', // In a real app, this should be the active term
      academicYear: '2025/2026',
      totalAmount: totalDue,
      amountPaid,
      balance: newBalance,
      method,
      reference,
      date: new Date().toISOString(),
      receivedBy: user.id,
      status,
      remarks
    });

    setIsModalOpen(false);
    // Reset
    setSelectedStudent(null);
    setAmountPaid(0);
    setReference('');
    setRemarks('');
  };

  const columns: Column<Payment>[] = [
    { header: 'Receipt', accessorKey: 'receiptNumber', cell: (item) => <span className="font-medium text-primary-600">{item.receiptNumber}</span> },
    { header: 'Date', accessorKey: 'date', cell: (item) => new Date(item.date).toLocaleDateString() },
    { header: 'Student', accessorKey: 'studentName', cell: (item) => <span className="font-semibold">{item.studentName}</span> },
    { header: 'Class', accessorKey: 'classLevel' },
    { header: 'Term', accessorKey: 'term' },
    { header: 'Amount', accessorKey: 'amountPaid', cell: (item) => <span className="font-bold">{CURRENCY_SYMBOL}{item.amountPaid.toLocaleString()}</span> },
    { header: 'Method', accessorKey: 'method', cell: (item) => <span className="capitalize text-secondary">{item.method.replace('_', ' ')}</span> },
    { 
      header: 'Status', 
      accessorKey: 'status',
      cell: (item) => {
        const variant = item.status === 'paid' ? 'success' : item.status === 'partial' ? 'warning' : 'neutral';
        return <Badge variant={variant} className="capitalize">{item.status}</Badge>;
      }
    }
  ];

  const paymentDetails = calculatePaymentDetails();

  return (
    <PageWrapper
      title="Payment History"
      subtitle="View all recorded payments and process new transactions."
      breadcrumbs={[
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Fees', path: '/fees' },
        { label: 'Payments' },
      ]}
      action={
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Record Payment
        </Button>
      }
    >
      <div className="space-y-6">
        <Card>
          <CardBody className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary h-4 w-4" />
              <input
                type="text"
                placeholder="Search by student name or receipt number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-transparent text-sm"
              />
            </div>
            <div className="flex gap-4 md:w-1/3">
              <div className="flex-1">
                <Select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  options={[{ label: 'All Classes', value: '' }, ...CLASS_LEVELS.map(c => ({ label: c, value: c }))]}
                />
              </div>
              <div className="flex-1">
                <Select
                  value={termFilter}
                  onChange={(e) => setTermFilter(e.target.value)}
                  options={[{ label: 'All Terms', value: '' }, ...TERMS.map(t => ({ label: t, value: t }))]}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-0">
            <DataTable data={filteredPayments} columns={columns} />
          </CardBody>
        </Card>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Payment" size="md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Select 
              label="Select Student" 
              value={selectedStudent?.id || ''} 
              onChange={(e) => handleStudentSelect(e.target.value)}
              options={[
                { label: '-- Select Student --', value: '' },
                ...activeStudents.map(s => ({ label: `${s.firstName} ${s.lastName} (${s.studentId}) - ${s.classLevel}`, value: s.id }))
              ]}
              required
            />

            {selectedStudent && (
              <div className="bg-surface-secondary p-4 rounded-lg border border-border-secondary space-y-2 text-sm">
                <div className="flex-between">
                  <span className="text-secondary">Total Due:</span>
                  <span className="font-medium">{CURRENCY_SYMBOL}{paymentDetails.totalDue.toLocaleString()}</span>
                </div>
                <div className="flex-between">
                  <span className="text-secondary">Previous Payments:</span>
                  <span className="font-medium">{CURRENCY_SYMBOL}{paymentDetails.previousPayments.toLocaleString()}</span>
                </div>
                <div className="flex-between pt-2 border-t border-border-secondary">
                  <span className="font-bold">Current Balance:</span>
                  <span className="font-bold text-danger-600">{CURRENCY_SYMBOL}{paymentDetails.currentBalance.toLocaleString()}</span>
                </div>
              </div>
            )}

            <div className="grid grid-2 gap-4">
              <Input 
                label={`Amount to Pay (${CURRENCY_SYMBOL})`}
                type="number"
                min="1"
                step="0.01"
                max={paymentDetails.currentBalance > 0 ? paymentDetails.currentBalance : undefined}
                value={amountPaid || ''}
                onChange={(e) => setAmountPaid(Number(e.target.value))}
                required
              />
              <Select 
                label="Payment Method"
                value={method}
                onChange={(e) => setMethod(e.target.value as Payment['method'])}
                options={[
                  { value: 'cash', label: 'Cash' },
                  { value: 'mobile_money', label: 'Mobile Money' },
                  { value: 'bank_transfer', label: 'Bank Transfer' },
                  { value: 'cheque', label: 'Cheque' }
                ]}
                required
              />
            </div>

            {method !== 'cash' && (
              <Input 
                label="Reference Number (Transaction ID / Cheque No.)"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                required
              />
            )}

            <Input 
              label="Remarks (Optional)"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />

            {amountPaid > 0 && selectedStudent && (
              <div className="bg-success-50 text-success-800 p-4 rounded-lg border border-success-200 flex-between">
                <span className="font-medium">Remaining Balance After Payment:</span>
                <span className="font-bold text-lg">{CURRENCY_SYMBOL}{paymentDetails.newBalance.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-border-secondary">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={!selectedStudent || amountPaid <= 0}>Process Payment</Button>
            </div>
          </form>
        </Modal>
      </div>
    </PageWrapper>
  );
}
