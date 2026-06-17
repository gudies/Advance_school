import { useMemo } from 'react';
import { usePayroll } from '../hooks/usePayroll';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { DataTable, Column } from '../../../components/data-display/DataTable';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/data-display/EmptyState';
import { StatCard } from '../../../components/data-display/StatCard';
import { CURRENCY_SYMBOL } from '../../../types/common';
import { Calendar, Users, Wallet, CreditCard, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MONTH_NAMES: Record<string, string> = {
  '2026-01': 'January 2026',
  '2026-02': 'February 2026',
  '2026-03': 'March 2026',
  '2026-04': 'April 2026',
  '2026-05': 'May 2026',
  '2026-06': 'June 2026',
};

interface HistoryRecord {
  monthCode: string;
  monthName: string;
  totalEmployees: number;
  totalBasic: number;
  totalAllowances: number;
  totalDeductions: number;
  totalNet: number;
  status: string;
}

export default function PayrollHistoryPage() {
  const { payslips } = usePayroll();
  const navigate = useNavigate();

  const historyData = useMemo(() => {
    // Group payslips by month
    const groups: Record<string, typeof payslips> = {};
    payslips.forEach(p => {
      if (!groups[p.month]) {
        groups[p.month] = [];
      }
      groups[p.month].push(p);
    });

    const records: HistoryRecord[] = Object.entries(groups).map(([month, slips]) => {
      const totalBasic = slips.reduce((sum, s) => sum + s.basicSalary, 0);
      const totalAllowances = slips.reduce((sum, s) => sum + s.allowances.reduce((acc, a) => acc + a.amount, 0), 0);
      const totalDeductions = slips.reduce((sum, s) => sum + s.deductions.reduce((acc, d) => acc + d.amount, 0), 0);
      const totalNet = slips.reduce((sum, s) => sum + s.netSalary, 0);

      return {
        monthCode: month,
        monthName: MONTH_NAMES[month] || month,
        totalEmployees: slips.length,
        totalBasic,
        totalAllowances,
        totalDeductions,
        totalNet,
        status: 'Processed & Disbursed'
      };
    });

    // Sort descending by month code
    return records.sort((a, b) => b.monthCode.localeCompare(a.monthCode));
  }, [payslips]);

  const stats = useMemo(() => {
    const totalDisbursed = historyData.reduce((sum, r) => sum + r.totalNet, 0);
    const totalTransactions = historyData.reduce((sum, r) => sum + r.totalEmployees, 0);
    const uniqueMonths = historyData.length;
    return {
      totalDisbursed,
      totalTransactions,
      uniqueMonths,
      avgMonthCost: uniqueMonths > 0 ? (totalDisbursed / uniqueMonths) : 0
    };
  }, [historyData]);

  const columns: Column<HistoryRecord>[] = [
    {
      header: 'Pay Cycle Month',
      accessorKey: 'monthName',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-50 dark:bg-primary-950/20 text-primary-600 rounded-lg">
            <Calendar size={16} />
          </div>
          <div>
            <span className="font-semibold text-slate-900 dark:text-white">{row.monthName}</span>
            <div className="text-[10px] text-slate-400 font-mono">{row.monthCode}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Employees Paid',
      accessorKey: 'totalEmployees',
      cell: (row) => (
        <span className="font-medium text-slate-800 dark:text-slate-200">{row.totalEmployees} Staff</span>
      )
    },
    {
      header: 'Salary Subtotal',
      accessorKey: 'totalBasic',
      cell: (row) => (
        <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
          {CURRENCY_SYMBOL}{row.totalBasic.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      )
    },
    {
      header: 'Total Net Payout',
      accessorKey: 'totalNet',
      cell: (row) => (
        <span className="font-extrabold text-emerald-600 dark:text-emerald-450">
          {CURRENCY_SYMBOL}{row.totalNet.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      )
    },
    {
      header: 'Disbursement Status',
      accessorKey: 'status',
      cell: (row) => (
        <Badge variant="success" className="capitalize">
          {row.status}
        </Badge>
      )
    },
    {
      header: 'Action',
      accessorKey: 'monthCode',
      cell: (row) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-950/30 flex items-center gap-1"
          onClick={() => navigate(`/payroll/payslips?month=${row.monthCode}`)}
        >
          View Slips <ChevronRight size={14} />
        </Button>
      )
    }
  ];

  return (
    <PageWrapper
      title="Payroll Disbursement History"
      subtitle="Track monthly school payroll disbursements, total net payouts, and employee counts."
      breadcrumbs={[
        { label: 'Payroll Management', path: '/payroll' },
        { label: 'History' }
      ]}
    >
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Paid (All-Time)"
          value={`${CURRENCY_SYMBOL}${stats.totalDisbursed.toLocaleString()}`}
          icon={<Wallet className="text-success-500" />}
        />
        <StatCard
          title="Payslips Generated"
          value={stats.totalTransactions}
          icon={<Users className="text-primary-500" />}
        />
        <StatCard
          title="Avg. Monthly Payout"
          value={`${CURRENCY_SYMBOL}${stats.avgMonthCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          icon={<CreditCard className="text-indigo-500" />}
        />
        <StatCard
          title="Completed Pay Cycles"
          value={stats.uniqueMonths}
          icon={<Calendar className="text-warning-500" />}
        />
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>Historical Pay Runs</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          {historyData.length > 0 ? (
            <DataTable data={historyData} columns={columns} />
          ) : (
            <div className="p-6">
              <EmptyState
                title="No Payroll Runs"
                description="No payroll historical run records found in the system database."
              />
            </div>
          )}
        </CardBody>
      </Card>
    </PageWrapper>
  );
}
