import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStaff } from '../hooks/useStaff';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Avatar } from '../../../components/ui/Avatar';
import { Tabs } from '../../../components/ui/Tabs';
import { DataTable, Column } from '../../../components/data-display/DataTable';
import { StatCard } from '../../../components/data-display/StatCard';
import { EmptyState } from '../../../components/data-display/EmptyState';
import { LocalStorageAdapter } from '../../../services/adapters/localStorageAdapter';
import { StaffAttendance, LeaveRequest, PayslipInfo, CURRENCY_SYMBOL } from '../../../types';
import { ArrowLeft, Edit, ShieldAlert, CheckCircle, Clock, FileText, Banknote, Calendar } from 'lucide-react';
import { useNotificationStore } from '../../../stores/notificationStore';
import { useConfirmationStore } from '../../../stores/confirmationStore';

export default function StaffDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getStaffById, updateStaff } = useStaff();
  const addToast = useNotificationStore(state => state.addToast);
  const { askConfirm } = useConfirmationStore();
  
  const [activeTab, setActiveTab] = useState('bio');

  const staff = useMemo(() => (id ? getStaffById(id) : null), [id, getStaffById]);

  const attendanceAdapter = useMemo(() => new LocalStorageAdapter<StaffAttendance>('advance_staff_attendance'), []);
  const leaveAdapter = useMemo(() => new LocalStorageAdapter<LeaveRequest>('advance_leave_requests'), []);
  const payslipAdapter = useMemo(() => new LocalStorageAdapter<PayslipInfo>('advance_payslips'), []);

  const attendanceRecords = useMemo(() => {
    if (!staff) return [];
    return attendanceAdapter.getWhere(a => a.staffId === staff.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [staff, attendanceAdapter]);

  const leaveRequests = useMemo(() => {
    if (!staff) return [];
    return leaveAdapter.getWhere(l => l.staffId === staff.id).sort((a, b) => new Date(b.appliedOn).getTime() - new Date(a.appliedOn).getTime());
  }, [staff, leaveAdapter]);

  const payslips = useMemo(() => {
    if (!staff) return [];
    return payslipAdapter.getWhere(p => p.staffId === staff.id).sort((a, b) => b.month.localeCompare(a.month));
  }, [staff, payslipAdapter]);

  if (!staff) {
    return (
      <PageWrapper title="Staff Not Found" breadcrumbs={[{ label: 'Staff', path: '/staff' }, { label: 'Error' }]}>
        <EmptyState title="Staff Not Found" description="The staff member you are looking for does not exist." />
      </PageWrapper>
    );
  }

  const handleStatusToggle = () => {
    const newStatus = staff.status === 'active' ? 'suspended' : 'active';
    askConfirm({
      title: 'Change Staff Status',
      message: `Are you sure you want to change the status of ${staff.firstName} ${staff.lastName} to "${newStatus}"?`,
      confirmLabel: 'Update Status',
      type: newStatus === 'suspended' ? 'danger' : 'warning',
      onConfirm: () => {
        updateStaff(staff.id, { status: newStatus });
        addToast({
          type: 'success',
          title: 'Status Updated',
          message: `${staff.firstName}'s status is now ${newStatus}.`
        });
      }
    });
  };

  const tabs = [
    { id: 'bio', label: 'Bio & Info', icon: <FileText size={16} /> },
    { id: 'attendance', label: 'Attendance', icon: <Clock size={16} /> },
    { id: 'leave', label: 'Leave', icon: <Calendar size={16} /> },
    { id: 'salary', label: 'Salary History', icon: <Banknote size={16} /> },
  ];

  // Attendance Stats
  const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
  const lateCount = attendanceRecords.filter(r => r.status === 'late').length;
  const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;

  const attendanceCols: Column<StaffAttendance>[] = [
    { header: 'Date', accessorKey: 'date', cell: (item) => new Date(item.date).toLocaleDateString() },
    { 
      header: 'Status', 
      accessorKey: 'status', 
      cell: (item) => {
        const variant = item.status === 'present' ? 'success' : item.status === 'late' ? 'warning' : item.status === 'absent' ? 'danger' : 'neutral';
        return <Badge variant={variant} className="capitalize">{item.status}</Badge>;
      }
    },
    { header: 'Check In', accessorKey: 'checkInTime', cell: (item) => item.checkInTime || '-' },
    { header: 'Check Out', accessorKey: 'checkOutTime', cell: (item) => item.checkOutTime || '-' },
    { header: 'Notes', accessorKey: 'notes', cell: (item) => <span className="truncate max-w-xs block">{item.notes || '-'}</span> }
  ];

  const leaveCols: Column<LeaveRequest>[] = [
    { header: 'Type', accessorKey: 'type', cell: (item) => <span className="capitalize">{item.type}</span> },
    { header: 'Duration', accessorKey: 'startDate', cell: (item) => `${new Date(item.startDate).toLocaleDateString()} to ${new Date(item.endDate).toLocaleDateString()}` },
    { header: 'Applied On', accessorKey: 'appliedOn', cell: (item) => new Date(item.appliedOn).toLocaleDateString() },
    { 
      header: 'Status', 
      accessorKey: 'status',
      cell: (item) => {
        const variant = item.status === 'approved' ? 'success' : item.status === 'rejected' ? 'danger' : 'warning';
        return <Badge variant={variant} className="capitalize">{item.status}</Badge>;
      }
    }
  ];

  return (
    <PageWrapper
      title={`${staff.firstName} ${staff.lastName}`}
      subtitle={`Staff ID: ${staff.staffId} | Role: ${staff.role.replace('_', ' ').toUpperCase()}`}
      breadcrumbs={[
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Staff', path: '/staff' },
        { label: 'Staff Profile' },
      ]}
      action={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/staff')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" /> Edit Staff
          </Button>
          {staff.status === 'active' ? (
            <Button variant="danger" size="sm" onClick={handleStatusToggle}>
              <ShieldAlert className="h-4 w-4 mr-2" /> Suspend Staff
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={handleStatusToggle}>
              <CheckCircle className="h-4 w-4 mr-2" /> Activate Staff
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Profile Header Card */}
        <Card>
          <CardBody className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <Avatar 
              src={staff.photoUrl} 
              name={`${staff.firstName} ${staff.lastName}`}
              size="xl"
              className="w-24 h-24 text-2xl"
            />
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                  {staff.firstName} {staff.lastName}
                </h2>
                <Badge variant={staff.status === 'active' ? 'success' : 'neutral'} className="capitalize w-max mx-auto md:mx-0">
                  {staff.status}
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">Email</p>
                  <p className="text-sm text-slate-800 dark:text-slate-200">{staff.email}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">Phone</p>
                  <p className="text-sm text-slate-800 dark:text-slate-200">{staff.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">Department</p>
                  <p className="text-sm text-slate-800 dark:text-slate-200">{staff.departmentId}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">Employment Date</p>
                  <p className="text-sm text-slate-800 dark:text-slate-200">{new Date(staff.dateOfEmployment).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Tabs */}
        <Card>
          <div className="border-b border-border-secondary px-6 pt-4">
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="line" />
          </div>
          <CardBody>
            {activeTab === 'bio' && (
              <div className="grid grid-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Professional Details</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-secondary">Qualification</p>
                      <p className="text-sm font-medium">{staff.qualification || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-secondary">Base Salary</p>
                      <p className="text-sm font-medium">{CURRENCY_SYMBOL}{staff.salary.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Bank Details</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-secondary">Bank Name</p>
                      <p className="text-sm font-medium">{staff.bankAccount?.bankName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-secondary">Account Name</p>
                      <p className="text-sm font-medium">{staff.bankAccount?.accountName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-secondary">Account Number</p>
                      <p className="text-sm font-medium">{staff.bankAccount?.accountNumber || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div className="space-y-6">
                <div className="grid grid-3 gap-4">
                  <StatCard title="Present" value={presentCount} icon={<CheckCircle size={20} />} trend={{ value: presentCount, type: 'up' }} />
                  <StatCard title="Late" value={lateCount} icon={<Clock size={20} />} trend={{ value: lateCount, type: 'down' }} />
                  <StatCard title="Absent" value={absentCount} icon={<ShieldAlert size={20} />} />
                </div>
                {attendanceRecords.length > 0 ? (
                  <DataTable data={attendanceRecords} columns={attendanceCols} />
                ) : (
                  <EmptyState title="No Attendance Records" description="There are no attendance records for this staff member yet." />
                )}
              </div>
            )}

            {activeTab === 'leave' && (
              <div className="space-y-6">
                <div className="flex justify-end">
                  <Button variant="primary" size="sm">Apply for Leave</Button>
                </div>
                {leaveRequests.length > 0 ? (
                  <DataTable data={leaveRequests} columns={leaveCols} />
                ) : (
                  <EmptyState title="No Leave Requests" description="This staff member has not applied for any leave." />
                )}
              </div>
            )}

            {activeTab === 'salary' && (
              <div className="space-y-6">
                {payslips.length > 0 ? (
                  <div className="grid grid-2 gap-4">
                    {payslips.map(payslip => (
                      <Card key={payslip.id} className="border border-border-secondary shadow-sm">
                        <CardHeader className="flex-between pb-2">
                          <CardTitle className="text-base">{payslip.month}</CardTitle>
                          <Badge variant={payslip.status === 'paid' ? 'success' : 'warning'} className="capitalize">{payslip.status}</Badge>
                        </CardHeader>
                        <CardBody className="py-2">
                          <div className="flex-between text-sm mb-1">
                            <span className="text-secondary">Basic:</span>
                            <span className="font-medium">{CURRENCY_SYMBOL}{payslip.basicSalary.toLocaleString()}</span>
                          </div>
                          <div className="flex-between text-sm mb-1">
                            <span className="text-danger-600">Deductions:</span>
                            <span className="font-medium text-danger-600">
                              -{CURRENCY_SYMBOL}{payslip.deductions.reduce((acc, d) => acc + d.amount, 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex-between text-sm pt-2 border-t border-border-secondary mt-2">
                            <span className="font-bold">Net Salary:</span>
                            <span className="font-bold text-success-600">{CURRENCY_SYMBOL}{payslip.netSalary.toLocaleString()}</span>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No Payslips" description="No payslips have been generated for this staff member yet." />
                )}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </PageWrapper>
  );
}
