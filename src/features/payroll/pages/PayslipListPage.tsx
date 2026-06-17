import { useMemo } from 'react';
import { usePayroll } from '../hooks/usePayroll';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Card, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { DataTable, Column } from '../../../components/data-display/DataTable';
import { Badge } from '../../../components/ui/Badge';
import { LocalStorageAdapter } from '../../../services/adapters/localStorageAdapter';
import { Staff, PayslipInfo } from '../../../types/staff';
import { CURRENCY_SYMBOL } from '../../../types/common';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';

export default function PayslipListPage() {
  const { payslips } = usePayroll();
  const navigate = useNavigate();

  const staffList = useMemo(() => {
    return new LocalStorageAdapter<Staff>('advance_staff').getAll();
  }, []);

  const getStaffDetails = (staffId: string) => {
    const member = staffList.find((s) => s.id === staffId);
    return member 
      ? { name: `${member.firstName} ${member.lastName}`, role: member.role } 
      : { name: staffId, role: 'Staff' };
  };

  const columns: Column<PayslipInfo>[] = [
    {
      header: 'Staff Member',
      accessorKey: 'staffId',
      sortable: true,
      cell: (item) => {
        const details = getStaffDetails(item.staffId);
        return (
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">{details.name}</div>
            <div className="text-xs text-slate-400 capitalize">{details.role.replace('_', ' ')}</div>
          </div>
        );
      }
    },
    {
      header: 'Month',
      accessorKey: 'month',
      sortable: true,
      cell: (item) => {
        const [year, monthNum] = item.month.split('-');
        const date = new Date(Number(year), Number(monthNum) - 1, 1);
        return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
      }
    },
    {
      header: 'Basic Salary',
      accessorKey: 'basicSalary',
      sortable: true,
      cell: (item) => `${CURRENCY_SYMBOL}${item.basicSalary.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`
    },
    {
      header: 'Net Salary',
      accessorKey: 'netSalary',
      sortable: true,
      cell: (item) => `${CURRENCY_SYMBOL}${item.netSalary.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: (item) => (
        <Badge variant={item.status === 'paid' ? 'success' : 'warning'}>
          {item.status}
        </Badge>
      )
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (item) => (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(`/payroll/payslips/${item.id}`)}
          leftIcon={<Eye size={14} />}
        >
          View Payslip
        </Button>
      )
    }
  ];

  const breadcrumbs = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Payroll' },
    { label: 'Payslips' }
  ];

  return (
    <PageWrapper 
      title="Staff Payslip Ledger" 
      subtitle="Examine generated payroll payslips, audit employee deductions, and view transaction records."
      breadcrumbs={breadcrumbs}
    >
      <Card>
        <CardBody>
          <DataTable 
            data={payslips} 
            columns={columns} 
            searchKey="staffId" 
            searchPlaceholder="Search payslips by Staff ID..." 
            pageSize={10} 
          />
        </CardBody>
      </Card>
    </PageWrapper>
  );
}
