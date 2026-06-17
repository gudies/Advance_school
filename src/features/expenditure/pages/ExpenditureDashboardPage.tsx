import { useMemo } from 'react';
import { useExpenditure } from '../hooks/useExpenditure';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import { StatCard } from '../../../components/data-display/StatCard';
import { Badge } from '../../../components/ui/Badge';
import { CURRENCY_SYMBOL } from '../../../types/common';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingDown, DollarSign, ListTodo } from 'lucide-react';

const COLORS = [
  '#6366f1', // primary/indigo
  '#10b981', // success/emerald
  '#f59e0b', // warning/amber
  '#ef4444', // danger/rose
  '#0ea5e9', // sky/info
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#64748b'  // slate/neutral
];

export default function ExpenditureDashboardPage() {
  const { expenses, procurements } = useExpenditure();

  const approvedExpenses = useMemo(() => {
    return expenses.filter((e) => e.status === 'approved');
  }, [expenses]);

  const totalSpent = useMemo(() => {
    return approvedExpenses.reduce((acc, e) => acc + e.amount, 0);
  }, [approvedExpenses]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    approvedExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });

    return Object.keys(map).map((cat) => ({
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      value: map[cat]
    }));
  }, [approvedExpenses]);

  const pendingProcurementCount = useMemo(() => {
    return procurements.filter((p) => p.status === 'pending').length;
  }, [procurements]);

  const breadcrumbs = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Expenditure' },
    { label: 'Overview' }
  ];

  return (
    <PageWrapper 
      title="Expenditure Dashboard" 
      subtitle="Monitor institutional spending, review procurement logs, and inspect category-level cash allocations."
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Billed Expenses"
            value={`${CURRENCY_SYMBOL}${totalSpent.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`}
            icon={<TrendingDown className="text-rose-500" />}
            description="Approved disbursements YTD"
          />
          <StatCard
            title="Pending Procurement Orders"
            value={pendingProcurementCount}
            icon={<ListTodo className="text-amber-500" />}
            description="Items awaiting approval"
          />
          <StatCard
            title="Avg Expense Transaction"
            value={
              approvedExpenses.length > 0
                ? `${CURRENCY_SYMBOL}${Math.round(totalSpent / approvedExpenses.length).toLocaleString()}`
                : `${CURRENCY_SYMBOL}0.00`
            }
            icon={<DollarSign className="text-slate-500" />}
            description={`Across ${approvedExpenses.length} approved slips`}
          />
        </div>

        {/* Charts & Timelines */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pie Chart Category Breakdown */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Spending Breakdown by Category</CardTitle>
            </CardHeader>
            <CardBody className="flex flex-col md:flex-row items-center justify-between gap-6 py-8">
              <div className="h-64 w-full max-w-[320px]">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => `${CURRENCY_SYMBOL}${value ? Number(value).toLocaleString() : '0'}`}
                        contentStyle={{ 
                          backgroundColor: 'var(--color-surface-primary)', 
                          borderColor: 'var(--color-border-primary)',
                          borderRadius: 'var(--radius-lg)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full flex-center text-slate-400">No data compiled.</div>
                )}
              </div>
              
              {/* Custom Legend */}
              <div className="flex-1 space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category Allocations</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categoryData.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm">
                      <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                      <span className="text-slate-400 font-light ml-auto">
                        {Math.round((item.value / totalSpent) * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Quick Logs */}
          <Card>
            <CardHeader>
              <CardTitle>Procurement Queue</CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              {procurements.slice(0, 4).length > 0 ? (
                procurements.slice(0, 4).map((proc) => (
                  <div key={proc.id} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-xl">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{proc.itemName}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Qty: {proc.qty}</p>
                    </div>
                    <Badge variant={proc.status === 'delivered' ? 'success' : proc.status === 'pending' ? 'warning' : 'primary'}>
                      {proc.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-slate-400 text-sm">No procurement orders logged.</div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
