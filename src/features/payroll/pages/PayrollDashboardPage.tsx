import React, { useState, useMemo } from 'react';
import { usePayroll } from '../hooks/usePayroll';
import { useAuthStore } from '../../../stores/authStore';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import { StatCard } from '../../../components/data-display/StatCard';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';
import { CURRENCY_SYMBOL } from '../../../types/common';
import { useNotificationStore } from '../../../stores/notificationStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Banknote, Users, FileSpreadsheet, RefreshCw } from 'lucide-react';

const MONTHS_OPTIONS = [
  { value: '2026-01', label: 'January 2026' },
  { value: '2026-02', label: 'February 2026' },
  { value: '2026-03', label: 'March 2026' },
  { value: '2026-04', label: 'April 2026' },
  { value: '2026-05', label: 'May 2026' },
  { value: '2026-06', label: 'June 2026' }
];

export default function PayrollDashboardPage() {
  const { payslips, runMonthlyPayroll, getPayrollSummary } = usePayroll();
  const { user } = useAuthStore();
  const addToast = useNotificationStore((state) => state.addToast);

  const [selectedMonth, setSelectedMonth] = useState('2026-06');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payrollMonth, setPayrollMonth] = useState('2026-06');

  const monthlySummary = useMemo(() => {
    return getPayrollSummary(selectedMonth);
  }, [getPayrollSummary, selectedMonth]);

  const recentPayslips = useMemo(() => {
    return [...payslips]
      .filter((p) => p.month === selectedMonth)
      .slice(0, 5);
  }, [payslips, selectedMonth]);

  const chartData = useMemo(() => {
    return MONTHS_OPTIONS.map((m) => {
      const sum = getPayrollSummary(m.value);
      return {
        month: m.label.split(' ')[0],
        cost: sum.totalNet
      };
    });
  }, [getPayrollSummary]);

  const handleRunPayroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const count = runMonthlyPayroll(payrollMonth, user.id);
      if (count > 0) {
        addToast({ type: 'success', message: `Payroll ran successfully! Generated ${count} employees payslips.` });
      } else {
        addToast({ type: 'warning', message: 'No new payslips generated. Payroll already ran for this month.' });
      }
      setIsModalOpen(false);
    } catch (err) {
      addToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to run payroll.' });
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Payroll' },
    { label: 'Overview' }
  ];

  return (
    <PageWrapper 
      title="Institutional Payroll Dashboard" 
      subtitle="Examine payroll disbursements, process employee salary slips, and monitor salary expenditures."
      breadcrumbs={breadcrumbs}
      action={
        <Button variant="primary" onClick={() => setIsModalOpen(true)} leftIcon={<RefreshCw size={16} />}>
          Run Payroll
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Month selector */}
        <div className="flex justify-end">
          <div className="w-48">
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              options={MONTHS_OPTIONS}
            />
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Net Salary Payout"
            value={`${CURRENCY_SYMBOL}${monthlySummary.totalNet.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`}
            icon={<Banknote className="text-emerald-500" />}
            description={`Salary pool for ${selectedMonth}`}
          />
          <StatCard
            title="Staff Paid Count"
            value={monthlySummary.count}
            icon={<Users className="text-primary-500" />}
            description="Active payroll slips"
          />
          <StatCard
            title="Deductions Collected"
            value={`${CURRENCY_SYMBOL}${monthlySummary.totalDeductions.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`}
            icon={<FileSpreadsheet className="text-slate-500" />}
            description="Taxes & SSNIT deductions"
          />
        </div>

        {/* Chart vs Recent Payslips */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cost Trend Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Payroll Cost Trend</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                    <XAxis dataKey="month" className="text-xs text-slate-500" />
                    <YAxis className="text-xs text-slate-500" />
                    <Tooltip 
                      formatter={(value) => `${CURRENCY_SYMBOL}${value ? Number(value).toLocaleString() : '0'}`}
                      contentStyle={{ 
                        backgroundColor: 'var(--color-surface-primary)', 
                        borderColor: 'var(--color-border-primary)',
                        borderRadius: 'var(--radius-lg)'
                      }} 
                    />
                    <Bar dataKey="cost" name="Salary Cost" fill="var(--color-primary-500)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>

          {/* Recent Payslips */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Payslips</CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              {recentPayslips.length > 0 ? (
                recentPayslips.map((pay) => (
                  <div key={pay.id} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-xl">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Employee ID: {pay.staffId}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Net Pay: {CURRENCY_SYMBOL}{pay.netSalary.toLocaleString()}</p>
                    </div>
                    <Badge variant={pay.status === 'paid' ? 'success' : 'warning'}>{pay.status}</Badge>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-slate-400 text-sm">No slips logged for this month.</div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Run Payroll Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Run Monthly Payroll"
        size="md"
      >
        <form onSubmit={handleRunPayroll} className="space-y-4">
          <p className="text-sm text-slate-500">
            Running payroll will query all active staff members, compute their allowances and standard Ghanaian tax deductions (SSNIT/Income Tax), and generate payslip logs.
          </p>
          <Select
            label="Payroll Month *"
            value={payrollMonth}
            onChange={(e) => setPayrollMonth(e.target.value)}
            options={MONTHS_OPTIONS}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Generate Payroll Slips
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
