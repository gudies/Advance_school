import { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { useAuthStore } from '../../../stores/authStore';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Card, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { DataTable, Column } from '../../../components/data-display/DataTable';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { IncomeRecord } from '../../../types/finance';
import { CURRENCY_SYMBOL } from '../../../types/common';
import { useNotificationStore } from '../../../stores/notificationStore';
import { Plus, Calendar } from 'lucide-react';

const INCOME_SOURCES = [
  { value: 'donation', label: 'Donation' },
  { value: 'grant', label: 'Grant / Subvention' },
  { value: 'book_sales', label: 'Book Store Sales' },
  { value: 'uniform_sales', label: 'Uniform Sales' },
  { value: 'canteen_rent', label: 'Canteen Rent' },
  { value: 'other', label: 'Other Revenue' }
];

export default function IncomePage() {
  const { incomeRecords, addIncomeRecord } = useFinance();
  const { user } = useAuthStore();
  const addToast = useNotificationStore((state) => state.addToast);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [source, setSource] = useState('donation');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleOpenModal = () => {
    setSource('donation');
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!description || !amount || !date) {
      addToast({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    const record: IncomeRecord = {
      id: `inc_${Math.random().toString(36).substring(7)}`,
      source,
      description,
      amount: Number(amount),
      date,
      recordedBy: user.id
    };

    addIncomeRecord(record);
    addToast({ type: 'success', message: 'Income record added successfully!' });
    setIsModalOpen(false);
  };

  const columns: Column<IncomeRecord>[] = [
    {
      header: 'Source',
      accessorKey: 'source',
      sortable: true,
      cell: (item) => <Badge variant="success" className="capitalize">{item.source.replace('_', ' ')}</Badge>
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
      header: 'Recorded By',
      accessorKey: 'recordedBy'
    }
  ];

  const breadcrumbs = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Finance' },
    { label: 'Non-Fee Income' }
  ];

  return (
    <PageWrapper 
      title="Non-Fee School Revenue" 
      subtitle="Track operational revenue channels separate from academic tuition bills (grants, donations, inventory sales)."
      breadcrumbs={breadcrumbs}
      action={
        <Button variant="primary" onClick={handleOpenModal} leftIcon={<Plus size={16} />}>
          Record Revenue
        </Button>
      }
    >
      <Card>
        <CardBody>
          <DataTable 
            data={incomeRecords} 
            columns={columns} 
            searchKey="description" 
            searchPlaceholder="Search income records by description..." 
            pageSize={10} 
          />
        </CardBody>
      </Card>

      {/* Record Revenue Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Institutional Revenue"
        size="md"
      >
        <form onSubmit={handleAddIncome} className="space-y-4">
          <Select
            label="Revenue Source *"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            options={INCOME_SOURCES}
          />
          <Input
            label="Description *"
            placeholder="e.g. Annual PTA fundraising subvention"
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
            label="Received Date *"
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
              Record Income
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
