import React, { useState } from 'react';
import { useAdmin } from '../hooks/useAdmin';
import { useAuthStore } from '../../../stores/authStore';
import { useNotificationStore } from '../../../stores/notificationStore';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Card, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { DataTable, Column } from '../../../components/data-display/DataTable';
import { Badge } from '../../../components/ui/Badge';
import { Tabs } from '../../../components/ui/Tabs';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { LeaveRequest } from '../../../types/staff';
import { Expense } from '../../../types/finance';
import { CURRENCY_SYMBOL } from '../../../types/common';
import { CalendarOff, Receipt, Check, X } from 'lucide-react';

export default function ApprovalsPage() {
  const { 
    leaveRequests, 
    expenses, 
    approveLeave, 
    rejectLeave, 
    approveExpense, 
    rejectExpense 
  } = useAdmin();
  const { user } = useAuthStore();
  const addToast = useNotificationStore((state) => state.addToast);

  const [activeTab, setActiveTab] = useState('leave');
  
  // Rejection modal state
  const [rejectingItem, setRejectingItem] = useState<{ id: string; type: 'leave' | 'expense' } | null>(null);
  const [rejectionRemarks, setRejectionRemarks] = useState('');

  const handleApproveLeave = (id: string) => {
    if (!user) return;
    approveLeave(id, user.id, user.id, `${user.firstName} ${user.lastName}`);
    addToast({ type: 'success', message: 'Leave request approved successfully!' });
  };

  const handleApproveExpense = (id: string) => {
    if (!user) return;
    approveExpense(id, user.id, `${user.firstName} ${user.lastName}`);
    addToast({ type: 'success', message: 'Expense request approved and recorded.' });
  };

  const handleOpenRejectModal = (id: string, type: 'leave' | 'expense') => {
    setRejectingItem({ id, type });
    setRejectionRemarks('');
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !rejectingItem) return;

    if (!rejectionRemarks.trim()) {
      addToast({ type: 'error', message: 'Please specify the rejection reason.' });
      return;
    }

    if (rejectingItem.type === 'leave') {
      rejectLeave(rejectingItem.id, user.id, rejectionRemarks, user.id, `${user.firstName} ${user.lastName}`);
      addToast({ type: 'success', message: 'Leave request rejected.' });
    } else {
      rejectExpense(rejectingItem.id, user.id, `${user.firstName} ${user.lastName}`);
      addToast({ type: 'success', message: 'Expense request rejected.' });
    }
    setRejectingItem(null);
  };

  const pendingLeaves = leaveRequests.filter((r) => r.status === 'pending');
  const pendingExpenses = expenses.filter((e) => e.status === 'pending');

  const leaveColumns: Column<LeaveRequest>[] = [
    {
      header: 'Staff ID',
      accessorKey: 'staffId',
      sortable: true
    },
    {
      header: 'Type',
      accessorKey: 'type',
      sortable: true,
      cell: (item) => <span className="capitalize">{item.type.replace('_', ' ')}</span>
    },
    {
      header: 'Start Date',
      accessorKey: 'startDate',
      cell: (item) => new Date(item.startDate).toLocaleDateString('en-GB')
    },
    {
      header: 'End Date',
      accessorKey: 'endDate',
      cell: (item) => new Date(item.endDate).toLocaleDateString('en-GB')
    },
    {
      header: 'Reason',
      accessorKey: 'reason'
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (item) => (
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleApproveLeave(item.id)}
            className="text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
          >
            <Check size={16} className="mr-1" /> Approve
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleOpenRejectModal(item.id, 'leave')}
            className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
          >
            <X size={16} className="mr-1" /> Reject
          </Button>
        </div>
      )
    }
  ];

  const expenseColumns: Column<Expense>[] = [
    {
      header: 'Category',
      accessorKey: 'category',
      sortable: true,
      cell: (item) => <Badge variant="primary" className="capitalize">{item.category}</Badge>
    },
    {
      header: 'Description',
      accessorKey: 'description'
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
      cell: (item) => new Date(item.date).toLocaleDateString('en-GB')
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (item) => (
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleApproveExpense(item.id)}
            className="text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
          >
            <Check size={16} className="mr-1" /> Approve
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleOpenRejectModal(item.id, 'expense')}
            className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
          >
            <X size={16} className="mr-1" /> Reject
          </Button>
        </div>
      )
    }
  ];

  const tabs = [
    { id: 'leave', label: `Leave Requests (${pendingLeaves.length})`, icon: <CalendarOff size={16} /> },
    { id: 'expense', label: `Expense Approvals (${pendingExpenses.length})`, icon: <Receipt size={16} /> }
  ];

  const breadcrumbs = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Admin Panel' },
    { label: 'Approvals' }
  ];

  return (
    <PageWrapper 
      title="Approvals Center" 
      subtitle="Audit and approve institutional requests for employee leave and financial disbursements."
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="line" />

        {activeTab === 'leave' && (
          <Card className="animate-fade-in">
            <CardBody>
              <DataTable 
                data={pendingLeaves} 
                columns={leaveColumns} 
                searchKey="staffId" 
                searchPlaceholder="Search by Staff ID..." 
                pageSize={10} 
              />
            </CardBody>
          </Card>
        )}

        {activeTab === 'expense' && (
          <Card className="animate-fade-in">
            <CardBody>
              <DataTable 
                data={pendingExpenses} 
                columns={expenseColumns} 
                searchKey="description" 
                searchPlaceholder="Search by description..." 
                pageSize={10} 
              />
            </CardBody>
          </Card>
        )}
      </div>

      {/* Reject Remarks Modal */}
      <Modal
        isOpen={!!rejectingItem}
        onClose={() => setRejectingItem(null)}
        title="Reason for Rejection"
        size="md"
      >
        <form onSubmit={handleConfirmReject} className="space-y-4">
          <Input
            label="Rejection Comments *"
            placeholder="Provide a reason for the employee..."
            value={rejectionRemarks}
            onChange={(e) => setRejectionRemarks(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="secondary" type="button" onClick={() => setRejectingItem(null)}>
              Cancel
            </Button>
            <Button variant="danger" type="submit">
              Confirm Reject
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
