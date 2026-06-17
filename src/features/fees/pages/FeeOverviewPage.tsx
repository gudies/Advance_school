import { useMemo } from 'react';
import { useFees } from '../hooks/useFees';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { StatCard } from '../../../components/data-display/StatCard';
import { DataTable, Column } from '../../../components/data-display/DataTable';
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { CURRENCY_SYMBOL, Payment } from '../../../types';
import { Wallet, TrendingUp, AlertCircle, Users } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

export default function FeeOverviewPage() {
  const { payments, getOutstandingBalances, getTotalCollected } = useFees();

  const totalCollected = getTotalCollected();
  const outstandingRecords = getOutstandingBalances();
  const totalOutstanding = outstandingRecords.reduce((sum, r) => sum + r.balance, 0);
  const studentsWithBalance = outstandingRecords.length;

  const totalExpected = totalCollected + totalOutstanding;
  const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  const chartData = [
    { name: 'Collected', value: totalCollected, color: 'var(--color-success-500)' },
    { name: 'Outstanding', value: totalOutstanding, color: 'var(--color-danger-500)' }
  ];

  const recentPayments = useMemo(() => {
    return [...payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
  }, [payments]);

  const paymentCols: Column<Payment>[] = [
    { header: 'Receipt #', accessorKey: 'receiptNumber', cell: (item) => <span className="font-medium">{item.receiptNumber}</span> },
    { header: 'Student', accessorKey: 'studentName' },
    { header: 'Class', accessorKey: 'classLevel' },
    { header: 'Amount', accessorKey: 'amountPaid', cell: (item) => <span className="font-bold">{CURRENCY_SYMBOL}{item.amountPaid.toLocaleString()}</span> },
    { header: 'Method', accessorKey: 'method', cell: (item) => <span className="capitalize">{item.method.replace('_', ' ')}</span> },
    { header: 'Date', accessorKey: 'date', cell: (item) => new Date(item.date).toLocaleDateString() },
    { 
      header: 'Status', 
      accessorKey: 'status',
      cell: (item) => {
        const variant = item.status === 'paid' ? 'success' : item.status === 'partial' ? 'warning' : item.status === 'pending' ? 'neutral' : 'danger';
        return <Badge variant={variant} className="capitalize">{item.status}</Badge>;
      }
    }
  ];

  return (
    <PageWrapper
      title="Fee Management Dashboard"
      subtitle="Overview of fee collections and outstanding balances."
      breadcrumbs={[
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Fees', path: '/fees' },
        { label: 'Overview' },
      ]}
    >
      <div className="space-y-6">
        <div className="grid grid-4 gap-4">
          <StatCard 
            title="Total Collected" 
            value={`${CURRENCY_SYMBOL}${totalCollected.toLocaleString()}`} 
            icon={<Wallet size={20} />} 
            className="border-l-4 border-success-500"
          />
          <StatCard 
            title="Total Outstanding" 
            value={`${CURRENCY_SYMBOL}${totalOutstanding.toLocaleString()}`} 
            icon={<AlertCircle size={20} />} 
            className="border-l-4 border-danger-500"
          />
          <StatCard 
            title="Collection Rate" 
            value={`${collectionRate}%`} 
            icon={<TrendingUp size={20} />} 
            className="border-l-4 border-primary-500"
          />
          <StatCard 
            title="Students Owing" 
            value={studentsWithBalance} 
            icon={<Users size={20} />} 
            className="border-l-4 border-warning-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Collection Status</CardTitle>
            </CardHeader>
            <CardBody className="h-80 flex-center">
              {totalExpected > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value) => `${CURRENCY_SYMBOL}${value ? Number(value).toLocaleString() : '0'}`}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-secondary text-sm">No data available</p>
              )}
            </CardBody>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
            </CardHeader>
            <CardBody className="p-0">
              <DataTable data={recentPayments} columns={paymentCols} />
            </CardBody>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
