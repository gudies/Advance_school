import { useMemo } from 'react';
import { useFinance } from '../hooks/useFinance';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import { StatCard } from '../../../components/data-display/StatCard';
import { Badge } from '../../../components/ui/Badge';
import { CURRENCY_SYMBOL } from '../../../types/common';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';

const MOCK_MONTHLY_CASHFLOW = [
  { month: 'Jan', income: 45000, expense: 32000 },
  { month: 'Feb', income: 52000, expense: 34000 },
  { month: 'Mar', income: 49000, expense: 30000 },
  { month: 'Apr', income: 63000, expense: 41000 },
  { month: 'May', income: 58000, expense: 39000 },
  { month: 'Jun', income: 71000, expense: 45000 }
];

export default function FinanceDashboardPage() {
  const { getFinancialSummary, invoices, incomeRecords } = useFinance();

  const summary = useMemo(() => getFinancialSummary(), [getFinancialSummary]);

  const recentInvoices = useMemo(() => {
    return [...invoices]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [invoices]);

  const recentIncome = useMemo(() => {
    return [...incomeRecords]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [incomeRecords]);

  const breadcrumbs = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Finance' },
    { label: 'Overview' }
  ];

  return (
    <PageWrapper 
      title="Financial Dashboard" 
      subtitle="Overview of cash flow pipelines, tuition collections, operational expenses, and profitability metrics."
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue (YTD)"
            value={`${CURRENCY_SYMBOL}${summary.totalIncome.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`}
            icon={<TrendingUp className="text-emerald-500" />}
            trend={{ value: '12%', type: 'up' }}
            description="Compared to last term"
          />
          <StatCard
            title="Approved Expenditures"
            value={`${CURRENCY_SYMBOL}${summary.totalExpense.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`}
            icon={<TrendingDown className="text-rose-500" />}
            trend={{ value: '4%', type: 'down' }}
            description="Operational costs"
          />
          <StatCard
            title="Net Profit/Loss"
            value={`${CURRENCY_SYMBOL}${summary.profitOrLoss.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`}
            icon={<DollarSign className={summary.profitOrLoss >= 0 ? 'text-emerald-500' : 'text-rose-500'} />}
            description="Net school cash balance"
            className={summary.profitOrLoss >= 0 ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-rose-500'}
          />
          <StatCard
            title="Fee Collection Rate"
            value={`${summary.feeCollectionRate}%`}
            icon={<Percent className="text-primary-500" />}
            trend={{ value: '3%', type: 'up' }}
            description="Outstanding fees collection"
          />
        </div>

        {/* Cashflow Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Cash Flow History (Income vs. Expense)</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_MONTHLY_CASHFLOW} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary-500)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--color-primary-500)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="expenseColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-danger-500)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--color-danger-500)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                  <XAxis dataKey="month" className="text-xs text-slate-500" />
                  <YAxis className="text-xs text-slate-500" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--color-surface-primary)', 
                      borderColor: 'var(--color-border-primary)',
                      borderRadius: 'var(--radius-lg)'
                    }} 
                  />
                  <Area type="monotone" dataKey="income" name="Income" stroke="var(--color-primary-500)" fillOpacity={1} fill="url(#incomeColor)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expense" name="Expense" stroke="var(--color-danger-500)" fillOpacity={1} fill="url(#expenseColor)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Bottom Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Invoices */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Student Invoices</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                      <th className="pb-3">Invoice ID</th>
                      <th className="pb-3">Due Date</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {recentInvoices.length > 0 ? (
                      recentInvoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                          <td className="py-3 font-semibold text-slate-700 dark:text-slate-300 font-mono text-xs">{inv.id}</td>
                          <td className="py-3 text-slate-500">{new Date(inv.dueDate).toLocaleDateString('en-GB')}</td>
                          <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{CURRENCY_SYMBOL}{inv.total.toLocaleString()}</td>
                          <td className="py-3 text-right">
                            <Badge variant={inv.status === 'paid' ? 'success' : inv.status === 'sent' ? 'primary' : 'warning'}>
                              {inv.status}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400">No recent invoices found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>

          {/* Recent Non-Fee Income */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Non-Fee Revenue</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                      <th className="pb-3">Source</th>
                      <th className="pb-3">Description</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {recentIncome.length > 0 ? (
                      recentIncome.map((inc) => (
                        <tr key={inc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                          <td className="py-3 font-semibold text-slate-700 dark:text-slate-300 capitalize">{inc.source}</td>
                          <td className="py-3 text-slate-500 truncate max-w-[150px]" title={inc.description}>{inc.description}</td>
                          <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{CURRENCY_SYMBOL}{inc.amount.toLocaleString()}</td>
                          <td className="py-3 text-right text-slate-400">{new Date(inc.date).toLocaleDateString('en-GB')}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400">No other income records.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
