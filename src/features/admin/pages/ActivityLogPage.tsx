
import { useAdmin, ActivityLog } from '../hooks/useAdmin';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Card, CardBody } from '../../../components/ui/Card';
import { DataTable, Column } from '../../../components/data-display/DataTable';
import { Badge } from '../../../components/ui/Badge';
import { Clock } from 'lucide-react';

export default function ActivityLogPage() {
  const { logs } = useAdmin();

  const columns: Column<ActivityLog>[] = [
    {
      header: 'Timestamp',
      accessorKey: 'timestamp',
      sortable: true,
      cell: (item) => (
        <div className="flex items-center gap-2 text-slate-500">
          <Clock size={14} />
          <span>
            {new Date(item.timestamp).toLocaleString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </span>
        </div>
      )
    },
    {
      header: 'User',
      accessorKey: 'userName',
      sortable: true,
      cell: (item) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">{item.userName}</div>
          <div className="text-xs text-slate-400">ID: {item.userId}</div>
        </div>
      )
    },
    {
      header: 'Action',
      accessorKey: 'action',
      sortable: true,
      cell: (item) => {
        const actionColors: Record<string, 'primary' | 'success' | 'warning' | 'neutral' | 'danger'> = {
          CREATE_USER: 'success',
          UPDATE_USER: 'primary',
          ACTIVATE_USER: 'success',
          DEACTIVATE_USER: 'neutral',
          UPDATE_SETTINGS: 'warning',
          APPROVE_LEAVE: 'success',
          REJECT_LEAVE: 'danger',
          APPROVE_EXPENSE: 'success',
          REJECT_EXPENSE: 'danger'
        };
        return (
          <Badge variant={actionColors[item.action] || 'neutral'} className="font-mono text-[10px]">
            {item.action}
          </Badge>
        );
      }
    },
    {
      header: 'Details',
      accessorKey: 'details'
    }
  ];

  const breadcrumbs = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Admin Panel' },
    { label: 'Activity Log' }
  ];

  return (
    <PageWrapper 
      title="System Audit Trails & Activity Logs" 
      subtitle="Examine system security, modifications to configs, user credentials adjustments, and approvals auditing."
      breadcrumbs={breadcrumbs}
    >
      <Card>
        <CardBody>
          <DataTable 
            data={logs} 
            columns={columns} 
            searchKey="userName" 
            searchPlaceholder="Search logs by administrator name..." 
            pageSize={15} 
          />
        </CardBody>
      </Card>
    </PageWrapper>
  );
}
