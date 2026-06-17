import { useState } from 'react';
import { useExpenditure } from '../hooks/useExpenditure';
import { useAuthStore } from '../../../stores/authStore';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Card, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { DataTable, Column } from '../../../components/data-display/DataTable';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Expense, ExpenseCategory } from '../../../types/finance';
import { CURRENCY_SYMBOL } from '../../../types/common';
import { useNotificationStore } from '../../../stores/notificationStore';
import { Plus, Calendar, Trash2 } from 'lucide-react';

const CATEGORY_OPTIONS = [
  { value: 'salary', label: 'Salary / Wages' },
  { value: 'utilities', label: 'Utilities (Electricity/Water)' },
  { value: 'maintenance', label: 'Facilities Maintenance' },
  { value: 'supplies', label: 'School Supplies' },
  { value: 'equipment', label: 'Lab/IT Equipment' },
  { value: 'events', label: 'School Events' },
  { value: 'transportation', label: 'Transportation / Fuel' },
  { value: 'other', label: 'Other Operational Expenses' }
];

export default function RecordExpensePage() {
  const { expenses, recordExpense, deleteExpense } = useExpenditure();
  const { user } = useAuthStore();
  const addToast = useNotificationStore((state) => state.addToast);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState<ExpenseCategory>('supplies');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleOpenModal = () => {
    setCategory('supplies');
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!description || !amount || !date) {
      addToast({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    const isAdmin = user.role === 'super_admin' || user.role === 'admin';
    const expense: Expense = {
      id: `exp_${Math.random().toString(36).substring(7)}`,
      category,
      description,
      amount: Number(amount),
      date,
      recordedBy: user.id,
      status: isAdmin ? 'approved' : 'pending',
      approvedBy: isAdmin ? user.id : undefined
    };

    recordExpense(expense);
    addToast({ 
      type: 'success', 
      message: isAdmin ? 'Expense recorded and auto-approved!' : 'Expense request submitted for administrative review.' 
    });
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteExpense(id);
    addToast({ type: 'success', message: 'Expense record deleted.' });
  };

  const columns: Column<Expense>[] = [
    {
      header: 'Category',
      accessorKey: 'category',
      sortable: true,
      cell: (item) => <Badge variant="primary" className="capitalize">{item.category}</Badge>
    },
    {
      header: 'Description',
      accessorKey: 'description',
      sortable: true
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      sortable: true,
      cell: (item) => `${CURRENCY_SYMBOL}${item.amount.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`
    },
    {
      header: 'Date',
      accessorKey: 'date',
      sortable: true,
      cell: (item) => (
        <div className="flex items-center gap-2 text-slate-500">
          <Calendar size={14} />
          <span>{new Date(item.date).toLocaleDateString('en-GB')}</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: (item) => {
        const variants: Record<string, 'success' | 'warning' | 'danger'> = {
          approved: 'success',
          pending: 'warning',
          rejected: 'danger'
        };
        return <Badge variant={variants[item.status] || 'neutral'}>{item.status}</Badge>;
      }
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (item) => (
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleDelete(item.id)} 
            className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
            title="Delete Expense Record"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      )
    }
  ];

  const breadcrumbs = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Expenditure' },
    { label: 'Record Expense' }
  ];

  return (
    <PageWrapper 
      title="Disbursement Ledger & Expense Records" 
      subtitle="Log operational costs, submit reimbursement slips, and manage historical expense logs."
      breadcrumbs={breadcrumbs}
      action={
        <Button variant="primary" onClick={handleOpenModal} leftIcon={<Plus size={16} />}>
          Record Expense
        </Button>
      }
    >
      <Card>
        <CardBody>
          <DataTable 
            data={expenses} 
            columns={columns} 
            searchKey="description" 
            searchPlaceholder="Search expense logs by description..." 
            pageSize={10} 
          />
        </CardBody>
      </Card>

      {/* Record Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Institutional Expense"
        size="md"
      >
        <form onSubmit={handleAddExpense} className="space-y-4">
          <Select
            label="Expense Category *"
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            options={CATEGORY_OPTIONS}
          />
          <Input
            label="Description *"
            placeholder="e.g. Monthly utility bill payment"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <Input
            label="Amount (GH₵) *"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <Input
            label="Payment Date *"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Record Expense
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
