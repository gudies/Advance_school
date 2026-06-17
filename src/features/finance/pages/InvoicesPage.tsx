import { useState, useMemo } from 'react';
import { useFinance } from '../hooks/useFinance';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Card, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { DataTable, Column } from '../../../components/data-display/DataTable';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { LocalStorageAdapter } from '../../../services/adapters/localStorageAdapter';
import { Student } from '../../../types/student';
import { Invoice } from '../../../types/finance';
import { CURRENCY_SYMBOL, Term } from '../../../types/common';
import { useNotificationStore } from '../../../stores/notificationStore';
import { Plus, RefreshCw, Trash2 } from 'lucide-react';

export default function InvoicesPage() {
  const { invoices, createInvoice, updateInvoiceStatus, autoGenerateInvoicesForTerm } = useFinance();
  const addToast = useNotificationStore((state) => state.addToast);

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // Individual Invoice Form state
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [invoiceItems, setInvoiceItems] = useState<{ description: string; amount: number }[]>([
    { description: 'Tuition Fee', amount: 0 }
  ]);

  // Bulk Invoice Form state
  const [bulkYear, setBulkYear] = useState('2025/2026');
  const [bulkTerm, setBulkTerm] = useState<Term>('Term 2');

  const studentsList = useMemo(() => {
    return new LocalStorageAdapter<Student>('advance_students').getAll();
  }, []);

  const handleAddInvoiceItem = () => {
    setInvoiceItems((prev) => [...prev, { description: '', amount: 0 }]);
  };

  const handleRemoveInvoiceItem = (index: number) => {
    setInvoiceItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: 'description' | 'amount', value: string | number) => {
    setInvoiceItems((prev) => {
      const updated = [...prev];
      if (field === 'amount') {
        updated[index].amount = Number(value);
      } else {
        updated[index].description = String(value);
      }
      return updated;
    });
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !dueDate) {
      addToast({ type: 'error', message: 'Please select a student and specify a due date.' });
      return;
    }

    const validItems = invoiceItems.filter((i) => i.description && i.amount > 0);
    if (validItems.length === 0) {
      addToast({ type: 'error', message: 'Invoice must contain at least one item with amount > 0.' });
      return;
    }

    const total = validItems.reduce((acc, item) => acc + item.amount, 0);

    const newInvoice: Invoice = {
      id: `inv_${Math.random().toString(36).substring(7)}`,
      studentId: selectedStudentId,
      date: new Date().toISOString().split('T')[0],
      dueDate,
      items: validItems,
      total,
      status: 'sent'
    };

    createInvoice(newInvoice);
    addToast({ type: 'success', message: 'Invoice created and issued successfully!' });
    setIsInvoiceModalOpen(false);
  };

  const handleBulkGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const count = autoGenerateInvoicesForTerm(bulkYear, bulkTerm);
      if (count > 0) {
        addToast({ type: 'success', message: `Successfully generated ${count} term invoices based on active configurations!` });
      } else {
        addToast({ type: 'warning', message: 'No new invoices generated. All eligible students already have invoices for this term.' });
      }
      setIsBulkModalOpen(false);
    } catch (err) {
      addToast({ type: 'error', message: err instanceof Error ? err.message : 'Bulk generation failed.' });
    }
  };

  const handleMarkPaid = (id: string) => {
    updateInvoiceStatus(id, 'paid');
    addToast({ type: 'success', message: 'Invoice status updated to Paid.' });
  };

  const getStudentName = (studentId: string) => {
    const s = studentsList.find((st) => st.id === studentId);
    return s ? `${s.firstName} ${s.lastName} (${s.classLevel})` : studentId;
  };

  const columns: Column<Invoice>[] = [
    {
      header: 'Invoice ID',
      accessorKey: 'id',
      sortable: true,
      cell: (item) => <span className="font-mono text-xs font-semibold">{item.id}</span>
    },
    {
      header: 'Student',
      accessorKey: 'studentId',
      sortable: true,
      cell: (item) => getStudentName(item.studentId)
    },
    {
      header: 'Date Billed',
      accessorKey: 'date',
      cell: (item) => new Date(item.date).toLocaleDateString('en-GB')
    },
    {
      header: 'Due Date',
      accessorKey: 'dueDate',
      cell: (item) => new Date(item.dueDate).toLocaleDateString('en-GB')
    },
    {
      header: 'Total Amount',
      accessorKey: 'total',
      sortable: true,
      cell: (item) => `${CURRENCY_SYMBOL}${item.total.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: (item) => {
        const variants: Record<string, 'success' | 'primary' | 'warning' | 'danger' | 'neutral'> = {
          paid: 'success',
          sent: 'primary',
          draft: 'neutral',
          overdue: 'danger'
        };
        return <Badge variant={variants[item.status] || 'neutral'}>{item.status}</Badge>;
      }
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (item) => (
        <div className="flex gap-2">
          {item.status !== 'paid' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleMarkPaid(item.id)}
            >
              Mark Paid
            </Button>
          )}
        </div>
      )
    }
  ];

  const breadcrumbs = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Finance' },
    { label: 'Invoices' }
  ];

  return (
    <PageWrapper 
      title="Student Invoicing Ledger" 
      subtitle="Manage tuition billing receipts, view payment timelines, and run batch invoicing workflows."
      breadcrumbs={breadcrumbs}
      action={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsBulkModalOpen(true)} leftIcon={<RefreshCw size={16} />}>
            Bulk Generate
          </Button>
          <Button variant="primary" onClick={() => setIsInvoiceModalOpen(true)} leftIcon={<Plus size={16} />}>
            Create Invoice
          </Button>
        </div>
      }
    >
      <Card>
        <CardBody>
          <DataTable 
            data={invoices} 
            columns={columns} 
            searchKey="studentId" 
            searchPlaceholder="Search invoices by Student ID..." 
            pageSize={10} 
          />
        </CardBody>
      </Card>

      {/* Individual Invoice Modal */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Create Student Invoice"
        size="lg"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-6">
          <Select
            label="Select Student *"
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            options={studentsList.map((s) => ({
              value: s.id,
              label: `${s.firstName} ${s.lastName} [${s.classLevel}] - ID: ${s.studentId}`
            }))}
            placeholder="Search and select student..."
          />

          <Input
            label="Due Date *"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Invoice Items</h4>
              <Button type="button" variant="outline" size="sm" onClick={handleAddInvoiceItem}>
                Add Item
              </Button>
            </div>
            
            <div className="space-y-3">
              {invoiceItems.map((item, idx) => (
                <div key={idx} className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Input
                      placeholder="e.g. Feeding Fee"
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      required
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={item.amount || ''}
                      onChange={(e) => handleItemChange(idx, 'amount', e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveInvoiceItem(idx)}
                    disabled={invoiceItems.length === 1}
                    className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 mb-5"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 pt-4">
            <Button variant="secondary" type="button" onClick={() => setIsInvoiceModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Issue Invoice
            </Button>
          </div>
        </form>
      </Modal>

      {/* Bulk Generate Modal */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Batch Term Billing Generator"
        size="md"
      >
        <form onSubmit={handleBulkGenerate} className="space-y-4">
          <p className="text-sm text-slate-500">
            This operation automatically queries active students, detects their corresponding class fee structures, and issues a standard tuition invoice in draft status.
          </p>
          <Input
            label="Academic Year *"
            value={bulkYear}
            onChange={(e) => setBulkYear(e.target.value)}
            required
          />
          <Select
            label="Billing Term *"
            value={bulkTerm}
            onChange={(e) => setBulkTerm(e.target.value as Term)}
            options={[
              { value: 'Term 1', label: 'Term 1' },
              { value: 'Term 2', label: 'Term 2' },
              { value: 'Term 3', label: 'Term 3' }
            ]}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="secondary" type="button" onClick={() => setIsBulkModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Run Invoice Generator
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
