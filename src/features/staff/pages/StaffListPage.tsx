import { useState, useMemo } from 'react';
import { useStaff } from '../hooks/useStaff';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { DataTable, Column } from '../../../components/data-display/DataTable';
import { Card, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import { Staff } from '../../../types';
import { Eye, Trash2, Plus, CalendarCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useConfirmationStore } from '../../../stores/confirmationStore';

export default function StaffListPage() {
  const navigate = useNavigate();
  const { staffList, deleteStaff } = useStaff();
  const { askConfirm } = useConfirmationStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      const matchesSearch = 
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.staffId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter ? s.role === roleFilter : true;

      return matchesSearch && matchesRole;
    });
  }, [staffList, searchQuery, roleFilter]);

  const handleDelete = (id: string) => {
    askConfirm({
      title: 'Remove Staff Record',
      message: 'Are you sure you want to permanently delete this staff member? This action is irreversible.',
      confirmLabel: 'Delete',
      type: 'danger',
      onConfirm: () => deleteStaff(id)
    });
  };

  const columns: Column<Staff>[] = [
    {
      header: 'Staff ID',
      accessorKey: 'staffId',
      sortable: true,
    },
    {
      header: 'Full Name',
      accessorKey: 'firstName',
      sortable: true,
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex-center font-bold text-xs select-none">
            {item.firstName[0]}{item.lastName[0]}
          </div>
          <div>
            <p className="font-semibold text-slate-950 dark:text-white leading-none">
              {item.firstName} {item.lastName}
            </p>
            <p className="text-xs text-secondary font-light mt-0.5">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      accessorKey: 'role',
      sortable: true,
      cell: (item) => <span className="capitalize">{item.role.replace('_', ' ')}</span>,
    },
    {
      header: 'Employment Date',
      accessorKey: 'dateOfEmployment',
      cell: (item) => new Date(item.dateOfEmployment).toLocaleDateString(),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: (item) => {
        const variant = item.status === 'active' ? 'success' : 'neutral';
        return <Badge variant={variant} className="capitalize">{item.status}</Badge>;
      },
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: (item) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/staff/${item.id}`)}
            title="View Profile"
          >
            <Eye className="h-4 w-4 text-slate-500 hover:text-primary-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(item.id)}
            title="Delete Record"
          >
            <Trash2 className="h-4 w-4 text-slate-500 hover:text-rose-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageWrapper
      title="Staff Directory"
      subtitle="Manage school teachers, administrators, accountant profiles, and check active records."
      breadcrumbs={[
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Staff' },
      ]}
      action={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/staff/attendance')}>
            <CalendarCheck className="h-4 w-4 mr-2" />
            Staff Attendance
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/staff/register')}>
            <Plus className="h-4 w-4 mr-2" />
            Register Staff
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Filters Panel */}
        <Card>
          <CardBody className="grid grid-3 gap-4">
            <Input
              label="Search Staff"
              placeholder="Search by name, ID or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <Select
              label="Role"
              placeholder="All Roles"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={[
                { value: 'teacher', label: 'Teacher' },
                { value: 'head_teacher', label: 'Head Teacher' },
                { value: 'accountant', label: 'Accountant' },
                { value: 'secretary', label: 'Secretary' },
                { value: 'librarian', label: 'Librarian' },
                { value: 'security', label: 'Security' },
                { value: 'cleaner', label: 'Cleaner' },
                { value: 'driver', label: 'Driver' },
              ]}
            />
          </CardBody>
        </Card>

        {/* Staff DataTable */}
        <Card>
          <CardBody className="p-0">
            <DataTable
              data={filteredStaff}
              columns={columns}
              pageSize={10}
            />
          </CardBody>
        </Card>
      </div>
    </PageWrapper>
  );
}
