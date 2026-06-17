import { useState, useMemo } from 'react';
import { useFees } from '../hooks/useFees';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Card, CardBody } from '../../../components/ui/Card';
import { DataTable, Column } from '../../../components/data-display/DataTable';
import { StatCard } from '../../../components/data-display/StatCard';
import { Badge } from '../../../components/ui/Badge';
import { Select } from '../../../components/ui/Select';
import { CLASS_LEVELS, CURRENCY_SYMBOL } from '../../../types';
import { AlertCircle, Users } from 'lucide-react';

export default function OutstandingPage() {
  const { getOutstandingBalances } = useFees();
  const [classFilter, setClassFilter] = useState('');

  const allOutstanding = getOutstandingBalances();
  
  const filteredOutstanding = useMemo(() => {
    if (!classFilter) return allOutstanding;
    return allOutstanding.filter(record => record.student.classLevel === classFilter);
  }, [allOutstanding, classFilter]);

  const totalOutstanding = filteredOutstanding.reduce((sum, r) => sum + r.balance, 0);

  type OutstandingRecord = ReturnType<typeof getOutstandingBalances>[0];

  const columns: Column<OutstandingRecord>[] = [
    { 
      header: 'Student', 
      accessorKey: 'student', 
      cell: (item) => (
        <div>
          <p className="font-semibold">{item.student.firstName} {item.student.lastName}</p>
          <p className="text-[10px] text-tertiary">{item.student.studentId}</p>
        </div>
      ) 
    },
    { 
      header: 'Class', 
      accessorKey: 'student', 
      cell: (item) => item.student.classLevel 
    },
    { 
      header: 'Total Due', 
      accessorKey: 'totalDue', 
      cell: (item) => <span className="text-secondary">{CURRENCY_SYMBOL}{item.totalDue.toLocaleString()}</span> 
    },
    { 
      header: 'Amount Paid', 
      accessorKey: 'totalPaid', 
      cell: (item) => <span className="text-success-600">{CURRENCY_SYMBOL}{item.totalPaid.toLocaleString()}</span> 
    },
    { 
      header: 'Balance', 
      accessorKey: 'balance', 
      cell: (item) => <span className="font-bold text-danger-600">{CURRENCY_SYMBOL}{item.balance.toLocaleString()}</span> 
    },
    { 
      header: 'Status', 
      accessorKey: 'balance',
      cell: (item) => {
        const ratio = item.totalPaid / item.totalDue;
        const variant = ratio === 0 ? 'danger' : 'warning';
        return <Badge variant={variant}>{ratio === 0 ? 'Unpaid' : 'Partial'}</Badge>;
      }
    }
  ];

  return (
    <PageWrapper
      title="Outstanding Balances"
      subtitle="Track students with pending fee payments."
      breadcrumbs={[
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Fees', path: '/fees' },
        { label: 'Outstanding' },
      ]}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard 
            title="Total Outstanding" 
            value={`${CURRENCY_SYMBOL}${totalOutstanding.toLocaleString()}`} 
            icon={<AlertCircle size={20} />} 
            className="border-l-4 border-danger-500"
          />
          <StatCard 
            title="Students Owing" 
            value={filteredOutstanding.length} 
            icon={<Users size={20} />} 
            className="border-l-4 border-warning-500"
          />
        </div>

        <Card>
          <CardBody className="pb-4 border-b border-border-secondary">
            <div className="w-full md:w-64">
              <Select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                options={[{ label: 'Filter by Class', value: '' }, ...CLASS_LEVELS.map(c => ({ label: c, value: c }))]}
              />
            </div>
          </CardBody>
          <CardBody className="p-0">
            <DataTable data={filteredOutstanding} columns={columns} />
          </CardBody>
        </Card>
      </div>
    </PageWrapper>
  );
}
