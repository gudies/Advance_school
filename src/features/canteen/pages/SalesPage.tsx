import { useState, useMemo } from 'react';
import { useCanteen } from '../hooks/useCanteen';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';
import { CURRENCY_SYMBOL } from '../../../types/common';
import { useNotificationStore } from '../../../stores/notificationStore';
import { LocalStorageAdapter } from '../../../services/adapters/localStorageAdapter';
import { Student } from '../../../types/student';
import { MenuItem } from '../../../types/canteen';
import { ShoppingCart, Plus, Minus, Trash2, Printer } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';

interface ReceiptInfo {
  id: string;
  buyerName: string;
  paymentMethod: 'cash' | 'prepaid';
  items: { id: string; name: string; price: number; quantity: number }[];
  total: number;
  date: string;
}

export default function SalesPage() {
  const { menuItems, recordSale } = useCanteen();
  const addToast = useNotificationStore((state) => state.addToast);

  const studentsList = useMemo(() => {
    return new LocalStorageAdapter<Student>('advance_students').getAll();
  }, []);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // POS Cart State
  const [cart, setCart] = useState<{ id: string; name: string; price: number; quantity: number }[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'prepaid'>('cash');
  
  // Checkout Modal/Receipt State
  const [receipt, setReceipt] = useState<ReceiptInfo | null>(null);

  const filteredMenu = useMemo(() => {
    if (activeCategory === 'all') return menuItems.filter(i => i.isAvailable);
    return menuItems.filter(i => i.category === activeCategory && i.isAvailable);
  }, [menuItems, activeCategory]);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((i) => (i.id === itemId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i))
        .filter((i) => i.quantity > 0);
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, i) => acc + i.price * i.quantity, 0);
  }, [cart]);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      addToast({ type: 'error', message: 'Cart is empty. Please add items.' });
      return;
    }

    if (paymentMethod === 'prepaid' && !selectedStudentId) {
      addToast({ type: 'error', message: 'Please select a student for prepaid checkout.' });
      return;
    }

    try {
      let buyerName = 'Walk-in Cash Customer';
      if (selectedStudentId) {
        const stud = studentsList.find((s: Student) => s.id === selectedStudentId);
        if (stud) {
          buyerName = `${stud.firstName} ${stud.lastName} (${stud.classLevel})`;
        }
      }

      // Record sales for all items
      cart.forEach((cartItem) => {
        recordSale(selectedStudentId || 'walk_in', cartItem.id, cartItem.quantity, paymentMethod);
      });

      // Prepare receipt
      setReceipt({
        id: `RCP-POS-${Math.floor(100000 + Math.random() * 900000)}`,
        buyerName,
        paymentMethod,
        items: [...cart],
        total: cartTotal,
        date: new Date().toISOString()
      });

      addToast({ type: 'success', message: 'Transaction recorded successfully!' });
      setCart([]);
      setSelectedStudentId('');
    } catch (err) {
      addToast({ type: 'error', message: err instanceof Error ? err.message : 'Checkout failed.' });
    }
  };

  const studentOptions = useMemo(() => {
    return studentsList.map((s: Student) => ({
      value: s.id,
      label: `${s.firstName} ${s.lastName} (${s.classLevel} - ID: ${s.studentId})`
    }));
  }, [studentsList]);

  const breadcrumbs = [
    { label: 'Canteen Management', path: '/canteen' },
    { label: 'POS Terminal' }
  ];

  return (
    <PageWrapper
      title="POS Terminal Sales"
      subtitle="Click items to construct a sales ticket, select a buyer, and record canteen revenues."
      breadcrumbs={breadcrumbs}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns - Menu items & Categories */}
        <div className="lg:col-span-2 space-y-6">
          {/* Categories Tab */}
          <div className="flex gap-2 flex-wrap border-b border-border-secondary pb-4">
            {['all', 'breakfast', 'lunch', 'snack', 'drink'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all capitalize ${
                  activeCategory === cat
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-white hover:bg-slate-100 border border-border-secondary text-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu POS Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredMenu.map((item) => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className="p-4 bg-white dark:bg-slate-900 hover:scale-[1.02] active:scale-[0.98] border border-border-secondary rounded-xl text-left flex flex-col justify-between transition-all group min-h-[120px] shadow-sm hover:shadow-md"
              >
                <div>
                  <Badge variant={item.category === 'lunch' ? 'success' : 'primary'} className="mb-2 capitalize">
                    {item.category}
                  </Badge>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-white group-hover:text-primary-600 transition-all">
                    {item.name}
                  </h4>
                </div>
                <div className="flex justify-between items-center w-full mt-4 border-t border-slate-50 dark:border-slate-800 pt-2">
                  <span className="text-[10px] text-slate-400">Price tag:</span>
                  <span className="font-extrabold text-primary-600">{CURRENCY_SYMBOL}{item.price.toFixed(2)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column - POS Cart Drawer */}
        <Card className="flex flex-col justify-between min-h-[500px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="text-primary-500" size={18} />
              Sales Ticket Drawer
            </CardTitle>
          </CardHeader>
          <CardBody className="flex-1 flex flex-col justify-between">
            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto space-y-3 max-h-[280px] pr-1">
              {cart.length > 0 ? (
                cart.map((cartItem) => (
                  <div key={cartItem.id} className="flex justify-between items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs">
                    <div className="flex-1">
                      <div className="font-bold text-slate-800 dark:text-white">{cartItem.name}</div>
                      <div className="text-[10px] text-slate-400">{CURRENCY_SYMBOL}{cartItem.price.toFixed(2)}</div>
                    </div>
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-border-secondary p-0.5 rounded-lg shrink-0">
                      <button
                        type="button"
                        onClick={() => updateQuantity(cartItem.id, -1)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-500"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="font-bold w-4 text-center">{cartItem.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(cartItem.id, 1)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-500"
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(cartItem.id)}
                      className="p-1 hover:bg-rose-50 text-rose-500 rounded shrink-0"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">Cart is empty. Click menu items to add them.</div>
              )}
            </div>

            {/* Checkout Form */}
            <form onSubmit={handleCheckout} className="border-t border-border-secondary pt-4 mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                    paymentMethod === 'cash'
                      ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20 text-primary-700 dark:text-primary-300'
                      : 'border-border-secondary text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  Cash Check
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('prepaid')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                    paymentMethod === 'prepaid'
                      ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20 text-primary-700 dark:text-primary-300'
                      : 'border-border-secondary text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  Student Card (Prepaid)
                </button>
              </div>

              {paymentMethod === 'prepaid' && (
                <Select
                  label="Search Student Account"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  options={studentOptions}
                  required
                />
              )}

              <div className="flex justify-between items-center text-xs pt-2 font-bold">
                <span className="text-slate-500">Ticket Total:</span>
                <span className="text-lg font-extrabold text-primary-600">{CURRENCY_SYMBOL}{cartTotal.toFixed(2)}</span>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={cart.length === 0}
              >
                Execute Checkout Ticket
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>

      {/* POS Receipt Modal */}
      <Modal
        isOpen={!!receipt}
        onClose={() => setReceipt(null)}
        title="POS Receipt Summary"
        size="sm"
      >
        {receipt && (
          <div className="space-y-4">
            <div className="text-center pb-3 border-b border-dashed border-border-secondary">
              <h3 className="font-extrabold text-slate-800 dark:text-white uppercase tracking-wider text-sm">Camied Behills International School</h3>
              <p className="text-[10px] text-slate-400 mt-1">Accra, Ghana | Canteen POS Ticket</p>
            </div>
            
            <div className="space-y-1 text-[10px] text-slate-600 dark:text-slate-400 font-mono">
              <div>Receipt ID: {receipt.id}</div>
              <div>Buyer: {receipt.buyerName}</div>
              <div>Payment: {receipt.paymentMethod.toUpperCase()}</div>
              <div>Date: {new Date(receipt.date).toLocaleString('en-GB')}</div>
            </div>

            <table className="w-full text-[10px] text-left text-slate-500 dark:text-slate-400 font-mono border-t border-b border-dashed border-border-secondary py-2">
              <thead>
                <tr className="font-bold">
                  <th className="py-1">Item</th>
                  <th className="py-1 text-center">Qty</th>
                  <th className="py-1 text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items.map((i) => (
                  <tr key={i.id}>
                    <td className="py-1">{i.name}</td>
                    <td className="py-1 text-center">{i.quantity}</td>
                    <td className="py-1 text-right">{CURRENCY_SYMBOL}{(i.price * i.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between items-center text-sm font-extrabold font-mono">
              <span>Grand Total:</span>
              <span>{CURRENCY_SYMBOL}{receipt.total.toFixed(2)}</span>
            </div>

            <div className="flex justify-center pt-4 border-t border-border-secondary">
              <Button
                variant="outline"
                leftIcon={<Printer size={14} />}
                onClick={() => {
                  window.print();
                  setReceipt(null);
                }}
              >
                Print Ticket
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PageWrapper>
  );
}
