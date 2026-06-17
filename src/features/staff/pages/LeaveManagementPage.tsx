import { useState, useMemo } from 'react';
import { useStaff } from '../hooks/useStaff';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { DataTable, Column } from '../../../components/data-display/DataTable';
import { EmptyState } from '../../../components/data-display/EmptyState';
import { StatCard } from '../../../components/data-display/StatCard';
import { LocalStorageAdapter } from '../../../services/adapters/localStorageAdapter';
import { LeaveRequest } from '../../../types';
import { useNotificationStore } from '../../../stores/notificationStore';
import { Check, X, FileText, CalendarCheck, ShieldAlert } from 'lucide-react';

export default function LeaveManagementPage() {
  const { staffList } = useStaff();
  const addToast = useNotificationStore((state) => state.addToast);
  const adapter = useMemo(() => new LocalStorageAdapter<LeaveRequest>('advance_leave_requests'), []);

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    const list = adapter.getAll();
    if (list.length === 0) {
      const seed: LeaveRequest[] = [
        {
          id: 'leave_1',
          staffId: 'stf_001', // Ama Mensah
          type: 'sick',
          startDate: '2026-06-10',
          endDate: '2026-06-12',
          reason: 'Medical checkup and dental surgery recovery.',
          status: 'approved',
          appliedOn: '2026-06-08',
          reviewedBy: 'stf_010',
          reviewedOn: '2026-06-09',
          comments: 'Approved. Get well soon!'
        },
        {
          id: 'leave_2',
          staffId: 'stf_002', // Kwasi Appiah
          type: 'annual',
          startDate: '2026-06-20',
          endDate: '2026-06-25',
          reason: 'Family gathering in Kumasi.',
          status: 'pending',
          appliedOn: '2026-06-14'
        },
        {
          id: 'leave_3',
          staffId: 'stf_003', // Abena Sarpong
          type: 'unpaid',
          startDate: '2026-06-15',
          endDate: '2026-06-18',
          reason: 'Personal business travel outside the country.',
          status: 'rejected',
          appliedOn: '2026-06-05',
          reviewedBy: 'stf_010',
          reviewedOn: '2026-06-06',
          comments: 'Rejected due to exam invigilation schedules.'
        }
      ];
      seed.forEach((x) => adapter.create(x));
      return seed;
    }
    return list;
  });

  const refreshRequests = () => {
    setLeaveRequests(adapter.getAll());
  };

  const handleAction = (id: string, status: 'approved' | 'rejected') => {
    adapter.update(id, {
      status,
      reviewedBy: 'super_admin',
      reviewedOn: new Date().toISOString().split('T')[0],
      comments: status === 'approved' ? 'Request approved by Administration.' : 'Request declined. Please contact HR.'
    });
    refreshRequests();
    addToast({
      type: status === 'approved' ? 'success' : 'warning',
      message: `Leave request has been ${status} successfully.`
    });
  };

  const stats = useMemo(() => {
    const pending = leaveRequests.filter(r => r.status === 'pending').length;
    const approved = leaveRequests.filter(r => r.status === 'approved').length;
    const rejected = leaveRequests.filter(r => r.status === 'rejected').length;
    return { pending, approved, rejected, total: leaveRequests.length };
  }, [leaveRequests]);

  const getStaffName = (staffId: string) => {
    const s = staffList.find(x => x.id === staffId);
    return s ? `${s.firstName} ${s.lastName}` : 'Unknown Staff';
  };

  const getStaffRole = (staffId: string) => {
    const s = staffList.find(x => x.id === staffId);
    return s ? s.role.replace('_', ' ') : 'Employee';
  };

  const columns: Column<LeaveRequest>[] = [
    {
      header: 'Staff Member',
      accessorKey: 'staffId',
      cell: (row) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">{getStaffName(row.staffId)}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">{getStaffRole(row.staffId)}</div>
        </div>
      )
    },
    {
      header: 'Leave Type',
      accessorKey: 'type',
      cell: (row) => (
        <span className="capitalize px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 rounded font-medium text-slate-600 dark:text-slate-350">
          {row.type}
        </span>
      )
    },
    {
      header: 'Duration',
      accessorKey: 'startDate',
      cell: (row) => (
        <div className="text-xs">
          <span className="font-mono text-slate-600 dark:text-slate-300">{row.startDate}</span> to <span className="font-mono text-slate-600 dark:text-slate-300">{row.endDate}</span>
        </div>
      )
    },
    {
      header: 'Reason',
      accessorKey: 'reason',
      cell: (row) => (
        <div className="max-w-[200px] truncate text-slate-600 dark:text-slate-400 text-xs" title={row.reason}>
          {row.reason}
        </div>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => {
        const variants: Record<string, 'neutral' | 'success' | 'danger' | 'warning' | 'primary'> = {
          pending: 'warning',
          approved: 'success',
          rejected: 'danger'
        };
        return (
          <Badge variant={variants[row.status] || 'neutral'} className="capitalize">
            {row.status}
          </Badge>
        );
      }
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (row) => (
        <div className="flex gap-2">
          {row.status === 'pending' ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-100 py-1 px-2"
                onClick={() => handleAction(row.id, 'approved')}
              >
                <Check size={14} className="mr-1" /> Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 py-1 px-2"
                onClick={() => handleAction(row.id, 'rejected')}
              >
                <X size={14} className="mr-1" /> Reject
              </Button>
            </>
          ) : (
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Reviewed</span>
          )}
        </div>
      )
    }
  ];

  return (
    <PageWrapper
      title="Staff Leave Management"
      subtitle="View, track, and process leave requests for all teaching and auxiliary staff."
      breadcrumbs={[
        { label: 'Staff Management', path: '/staff' },
        { label: 'Leave Requests' }
      ]}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Pending Approvals"
          value={stats.pending}
          icon={<ShieldAlert className="text-warning-500" />}
          className="bg-warning-50/20"
        />
        <StatCard
          title="Approved Requests"
          value={stats.approved}
          icon={<CalendarCheck className="text-success-500" />}
        />
        <StatCard
          title="Rejected Requests"
          value={stats.rejected}
          icon={<X className="text-danger-500" />}
        />
        <StatCard
          title="Total Applications"
          value={stats.total}
          icon={<FileText className="text-primary-500" />}
        />
      </div>

      {/* Main Request Roster Card */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Application Roster</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          {leaveRequests.length > 0 ? (
            <DataTable data={leaveRequests} columns={columns} />
          ) : (
            <div className="p-6">
              <EmptyState
                title="No Applications"
                description="There are currently no leave requests recorded in the system."
              />
            </div>
          )}
        </CardBody>
      </Card>
    </PageWrapper>
  );
}
