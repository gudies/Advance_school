import React, { useState } from 'react';
import { useAdmin } from '../hooks/useAdmin';
import { useAuthStore } from '../../../stores/authStore';
import { useNotificationStore } from '../../../stores/notificationStore';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Card, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { DataTable, Column } from '../../../components/data-display/DataTable';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { User, UserRole, Permission } from '../../../types/auth';
import { UserPlus, Edit2, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

const ROLE_OPTIONS = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'parent', label: 'Parent' },
  { value: 'student', label: 'Student' }
];

const ALL_PERMISSIONS: { value: Permission; label: string }[] = [
  { value: 'manage_users', label: 'Manage Users' },
  { value: 'manage_students', label: 'Manage Students' },
  { value: 'manage_staff', label: 'Manage Staff' },
  { value: 'manage_fees', label: 'Manage Fee Modules' },
  { value: 'manage_academics', label: 'Manage Academic Data' },
  { value: 'view_reports', label: 'View Financial/Academic Reports' },
  { value: 'view_own_student', label: 'View Own Student Profile' },
  { value: 'view_own_child', label: 'View Own Child Details' },
  { value: 'enter_grades', label: 'Enter Academic Grades' },
  { value: 'pay_fees', label: 'Pay Student Fees' }
];

const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: ['manage_users', 'manage_students', 'manage_staff', 'manage_fees', 'manage_academics', 'view_reports'],
  admin: ['manage_students', 'manage_staff', 'manage_fees', 'manage_academics', 'view_reports'],
  teacher: ['view_own_student', 'enter_grades'],
  parent: ['view_own_child', 'pay_fees'],
  student: ['view_own_student']
};

export default function UserManagementPage() {
  const { users, createUser, updateUser, toggleUserStatus } = useAdmin();
  const { user: currentUser } = useAuthStore();
  const addToast = useNotificationStore((state) => state.addToast);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('teacher');
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setRole('teacher');
    setSelectedPermissions(DEFAULT_ROLE_PERMISSIONS['teacher']);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmail(user.email);
    setRole(user.role);
    setSelectedPermissions(user.permissions);
    setIsModalOpen(true);
  };

  const handleRoleChange = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setSelectedPermissions(DEFAULT_ROLE_PERMISSIONS[selectedRole]);
  };

  const handleTogglePermission = (perm: Permission) => {
    setSelectedPermissions((prev) => 
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!firstName || !lastName || !email) {
      addToast({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    try {
      if (editingUser) {
        // Edit User
        const updated: User = {
          ...editingUser,
          firstName,
          lastName,
          email,
          role,
          permissions: selectedPermissions
        };
        updateUser(updated, currentUser.id, `${currentUser.firstName} ${currentUser.lastName}`);
        addToast({ type: 'success', message: 'User updated successfully!' });
      } else {
        // Create User
        const newUser: Omit<User, 'createdAt'> = {
          id: `usr_${Math.random().toString(36).substring(7)}`,
          firstName,
          lastName,
          email,
          role,
          status: 'active',
          permissions: selectedPermissions
        };
        createUser(newUser, currentUser.id, `${currentUser.firstName} ${currentUser.lastName}`);
        addToast({ type: 'success', message: 'User created successfully!' });
      }
      setIsModalOpen(false);
    } catch (err) {
      addToast({ type: 'error', message: err instanceof Error ? err.message : 'An error occurred while saving.' });
    }
  };

  const handleToggleStatus = (user: User) => {
    if (!currentUser) return;
    if (user.id === currentUser.id) {
      addToast({ type: 'error', message: 'You cannot deactivate your own account!' });
      return;
    }
    toggleUserStatus(user.id, user.status, currentUser.id, `${currentUser.firstName} ${currentUser.lastName}`);
    addToast({ 
      type: 'success', 
      message: `Account for ${user.firstName} ${user.lastName} has been ${user.status === 'active' ? 'deactivated' : 'activated'}.` 
    });
  };

  const columns: Column<User>[] = [
    {
      header: 'Name',
      accessorKey: 'firstName',
      sortable: true,
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300 flex-center font-bold text-sm">
            {item.firstName[0]}{item.lastName[0]}
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">{item.firstName} {item.lastName}</div>
            <div className="text-xs text-slate-500">{item.email}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Role',
      accessorKey: 'role',
      sortable: true,
      cell: (item) => {
        const roleColors: Record<UserRole, 'primary' | 'danger' | 'success' | 'warning' | 'neutral'> = {
          super_admin: 'danger',
          admin: 'primary',
          teacher: 'primary',
          parent: 'success',
          student: 'warning'
        };
        return (
          <Badge variant={roleColors[item.role] || 'neutral'} className="capitalize">
            {item.role.replace('_', ' ')}
          </Badge>
        );
      }
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: (item) => (
        <Badge variant={item.status === 'active' ? 'success' : 'danger'}>
          {item.status}
        </Badge>
      )
    },
    {
      header: 'Created At',
      accessorKey: 'createdAt',
      sortable: true,
      cell: (item) => new Date(item.createdAt).toLocaleDateString('en-GB')
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (item) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(item)} title="Edit User">
            <Edit2 size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleToggleStatus(item)} 
            className={item.status === 'active' ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20' : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'}
            title={item.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
          >
            {item.status === 'active' ? <XCircle size={16} /> : <CheckCircle size={16} />}
          </Button>
        </div>
      )
    }
  ];

  const breadcrumbs = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Admin Panel' },
    { label: 'Users' }
  ];

  return (
    <PageWrapper 
      title="User Accounts Management" 
      subtitle="Configure system login credentials, assign institutional roles, and audit security permissions."
      breadcrumbs={breadcrumbs}
      action={
        <Button variant="primary" onClick={handleOpenCreateModal} leftIcon={<UserPlus size={18} />}>
          Add New User
        </Button>
      }
    >
      <Card>
        <CardBody>
          <DataTable 
            data={users} 
            columns={columns} 
            searchKey="email" 
            searchPlaceholder="Search user accounts by email..." 
            pageSize={10} 
          />
        </CardBody>
      </Card>

      {/* Create/Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit User Credentials & Roles' : 'Register New User Account'}
        size="lg"
      >
        <form onSubmit={handleSaveUser} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name *"
              placeholder="e.g. Kwame"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <Input
              label="Last Name *"
              placeholder="e.g. Asante"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email Address *"
              type="email"
              placeholder="e.g. user@camiedbehills.edu.gh"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!!editingUser} // Email acts as login identifier
            />
            <Select
              label="Institutional Role *"
              value={role}
              onChange={(e) => handleRoleChange(e.target.value as UserRole)}
              options={ROLE_OPTIONS}
            />
          </div>

          {/* Granular Permissions Mapping */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/10">
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="text-amber-500 h-5 w-5" />
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm font-heading">
                Granular Security Permissions
              </h4>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Permissions are initialized with default settings based on the selected role, but can be customized for this specific user.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ALL_PERMISSIONS.map((perm) => (
                <label 
                  key={perm.value} 
                  className={`flex items-start gap-3 p-3 rounded-lg border text-sm cursor-pointer transition-all duration-200 ${
                    selectedPermissions.includes(perm.value)
                      ? 'border-primary-500 bg-primary-50/30 dark:bg-primary-950/10 text-primary-700 dark:text-primary-300'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800/30'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(perm.value)}
                    onChange={() => handleTogglePermission(perm.value)}
                    className="mt-0.5 rounded text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <span className="font-medium">{perm.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 pt-4">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingUser ? 'Save Changes' : 'Create Account'}
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
