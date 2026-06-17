import { useState, useMemo } from 'react';
import { useAuthStore } from '../../../../stores/authStore';
import { useParent } from '../hooks/useParent';
import { PageWrapper } from '../../../../components/layout/PageWrapper';
import { Card, CardHeader, CardTitle, CardBody } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { DataTable, Column } from '../../../../components/data-display/DataTable';
import { Badge } from '../../../../components/ui/Badge';
import { Modal } from '../../../../components/ui/Modal';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { CURRENCY_SYMBOL } from '../../../../types/common';
import { useNotificationStore } from '../../../../stores/notificationStore';
import { CreditCard, Wallet, CheckCircle, Smartphone } from 'lucide-react';
import { Invoice } from '../../../../types/finance';

export default function PayFeesPage() {
  const { user } = useAuthStore();
  const parentEmail = user?.email || 'parent@camiedbehills.edu.gh';
  
  const { children, getInvoicesForChild, payInvoice } = useParent(parentEmail);
  const addToast = useNotificationStore((state) => state.addToast);
  
  const [selectedChildId, setSelectedChildId] = useState<string>(() => {
    return children.length > 0 ? children[0].id : '';
  });

  const activeChild = useMemo(() => {
    return children.find(c => c.id === selectedChildId) || null;
  }, [children, selectedChildId]);

  const invoices = useMemo(() => {
    if (!activeChild) return [];
    return getInvoicesForChild(activeChild.id);
  }, [activeChild, getInvoicesForChild]);

  // Payment checkout state
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'card'>('momo');
  const [provider, setProvider] = useState('mtn');
  const [phone, setPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOpenPaymentModal = (invoice: Invoice) => {
    setPayingInvoice(invoice);
    setPaymentMethod('momo');
    setProvider('mtn');
    setPhone('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;

    if (paymentMethod === 'momo' && !phone) {
      addToast({ type: 'error', message: 'Please specify the Mobile Money number.' });
      return;
    }

    if (paymentMethod === 'card' && (!cardNumber || !cardExpiry || !cardCvv)) {
      addToast({ type: 'error', message: 'Please complete all card details.' });
      return;
    }

    setIsProcessing(true);
    addToast({ type: 'info', message: 'Initiating checkout portal, processing transaction...' });

    setTimeout(() => {
      const ref = `REF-${Math.floor(100000 + Math.random() * 900000)}`;
      const success = payInvoice(payingInvoice.id, paymentMethod === 'momo' ? 'mobile_money' : 'bank_transfer', ref);
      
      setIsProcessing(false);
      if (success) {
        addToast({ type: 'success', message: `Payment of ${CURRENCY_SYMBOL}${payingInvoice.total} recorded successfully! Reference: ${ref}` });
        setPayingInvoice(null);
      } else {
        addToast({ type: 'error', message: 'Failed to record payment transaction.' });
      }
    }, 2000);
  };

  const columns: Column<Invoice>[] = [
    {
      header: 'Invoice ID',
      accessorKey: 'id',
      sortable: true,
      cell: (item) => <span className="font-mono text-xs">{item.id}</span>
    },
    {
      header: 'Billing Term',
      accessorKey: 'term',
      sortable: true
    },
    {
      header: 'Total Value',
      accessorKey: 'total',
      sortable: true,
      cell: (item) => `${CURRENCY_SYMBOL}${item.total.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`
    },
    {
      header: 'Due Date',
      accessorKey: 'dueDate',
      cell: (item) => new Date(item.dueDate).toLocaleDateString('en-GB')
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: (item) => (
        <Badge variant={item.status === 'paid' ? 'success' : item.status === 'overdue' ? 'danger' : 'warning'}>
          {item.status}
        </Badge>
      )
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (item) => (
        item.status !== 'paid' ? (
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenPaymentModal(item)}
            className="text-xs h-7 py-1 px-3"
          >
            Pay Now
          </Button>
        ) : (
          <span className="text-emerald-600 font-semibold text-xs flex items-center gap-1">
            <CheckCircle size={14} /> Paid & Cleared
          </span>
        )
      )
    }
  ];

  const breadcrumbs = [
    { label: 'Parent Portal', path: '/parent' },
    { label: 'Payments' }
  ];

  return (
    <PageWrapper
      title="School Fee Payments"
      subtitle="View, audit, and clear child terminal school fees through secure local channels."
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Child Selector */}
        {children.length > 1 && (
          <div className="flex items-center gap-3 p-4 bg-surface-primary rounded-xl border border-border-secondary">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Select Child:</span>
            <div className="flex gap-2">
              {children.map(child => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChildId(child.id)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                    selectedChildId === child.id 
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' 
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {child.firstName} {child.lastName}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeChild ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="text-primary-500" size={18} />
                Student Invoices & Statements
              </CardTitle>
            </CardHeader>
            <CardBody>
              <DataTable
                columns={columns}
                data={invoices}
                searchPlaceholder="Search invoices..."
                searchKey="id"
              />
            </CardBody>
          </Card>
        ) : (
          <div className="p-8 bg-surface-primary rounded-xl border border-border-secondary text-center text-slate-400">
            No active student invoices.
          </div>
        )}

        {/* Mock Payment Gateway Modal */}
        <Modal
          isOpen={!!payingInvoice}
          onClose={() => !isProcessing && setPayingInvoice(null)}
          title="Secure Billing Payment Checkout"
          size="md"
        >
          {payingInvoice && (
            <form onSubmit={handleConfirmPayment} className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-2 text-xs border border-border-secondary">
                <div className="flex justify-between">
                  <span className="text-slate-400">Invoice ID:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{payingInvoice.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Description:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Terminal Tuition & ICT Fees ({payingInvoice.term || 'Term 2'})</span>
                </div>
                <div className="flex justify-between border-t border-border-secondary pt-2 text-sm">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Amount Due:</span>
                  <span className="font-black text-primary-600">{CURRENCY_SYMBOL}{payingInvoice.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('momo')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${
                    paymentMethod === 'momo'
                      ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20 text-primary-700 dark:text-primary-300'
                      : 'border-border-secondary bg-surface-secondary text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  <Smartphone size={20} />
                  Mobile Money
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${
                    paymentMethod === 'card'
                      ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20 text-primary-700 dark:text-primary-300'
                      : 'border-border-secondary bg-surface-secondary text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  <CreditCard size={20} />
                  Bank Card
                </button>
              </div>

              {paymentMethod === 'momo' ? (
                <div className="space-y-3">
                  <Select
                    label="Mobile Money Network"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    options={[
                      { value: 'mtn', label: 'MTN Mobile Money' },
                      { value: 'telecel', label: 'Telecel Cash (Vodafone)' },
                      { value: 'airteltigo', label: 'AT Money (AirtelTigo)' }
                    ]}
                  />
                  <Input
                    label="Wallet Phone Number"
                    type="tel"
                    placeholder="e.g., 0241234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 text-[10px] text-amber-700 dark:text-amber-400 rounded-lg">
                    A mock push notification will be sent to this number. Approve the prompt to complete mock authorization.
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Input
                    label="Card Number"
                    placeholder="4000 1234 5678 9010"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Expiry Date"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      required
                    />
                    <Input
                      label="CVV"
                      type="password"
                      placeholder="123"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4 border-t border-border-secondary">
                <Button
                  variant="outline"
                  onClick={() => setPayingInvoice(null)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isProcessing}
                >
                  Authorize Payment ({CURRENCY_SYMBOL}{payingInvoice.total.toLocaleString()})
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </PageWrapper>
  );
}
