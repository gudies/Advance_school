import { useState, useMemo } from 'react';
import { useStaff } from '../hooks/useStaff';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Modal } from '../../../components/ui/Modal';
import { DataTable, Column } from '../../../components/data-display/DataTable';
import { EmptyState } from '../../../components/data-display/EmptyState';
import { StatCard } from '../../../components/data-display/StatCard';
import { LocalStorageAdapter } from '../../../services/adapters/localStorageAdapter';
import { Department, CURRENCY_SYMBOL } from '../../../types';
import { useNotificationStore } from '../../../stores/notificationStore';
import { Building2, Plus, Users, Wallet, ShieldAlert, Award } from 'lucide-react';

export default function DepartmentsPage() {
  const { staffList } = useStaff();
  const addToast = useNotificationStore((state) => state.addToast);
  const adapter = useMemo(() => new LocalStorageAdapter<Department>('advance_departments'), []);

  const [departments, setDepartments] = useState<Department[]>(() => {
    const list = adapter.getAll();
    if (list.length === 0) {
      const seed: Department[] = [
        { id: 'dept_001', name: 'Academic & Humanities', headId: 'stf_001', description: 'Teaching faculty responsible for standard core courses, humanities, languages, and curriculum.' },
        { id: 'dept_002', name: 'General Administration', headId: 'stf_002', description: 'Management of school administrative operations, registry, admissions, and compliance.' },
        { id: 'dept_003', name: 'Sciences & ICT', headId: 'stf_004', description: 'STEM faculty, computer laboratory managers, and practical sciences instructors.' },
        { id: 'dept_004', name: 'Accounts & Finance', headId: 'stf_005', description: 'Bursar office managing invoices, payroll operations, canteen sales audit, and budgets.' },
        { id: 'dept_005', name: 'Library & Media Services', headId: 'stf_007', description: 'Knowledge center management, digital resources, audio-visual materials, and archiving.' },
        { id: 'dept_006', name: 'Facilities & Logistics', headId: 'stf_008', description: 'Auxiliary operations, campus security, cleaning, logistics, utility and maintenance.' }
      ];
      seed.forEach(x => adapter.create(x));
      return seed;
    }
    return list;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [headId, setHeadId] = useState('');
  const [description, setDescription] = useState('');

  const refreshDepts = () => {
    setDepartments(adapter.getAll());
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newDept: Department = {
      id: `dept_${Math.random().toString(36).substring(7)}`,
      name,
      headId: headId || undefined,
      description
    };

    adapter.create(newDept);
    refreshDepts();
    setIsModalOpen(false);
    
    // Clear fields
    setName('');
    setHeadId('');
    setDescription('');
    
    addToast({
      type: 'success',
      message: 'New department created successfully!'
    });
  };

  // Helper selectors
  const getStaffCount = (deptId: string) => {
    return staffList.filter(s => s.departmentId === deptId).length;
  };

  const getMonthlyPayrollBudget = (deptId: string) => {
    return staffList
      .filter(s => s.departmentId === deptId && s.status === 'active')
      .reduce((acc, s) => acc + s.salary, 0);
  };

  const getHeadName = (headId?: string) => {
    if (!headId) return 'Not Assigned';
    const s = staffList.find(x => x.id === headId);
    return s ? `${s.firstName} ${s.lastName}` : 'Not Assigned';
  };

  const stats = useMemo(() => {
    const totalPayroll = staffList.filter(s => s.status === 'active').reduce((acc, s) => acc + s.salary, 0);
    const totalStaff = staffList.length;
    return {
      totalDepts: departments.length,
      totalStaff,
      totalPayroll,
      avgStaff: departments.length > 0 ? (totalStaff / departments.length).toFixed(1) : '0'
    };
  }, [departments, staffList]);

  const columns: Column<Department>[] = [
    {
      header: 'Department Name',
      accessorKey: 'name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-50 dark:bg-primary-950/20 text-primary-600 rounded-lg shrink-0">
            <Building2 size={16} />
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">{row.name}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 max-w-[250px] truncate" title={row.description}>
              {row.description || 'No description provided.'}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Department Head',
      accessorKey: 'headId',
      cell: (row) => (
        <div className="flex items-center gap-2 text-xs">
          <Award size={14} className="text-amber-500 shrink-0" />
          <span className="font-medium text-slate-700 dark:text-slate-200">{getHeadName(row.headId)}</span>
        </div>
      )
    },
    {
      header: 'Staff Count',
      accessorKey: 'id',
      cell: (row) => (
        <span className="font-bold text-slate-900 dark:text-white">{getStaffCount(row.id)} employees</span>
      )
    },
    {
      header: 'Payroll Budget (Monthly)',
      accessorKey: 'id',
      cell: (row) => (
        <span className="font-bold text-emerald-600 dark:text-emerald-450">
          {CURRENCY_SYMBOL}{getMonthlyPayrollBudget(row.id).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      )
    }
  ];

  return (
    <PageWrapper
      title="School Departments"
      subtitle="Organize staff roster structures, assign department heads, and monitor payroll allocations."
      breadcrumbs={[
        { label: 'Staff Management', path: '/staff' },
        { label: 'Departments' }
      ]}
    >
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Departments"
          value={stats.totalDepts}
          icon={<Building2 className="text-primary-500" />}
        />
        <StatCard
          title="Staff Count"
          value={stats.totalStaff}
          icon={<Users className="text-indigo-500" />}
        />
        <StatCard
          title="Monthly Staff Cost"
          value={`${CURRENCY_SYMBOL}${stats.totalPayroll.toLocaleString()}`}
          icon={<Wallet className="text-success-500" />}
        />
        <StatCard
          title="Avg Staff / Dept"
          value={stats.avgStaff}
          icon={<ShieldAlert className="text-amber-500" />}
        />
      </div>

      {/* Main card */}
      <Card>
        <CardHeader className="flex-between">
          <CardTitle>Departments Directory</CardTitle>
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Department
          </Button>
        </CardHeader>
        <CardBody className="p-0">
          {departments.length > 0 ? (
            <DataTable data={departments} columns={columns} />
          ) : (
            <div className="p-6">
              <EmptyState
                title="No Departments"
                description="There are currently no departments configured."
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Add Department Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New School Department"
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Department Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Science Faculty, Auxiliary Staff..."
          />
          <Select
            label="Department Head (Staff Member)"
            value={headId}
            onChange={(e) => setHeadId(e.target.value)}
            options={[
              { value: '', label: 'Select Head of Department' },
              ...staffList.map(s => ({
                value: s.id,
                label: `${s.firstName} ${s.lastName} (${s.role.replace('_', ' ')})`
              }))
            ]}
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-secondary mb-1">Description</label>
            <textarea
              className="w-full bg-surface-secondary border border-border-primary rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-900"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the department's core responsibilities and budget allocations..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border-secondary">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Department
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
