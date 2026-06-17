import { useState } from 'react';
import { useExpenditure, ProcurementItem } from '../hooks/useExpenditure';
import { useAuthStore } from '../../../stores/authStore';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Card, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { DataTable, Column } from '../../../components/data-display/DataTable';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { CURRENCY_SYMBOL } from '../../../types/common';
import { useNotificationStore } from '../../../stores/notificationStore';
import { Plus, ShoppingBag, Truck, Check, Ban } from 'lucide-react';

export default function ProcurementPage() {
  const { procurements, createProcurementRequest, updateProcurementStatus } = useExpenditure();
  const { user } = useAuthStore();
  const addToast = useNotificationStore((state) => state.addToast);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [qty, setQty] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');

  const handleOpenModal = () => {
    setItemName('');
    setQty('');
    setEstimatedPrice('');
    setIsModalOpen(true);
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!itemName || !qty || !estimatedPrice) {
      addToast({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    const newItem: ProcurementItem = {
      id: `prc_${Math.random().toString(36).substring(7)}`,
      itemName,
      qty: Number(qty),
      estimatedPrice: Number(estimatedPrice),
      status: 'pending',
      requestedBy: `${user.firstName} ${user.lastName}`,
      dateRequested: new Date().toISOString().split('T')[0]
    };

    createProcurementRequest(newItem);
    addToast({ type: 'success', message: 'Procurement request submitted successfully!' });
    setIsModalOpen(false);
  };

  const handleUpdateStatus = (id: string, status: ProcurementItem['status']) => {
    updateProcurementStatus(id, status);
    addToast({ 
      type: 'success', 
      message: `Procurement request status updated to ${status.toUpperCase()}.` 
    });
  };

  const columns: Column<ProcurementItem>[] = [
    {
      header: 'Item Description',
      accessorKey: 'itemName',
      sortable: true
    },
    {
      header: 'Quantity',
      accessorKey: 'qty',
      sortable: true
    },
    {
      header: 'Est. Unit Price',
      accessorKey: 'estimatedPrice',
      cell: (item) => `${CURRENCY_SYMBOL}${item.estimatedPrice.toLocaleString()}`
    },
    {
      header: 'Total Value',
      accessorKey: 'id',
      cell: (item) => `${CURRENCY_SYMBOL}${(item.estimatedPrice * item.qty).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: (item) => {
        const variants: Record<string, 'success' | 'warning' | 'primary' | 'danger'> = {
          delivered: 'success',
          pending: 'warning',
          ordered: 'primary',
          cancelled: 'danger'
        };
        return <Badge variant={variants[item.status] || 'neutral'}>{item.status}</Badge>;
      }
    },
    {
      header: 'Requested By',
      accessorKey: 'requestedBy',
      sortable: true
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (item) => {
        const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';
        if (!isAdmin || item.status === 'delivered' || item.status === 'cancelled') return null;

        return (
          <div className="flex gap-2">
            {item.status === 'pending' && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleUpdateStatus(item.id, 'ordered')}
                className="text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/20"
                title="Mark as Ordered"
              >
                <Truck size={14} className="mr-1" /> Order
              </Button>
            )}
            {item.status === 'ordered' && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleUpdateStatus(item.id, 'delivered')}
                className="text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                title="Mark as Delivered"
              >
                <Check size={14} className="mr-1" /> Receive
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleUpdateStatus(item.id, 'cancelled')}
              className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
              title="Cancel Order"
            >
              <Ban size={14} className="mr-1" /> Cancel
            </Button>
          </div>
        );
      }
    }
  ];

  const breadcrumbs = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Expenditure' },
    { label: 'Procurement' }
  ];

  return (
    <PageWrapper 
      title="Procurement Orders & Requests" 
      subtitle="Review departmental purchasing logs, submit vendor ordering sheets, and process deliveries."
      breadcrumbs={breadcrumbs}
      action={
        <Button variant="primary" onClick={handleOpenModal} leftIcon={<Plus size={16} />}>
          Submit Request
        </Button>
      }
    >
      <Card>
        <CardBody>
          <DataTable 
            data={procurements} 
            columns={columns} 
            searchKey="itemName" 
            searchPlaceholder="Search procurement items..." 
            pageSize={10} 
          />
        </CardBody>
      </Card>

      {/* Submit Request Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit Procurement Request"
        size="md"
      >
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <Input
            label="Item Description *"
            placeholder="e.g. IT Lab Router Replacement"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            required
          />
          <Input
            label="Quantity *"
            type="number"
            placeholder="1"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            required
          />
          <Input
            label="Estimated Unit Price (GH₵) *"
            type="number"
            placeholder="0.00"
            value={estimatedPrice}
            onChange={(e) => setEstimatedPrice(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" leftIcon={<ShoppingBag size={16} />}>
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
