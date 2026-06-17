import { useState, useMemo } from 'react';
import { useFinance } from '../../finance/hooks/useFinance';
import { useAdmin } from '../../admin/hooks/useAdmin';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Card, CardBody } from '../../../components/ui/Card';
import { Tabs } from '../../../components/ui/Tabs';
import { DataTable, Column } from '../../../components/data-display/DataTable';
import { Badge } from '../../../components/ui/Badge';
import { CURRENCY_SYMBOL } from '../../../types/common';
import { DollarSign, Wallet, ShieldAlert } from 'lucide-react';

export default function FinancialReportsPage() {
  const { getFinancialSummary, invoices, incomeRecords } = useFinance();
  const { expenses, logs } = useAdmin();

  const [activeTab, setActiveTab] = useState('pl');

  const summary = useMemo(() => getFinancialSummary(), [getFinancialSummary]);

  // Compile Profit & Loss line items
  const plData = useMemo(() => {
    const list: { type: 'income' | 'expense'; category: string; description: string; amount: number; date: string }[] = [];

    // Add income records
    incomeRecords.forEach((i) => {
      list.push({
        type: 'income',
        category: i.source,
        description: i.description,
        amount: i.amount,
        date: i.date
      });
    });

    // Add approved expenses
    expenses
      .filter((e) => e.status === 'approved')
      .forEach((e) => {
        list.push({
          type: 'expense',
          category: e.category,
          description: e.description,
          amount: e.amount,
          date: e.date
        });
      });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [incomeRecords, expenses]);

interface PLReportRecord {
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string;
}

  const plColumns: Column<PLReportRecord>[] = [
    {
      header: 'Date',
      accessorKey: 'date',
      sortable: true,
      cell: (item) => new Date(item.date).toLocaleDateString('en-GB')
    },
    {
      header: 'Entry Type',
      accessorKey: 'type',
      sortable: true,
      cell: (item) => (
        <Badge variant={item.type === 'income' ? 'success' : 'danger'} className="capitalize">
          {item.type}
        </Badge>
      )
    },
    {
      header: 'Category / Source',
      accessorKey: 'category',
      sortable: true,
      cell: (item) => <span className="capitalize">{item.category.replace('_', ' ')}</span>
    },
    {
      header: 'Description',
      accessorKey: 'description'
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      sortable: true,
      cell: (item) => (
        <span className={item.type === 'income' ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
          {item.type === 'income' ? '+' : '-'}{CURRENCY_SYMBOL}{item.amount.toLocaleString('en-GH', { minimumFractionDigits: 2 })}
        </span>
      )
    }
  ];

  // Compile Fee Payments
  const feePaymentData = useMemo(() => {
    const list: { id: string; invoiceId: string; amount: number; date: string; status: string }[] = [];
    invoices.forEach((inv) => {
      list.push({
        id: inv.id,
        invoiceId: inv.id,
        amount: inv.total,
        date: inv.date,
        status: inv.status
      });
    });
    return list;
  }, [invoices]);

interface FeePaymentReportRecord {
  id: string;
  invoiceId: string;
  amount: number;
  date: string;
  status: string;
}

  const feeColumns: Column<FeePaymentReportRecord>[] = [
    {
      header: 'Invoice ID',
      accessorKey: 'invoiceId',
      sortable: true,
      cell: (item) => <span className="font-mono text-xs">{item.invoiceId}</span>
    },
    {
      header: 'Billed Value',
      accessorKey: 'amount',
      sortable: true,
      cell: (item) => `${CURRENCY_SYMBOL}${item.amount.toLocaleString()}`
    },
    {
      header: 'Date Issued',
      accessorKey: 'date',
      cell: (item) => new Date(item.date).toLocaleDateString('en-GB')
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: (item) => (
        <Badge variant={item.status === 'paid' ? 'success' : item.status === 'sent' ? 'primary' : 'warning'}>
          {item.status}
        </Badge>
      )
    }
  ];

  const tabs = [
    { id: 'pl', label: 'Profit & Loss Statement', icon: <DollarSign size={16} /> },
    { id: 'fees', label: 'Fee Payments Summary', icon: <Wallet size={16} /> },
    { id: 'audit', label: 'Audit Logs Ledger', icon: <ShieldAlert size={16} /> }
  ];

  const breadcrumbs = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Reports' },
    { label: 'Financial Reports' }
  ];

  return (
    <PageWrapper 
      title="Institutional Financial Statements" 
      subtitle="Examine profit and loss accounts, tuition ledger collection, and administrative security logs."
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="line" />

        {activeTab === 'pl' && (
          <div className="space-y-6 animate-fade-in">
            {/* Overview Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 bg-slate-50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div>
                <span className="text-slate-400 text-xs uppercase font-semibold">Total Revenue (YTD)</span>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white font-heading mt-1">
                  {CURRENCY_SYMBOL}{summary.totalIncome.toLocaleString()}
                </h3>
              </div>
              <div>
                <span className="text-slate-400 text-xs uppercase font-semibold">Approved Expenditures</span>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white font-heading mt-1">
                  {CURRENCY_SYMBOL}{summary.totalExpense.toLocaleString()}
                </h3>
              </div>
              <div>
                <span className="text-slate-400 text-xs uppercase font-semibold">Net Statement Balance</span>
                <h3 className={`text-2xl font-extrabold font-heading mt-1 ${summary.profitOrLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {summary.profitOrLoss >= 0 ? '+' : ''}{CURRENCY_SYMBOL}{summary.profitOrLoss.toLocaleString()}
                </h3>
              </div>
            </div>

            <Card>
              <CardBody>
                <DataTable 
                  data={plData} 
                  columns={plColumns} 
                  searchKey="description" 
                  searchPlaceholder="Search P&L entries..." 
                  pageSize={15} 
                />
              </CardBody>
            </Card>
          </div>
        )}

        {activeTab === 'fees' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-slate-50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div>
                <span className="text-slate-400 text-xs uppercase font-semibold">Collection Progress Rate</span>
                <h3 className="text-3xl font-extrabold text-primary-600 font-heading mt-1">
                  {summary.feeCollectionRate}%
                </h3>
              </div>
              <div>
                <span className="text-slate-400 text-xs uppercase font-semibold">Active Billing Cycles</span>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white font-heading mt-1">
                  {summary.period}
                </h3>
              </div>
            </div>

            <Card>
              <CardBody>
                <DataTable 
                  data={feePaymentData} 
                  columns={feeColumns} 
                  searchKey="invoiceId" 
                  searchPlaceholder="Search billing sheets..." 
                  pageSize={10} 
                />
              </CardBody>
            </Card>
          </div>
        )}

        {activeTab === 'audit' && (
          <Card className="animate-fade-in">
            <CardBody>
              <DataTable 
                data={logs} 
                columns={[
                  {
                    header: 'Timestamp',
                    accessorKey: 'timestamp',
                    cell: (item) => new Date(item.timestamp).toLocaleString('en-GB')
                  },
                  {
                    header: 'Administrator',
                    accessorKey: 'userName',
                    cell: (item) => <span className="font-semibold">{item.userName}</span>
                  },
                  {
                    header: 'Audit Action',
                    accessorKey: 'action',
                    cell: (item) => (
                      <Badge variant="neutral" className="font-mono text-[9px] uppercase">
                        {item.action}
                      </Badge>
                    )
                  },
                  {
                    header: 'Details Description',
                    accessorKey: 'details'
                  }
                ]} 
                searchKey="userName" 
                searchPlaceholder="Search audit trails..." 
                pageSize={15} 
              />
            </CardBody>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
}
