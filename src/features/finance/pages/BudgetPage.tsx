import { useState, useMemo } from 'react';
import { useFinance } from '../hooks/useFinance';
import { useAuthStore } from '../../../stores/authStore';
import { useAdmin } from '../../admin/hooks/useAdmin';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Budget, ExpenseCategory } from '../../../types/finance';
import { CURRENCY_SYMBOL } from '../../../types/common';
import { useNotificationStore } from '../../../stores/notificationStore';
import { Plus, CheckCircle } from 'lucide-react';

const CATEGORIES: ExpenseCategory[] = [
  'salary',
  'utilities',
  'maintenance',
  'supplies',
  'equipment',
  'events',
  'transportation',
  'other'
];

export default function BudgetPage() {
  const { budgets, saveBudget } = useFinance();
  const { expenses } = useAdmin(); // approved expenses
  const { user } = useAuthStore();
  const addToast = useNotificationStore((state) => state.addToast);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [year, setYear] = useState('2025/2026');
  const [allocations, setAllocations] = useState<Record<ExpenseCategory, number>>({
    salary: 150000,
    utilities: 12000,
    maintenance: 18000,
    supplies: 25000,
    equipment: 35000,
    events: 10000,
    transportation: 15000,
    other: 8000
  });

  const activeBudget = useMemo(() => {
    const active = budgets.find((b) => b.year === year);
    if (active) return active;
    
    // Default fallback
    return {
      id: 'default_b',
      year,
      allocations: CATEGORIES.map((c) => ({ category: c, amount: allocations[c] })),
      totalBudget: CATEGORIES.reduce((acc, c) => acc + allocations[c], 0)
    } as Budget;
  }, [budgets, year, allocations]);

  // Calculate actual spending per category
  const actuals = useMemo(() => {
    const summary: Record<ExpenseCategory, number> = {
      salary: 0,
      utilities: 0,
      maintenance: 0,
      supplies: 0,
      equipment: 0,
      events: 0,
      transportation: 0,
      other: 0
    };

    expenses
      .filter((e) => e.status === 'approved' && e.date.includes(year.split('/')[0]))
      .forEach((exp) => {
        if (summary[exp.category] !== undefined) {
          summary[exp.category] += exp.amount;
        }
      });

    return summary;
  }, [expenses, year]);

  const handleOpenModal = () => {
    const initial = { ...allocations };
    activeBudget.allocations.forEach((a) => {
      initial[a.category] = a.amount;
    });
    setAllocations(initial);
    setIsModalOpen(true);
  };

  const handleAllocationChange = (category: ExpenseCategory, val: string) => {
    setAllocations((prev) => ({
      ...prev,
      [category]: Number(val)
    }));
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const list = CATEGORIES.map((c) => ({
      category: c,
      amount: allocations[c]
    }));
    const total = list.reduce((acc, a) => acc + a.amount, 0);

    const budget: Budget = {
      id: activeBudget.id === 'default_b' ? `bud_${Math.random().toString(36).substring(7)}` : activeBudget.id,
      year,
      allocations: list,
      totalBudget: total
    };

    saveBudget(budget);
    addToast({ type: 'success', message: `Budget allocations for academic year ${year} saved successfully.` });
    setIsModalOpen(false);
  };

  const breadcrumbs = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Finance' },
    { label: 'Budgets' }
  ];

  return (
    <PageWrapper 
      title="Budget Allocations & Monitoring" 
      subtitle="Allocate funds to institutional operational areas and track real-time category spending."
      breadcrumbs={breadcrumbs}
      action={
        <Button variant="primary" onClick={handleOpenModal} leftIcon={<Plus size={16} />}>
          Configure Budget
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Budget overview card */}
        <Card className="border-l-4 border-l-primary-500">
          <CardBody className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Budget Year</span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-heading mt-1">
                {activeBudget.year} Academic Cycle
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Allocated Budget</span>
              <p className="text-3xl font-extrabold text-primary-600 dark:text-primary-400 font-heading mt-1">
                {CURRENCY_SYMBOL}{activeBudget.totalBudget.toLocaleString('en-GH', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Progress monitor layout */}
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Category-wise Spend Tracking</CardTitle>
            </CardHeader>
            <CardBody className="space-y-6">
              {activeBudget.allocations.map((alloc) => {
                const actual = actuals[alloc.category] || 0;
                const percent = alloc.amount > 0 ? Math.round((actual / alloc.amount) * 100) : 0;
                const isOverBudget = actual > alloc.amount;

                return (
                  <div key={alloc.category} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                          {alloc.category}
                        </span>
                        <span className="text-xs text-slate-400 font-light ml-2">
                          Spent: {CURRENCY_SYMBOL}{actual.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {percent}%
                        </span>
                        <span className="text-xs text-slate-400 font-light ml-2">
                          Limit: {CURRENCY_SYMBOL}{alloc.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {/* Progress Bar Container */}
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOverBudget 
                            ? 'bg-rose-500' 
                            : percent > 85 
                              ? 'bg-amber-500' 
                              : 'bg-primary-500'
                        }`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Configure Budget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Configure allocations for ${year}`}
        size="lg"
      >
        <form onSubmit={handleSaveBudget} className="space-y-6">
          <Input
            label="Academic Cycle *"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto p-2 border border-slate-100 dark:border-slate-800 rounded-xl">
            {CATEGORIES.map((cat) => (
              <Input
                key={cat}
                label={`${cat.charAt(0).toUpperCase() + cat.slice(1)} allocation (GH₵) *`}
                type="number"
                value={allocations[cat]}
                onChange={(e) => handleAllocationChange(cat, e.target.value)}
                required
              />
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" leftIcon={<CheckCircle size={16} />}>
              Save Budget
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
