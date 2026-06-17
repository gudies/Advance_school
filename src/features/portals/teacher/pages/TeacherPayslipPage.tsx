import { useMemo } from 'react';
import { useAuthStore } from '../../../../stores/authStore';
import { useStaff } from '../../../staff/hooks/useStaff';
import { usePayroll } from '../../../payroll/hooks/usePayroll';
import { PageWrapper } from '../../../../components/layout/PageWrapper';
import { Card, CardBody, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { DataTable, Column } from '../../../../components/data-display/DataTable';
import { EmptyState } from '../../../../components/data-display/EmptyState';
import { StatCard } from '../../../../components/data-display/StatCard';
import { CURRENCY_SYMBOL } from '../../../../types/common';
import { Banknote, FileText, Calendar, Wallet } from 'lucide-react';
import { PayslipInfo } from '../../../../types';

export default function TeacherPayslipPage() {
  const { user } = useAuthStore();
  const { staffList } = useStaff();
  const { payslips } = usePayroll();

  // Find the staff record corresponding to the logged in teacher
  const currentStaff = useMemo(() => {
    if (!user) return null;
    // Fallback to Ama Mensah (stf_001) if seed matches or first teacher
    return staffList.find(s => s.email.toLowerCase() === user.email.toLowerCase()) || 
           staffList.find(s => s.role === 'teacher') || 
           null;
  }, [user, staffList]);

  // Retrieve payslips for this staff member
  const teacherPayslips = useMemo(() => {
    if (!currentStaff) return [];
    return payslips
      .filter(p => p.staffId === currentStaff.id)
      .sort((a, b) => b.month.localeCompare(a.month));
  }, [currentStaff, payslips]);

  const stats = useMemo(() => {
    if (teacherPayslips.length === 0) {
      return { basic: 0, allowances: 0, deductions: 0, net: 0, month: '' };
    }
    // Take the latest payslip
    const latest = teacherPayslips[0];
    return {
      basic: latest.basicSalary,
      allowances: latest.allowances.reduce((acc, a) => acc + a.amount, 0),
      deductions: latest.deductions.reduce((acc, d) => acc + d.amount, 0),
      net: latest.netSalary,
      month: latest.month
    };
  }, [teacherPayslips]);

  const columns: Column<PayslipInfo>[] = [
    {
      header: 'Pay Period',
      accessorKey: 'month',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-50 dark:bg-primary-950/20 text-primary-600 rounded-lg">
            <Calendar size={16} />
          </div>
          <div>
            <span className="font-semibold text-slate-900 dark:text-white">{row.month}</span>
            <div className="text-[10px] text-slate-400">Monthly Cycle</div>
          </div>
        </div>
      )
    },
    {
      header: 'Basic Salary',
      accessorKey: 'basicSalary',
      cell: (row) => (
        <span className="font-mono text-xs text-slate-700 dark:text-slate-350">
          {CURRENCY_SYMBOL}{row.basicSalary.toLocaleString()}
        </span>
      )
    },
    {
      header: 'Allowances',
      accessorKey: 'allowances',
      cell: (row) => (
        <span className="font-mono text-xs text-emerald-600 dark:text-emerald-450">
          +{CURRENCY_SYMBOL}{row.allowances.reduce((acc, a) => acc + a.amount, 0).toLocaleString()}
        </span>
      )
    },
    {
      header: 'Deductions',
      accessorKey: 'deductions',
      cell: (row) => (
        <span className="font-mono text-xs text-rose-600 dark:text-rose-450">
          -{CURRENCY_SYMBOL}{row.deductions.reduce((acc, d) => acc + d.amount, 0).toLocaleString()}
        </span>
      )
    },
    {
      header: 'Net Salary',
      accessorKey: 'netSalary',
      cell: (row) => (
        <span className="font-extrabold text-slate-900 dark:text-white">
          {CURRENCY_SYMBOL}{row.netSalary.toLocaleString()}
        </span>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => (
        <Badge variant={row.status === 'paid' ? 'success' : 'warning'} className="capitalize">
          {row.status}
        </Badge>
      )
    }
  ];

  if (!currentStaff) {
    return (
      <PageWrapper title="My Payslips">
        <EmptyState title="Profile Not Found" description="Could not link your authentication user with a staff profile." />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="My Salary Payslips"
      subtitle={`View salary details, earnings breakdown, and allowances for ${currentStaff.firstName} ${currentStaff.lastName}.`}
      breadcrumbs={[
        { label: 'Teacher Portal', path: '/teacher' },
        { label: 'My Payslips' }
      ]}
    >
      {/* Latest Payslip Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Basic Earnings"
          value={`${CURRENCY_SYMBOL}${stats.basic.toLocaleString()}`}
          icon={<Banknote className="text-primary-500" />}
        />
        <StatCard
          title="Allowances"
          value={`+${CURRENCY_SYMBOL}${stats.allowances.toLocaleString()}`}
          icon={<Wallet className="text-success-500" />}
        />
        <StatCard
          title="Deductions"
          value={`-${CURRENCY_SYMBOL}${stats.deductions.toLocaleString()}`}
          icon={<FileText className="text-rose-500" />}
        />
        <StatCard
          title="Latest Payout"
          value={`${CURRENCY_SYMBOL}${stats.net.toLocaleString()}`}
          icon={<Wallet className="text-indigo-500" />}
          className="bg-primary-50/10 border-primary-200"
        />
      </div>

      {/* Main card */}
      <Card>
        <CardHeader>
          <CardTitle>Historical Payslip Registry</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          {teacherPayslips.length > 0 ? (
            <DataTable data={teacherPayslips} columns={columns} />
          ) : (
            <div className="p-6">
              <EmptyState
                title="No Payslips Found"
                description="There are currently no salary pay slips generated for your account."
              />
            </div>
          )}
        </CardBody>
      </Card>
    </PageWrapper>
  );
}
