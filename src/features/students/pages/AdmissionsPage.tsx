import { useState, useMemo } from 'react';
import { useStudents } from '../hooks/useStudents';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Card, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import { DataTable, Column } from '../../../components/data-display/DataTable';
import { Student, AdmissionStatus } from '../../../types';
import { Check, X, UserPlus } from 'lucide-react';
import { useNotificationStore } from '../../../stores/notificationStore';

export default function AdmissionsPage() {
  const { students, updateAdmissionStatus } = useStudents();
  const addToast = useNotificationStore(state => state.addToast);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [pipelineFilter, setPipelineFilter] = useState<AdmissionStatus | 'all'>('all');

  // Filter for students who are in the admissions process (applied, under_review, accepted, rejected)
  const admissionApplications = useMemo(() => {
    const pipelineStatuses = ['applied', 'under_review', 'accepted', 'rejected'];
    return students.filter((s) => {
      const matchesStatus = pipelineFilter === 'all' 
        ? pipelineStatuses.includes(s.status) 
        : s.status === pipelineFilter;
      
      const matchesSearch = 
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [students, searchQuery, pipelineFilter]);

  const handleStatusTransition = (id: string, name: string, nextStatus: AdmissionStatus) => {
    try {
      updateAdmissionStatus(id, nextStatus);
      addToast({
        type: 'success',
        title: 'Status Updated',
        message: `${name}'s application status has been changed to ${nextStatus.replace('_', ' ')}.`
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Failed to update status',
        message: 'There was an issue processing the application pipeline change.'
      });
    }
  };

  const columns: Column<Student>[] = [
    {
      header: 'App ID',
      accessorKey: 'studentId',
      sortable: true,
    },
    {
      header: 'Applicant',
      accessorKey: 'firstName',
      sortable: true,
      cell: (item) => (
        <div>
          <p className="font-semibold text-slate-950 dark:text-white">
            {item.firstName} {item.lastName}
          </p>
          <p className="text-xs text-secondary font-light mt-0.5">{item.gender} • {item.classLevel}</p>
        </div>
      ),
    },
    {
      header: 'Guardian Contact',
      accessorKey: 'guardian',
      cell: (item) => (
        <div>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.guardian.name}</p>
          <p className="text-xs text-secondary font-light mt-0.5">{item.guardian.phone}</p>
        </div>
      ),
    },
    {
      header: 'Application Status',
      accessorKey: 'status',
      sortable: true,
      cell: (item) => {
        const variant = 
          item.status === 'accepted' ? 'success' :
          item.status === 'under_review' ? 'warning' :
          item.status === 'rejected' ? 'danger' : 'primary';
        
        return <Badge variant={variant} className="capitalize">{item.status.replace('_', ' ')}</Badge>;
      },
    },
    {
      header: 'Pipeline Action',
      accessorKey: 'actions',
      cell: (item) => {
        const name = `${item.firstName} ${item.lastName}`;
        return (
          <div className="flex items-center gap-2">
            {item.status === 'applied' && (
              <Button
                variant="outline"
                size="sm"
                className="py-1 px-2 text-xs"
                onClick={() => handleStatusTransition(item.id, name, 'under_review')}
              >
                Review
              </Button>
            )}
            
            {item.status === 'under_review' && (
              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 py-1 px-2 text-xs"
                  onClick={() => handleStatusTransition(item.id, name, 'accepted')}
                >
                  <Check className="h-3 w-3 mr-1" /> Accept
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200 py-1 px-2 text-xs"
                  onClick={() => handleStatusTransition(item.id, name, 'rejected')}
                >
                  <X className="h-3 w-3 mr-1" /> Reject
                </Button>
              </div>
            )}

            {item.status === 'accepted' && (
              <Button
                variant="primary"
                size="sm"
                className="bg-success-600 hover:bg-success-700 text-white shadow-success py-1 px-2 text-xs"
                onClick={() => handleStatusTransition(item.id, name, 'enrolled')}
              >
                <UserPlus className="h-3 w-3 mr-1" /> Official Enroll
              </Button>
            )}

            {item.status === 'rejected' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-500 py-1 px-2 text-xs"
                onClick={() => handleStatusTransition(item.id, name, 'applied')}
              >
                Re-apply
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <PageWrapper
      title="Admissions & Pipelines"
      subtitle="Track, evaluate and process student registration applications from initial application through final enrollment."
      breadcrumbs={[
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Students', path: '/students' },
        { label: 'Admissions' },
      ]}
    >
      <div className="space-y-6">
        {/* Filters Panel */}
        <Card>
          <CardBody className="grid grid-3 gap-4">
            <Input
              label="Search Applicants"
              placeholder="Search by name, reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <Select
              label="Pipeline Stage"
              placeholder="All Application Stages"
              value={pipelineFilter}
              onChange={(e) => setPipelineFilter(e.target.value as AdmissionStatus | 'all')}
              options={[
                { value: 'applied', label: 'Applied' },
                { value: 'under_review', label: 'Under Review' },
                { value: 'accepted', label: 'Accepted' },
                { value: 'rejected', label: 'Rejected' },
              ]}
            />
          </CardBody>
        </Card>

        {/* Pipeline DataTable */}
        <Card>
          <CardBody className="p-0">
            <DataTable
              data={admissionApplications}
              columns={columns}
              pageSize={10}
            />
          </CardBody>
        </Card>
      </div>
    </PageWrapper>
  );
}
