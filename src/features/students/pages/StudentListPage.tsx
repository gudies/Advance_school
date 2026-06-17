import { useState, useMemo } from 'react';
import { useStudents } from '../hooks/useStudents';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { DataTable, Column } from '../../../components/data-display/DataTable';
import { Card, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import { Student } from '../../../types';
import { Grid, List, Eye, Trash2, Plus, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useConfirmationStore } from '../../../stores/confirmationStore';

export default function StudentListPage() {
  const navigate = useNavigate();
  const { students, deleteStudent } = useStudents();
  const { askConfirm } = useConfirmationStore();
  
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Filtering Logic
  const filteredStudents = useMemo(() => {
    // Only show official students (enrolled/active/inactive/suspended)
    // applied/under_review belong to the Admissions Pipeline page
    const officialRoles = ['enrolled', 'active', 'inactive', 'suspended'];
    
    return students.filter((student) => {
      const matchesSearch = 
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.guardian.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesClass = classFilter ? student.classLevel === classFilter : true;
      
      const matchesStatus = statusFilter 
        ? student.status === statusFilter 
        : officialRoles.includes(student.status);

      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [students, searchQuery, classFilter, statusFilter]);

  const handleDelete = (id: string) => {
    askConfirm({
      title: 'Remove Student Record',
      message: 'Are you sure you want to permanently delete this student record? This action is irreversible.',
      confirmLabel: 'Delete',
      type: 'danger',
      onConfirm: () => deleteStudent(id)
    });
  };

  // Table Columns
  const columns: Column<Student>[] = [
    {
      header: 'ID',
      accessorKey: 'studentId',
      sortable: true,
    },
    {
      header: 'Full Name',
      accessorKey: 'firstName',
      sortable: true,
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex-center font-bold text-xs select-none">
            {item.firstName[0]}{item.lastName[0]}
          </div>
          <div>
            <p className="font-semibold text-slate-950 dark:text-white leading-none">
              {item.firstName} {item.lastName}
            </p>
            <p className="text-xs text-secondary font-light mt-0.5">{item.gender}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Class',
      accessorKey: 'classLevel',
      sortable: true,
    },
    {
      header: 'Guardian',
      accessorKey: 'guardian',
      cell: (item) => (
        <div>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.guardian.name}</p>
          <p className="text-xs text-secondary font-light mt-0.5">{item.guardian.phone}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: (item) => {
        const variant = 
          item.status === 'active' || item.status === 'enrolled' ? 'success' :
          item.status === 'suspended' ? 'danger' : 'neutral';
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
            onClick={() => navigate(`/students/${item.id}`)}
            title="View Details"
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
      title="Students Directory"
      subtitle="Manage student enrollment profiles, registration records, and class distribution."
      breadcrumbs={[
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Students' },
      ]}
      action={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/students/admissions')}>
            <UserCheck className="h-4 w-4 mr-2" />
            Admissions Pipeline
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/students/enroll')}>
            <Plus className="h-4 w-4 mr-2" />
            New Admission
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Filters Panel */}
        <Card>
          <CardBody className="grid grid-4 gap-4">
            <Input
              label="Search Students"
              placeholder="Search by name, ID or guardian..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            <Select
              label="Class Level"
              placeholder="All Levels"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              options={[
                { value: 'JHS 1', label: 'JHS 1' },
                { value: 'JHS 2', label: 'JHS 2' },
                { value: 'JHS 3', label: 'JHS 3' },
              ]}
            />

            <Select
              label="Status"
              placeholder="All Statuses"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'enrolled', label: 'Enrolled' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'suspended', label: 'Suspended' },
              ]}
            />

            <div className="flex flex-col justify-end">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">View Format</label>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-fit h-10 items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 px-3 ${viewMode === 'table' ? 'bg-white dark:bg-slate-900 text-primary-600 shadow-sm' : 'text-slate-500'}`}
                  onClick={() => setViewMode('table')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 px-3 ${viewMode === 'grid' ? 'bg-white dark:bg-slate-900 text-primary-600 shadow-sm' : 'text-slate-500'}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* List Content */}
        {viewMode === 'table' ? (
          <Card>
            <CardBody className="p-0">
              <DataTable
                data={filteredStudents}
                columns={columns}
                pageSize={10}
              />
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-3 gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => {
                const badgeVar = 
                  student.status === 'active' || student.status === 'enrolled' ? 'success' :
                  student.status === 'suspended' ? 'danger' : 'neutral';
                return (
                  <Card key={student.id} className="hover:scale-[1.02] transition-transform duration-200">
                    <CardBody className="flex flex-col items-center text-center p-6 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-700 flex-center font-bold text-lg select-none">
                        {student.firstName[0]}{student.lastName[0]}
                      </div>
                      
                      <div>
                        <h4 className="font-bold text-base text-slate-900 dark:text-white">
                          {student.firstName} {student.lastName}
                        </h4>
                        <p className="text-xs text-secondary font-light">{student.studentId}</p>
                      </div>

                      <div className="flex gap-2">
                        <Badge variant="primary">{student.classLevel}</Badge>
                        <Badge variant={badgeVar} className="capitalize">{student.status}</Badge>
                      </div>

                      <div className="w-full border-t border-slate-100 dark:border-slate-800 pt-4 text-left space-y-1">
                        <p className="text-xs text-slate-400 font-light">Guardian:</p>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none">{student.guardian.name}</p>
                        <p className="text-[10px] text-secondary font-light mt-0.5">{student.guardian.phone}</p>
                      </div>

                      <div className="w-full flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => navigate(`/students/${student.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1.5" /> View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:bg-rose-50"
                          onClick={() => handleDelete(student.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full py-16 text-center text-slate-400">
                No students match the selected filter query.
              </div>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
