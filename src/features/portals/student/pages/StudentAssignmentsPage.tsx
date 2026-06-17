import { useState, useMemo } from 'react';
import { useAuthStore } from '../../../../stores/authStore';
import { useStudent } from '../hooks/useStudent';
import { PageWrapper } from '../../../../components/layout/PageWrapper';
import { Card, CardBody, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { DataTable, Column } from '../../../../components/data-display/DataTable';
import { EmptyState } from '../../../../components/data-display/EmptyState';
import { StatCard } from '../../../../components/data-display/StatCard';
import { LocalStorageAdapter } from '../../../../services/adapters/localStorageAdapter';
import { useNotificationStore } from '../../../../stores/notificationStore';
import { CheckCircle, Clock, ClipboardList } from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  classLevel: string;
  dueDate: string;
  status: 'active' | 'closed';
}

interface StudentSubmission {
  id: string;
  studentId: string;
  assignmentId: string;
}

export default function StudentAssignmentsPage() {
  const { user } = useAuthStore();
  const addToast = useNotificationStore((state) => state.addToast);
  
  const studentName = useMemo(() => {
    return {
      firstName: user?.firstName || 'Akua',
      lastName: user?.lastName || 'Adjei'
    };
  }, [user]);

  const { student } = useStudent(studentName);

  const assignmentsAdapter = useMemo(() => new LocalStorageAdapter<Assignment>('advance_assignments'), []);
  const submissionsAdapter = useMemo(() => new LocalStorageAdapter<StudentSubmission>('advance_submissions'), []);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { assignments, submittedIds } = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    refreshTrigger;
    if (!student) return { assignments: [], submittedIds: [] };
    const all = assignmentsAdapter.getAll();
    const classLevelShort = student.classLevel.replace('Level ', '');
    const matched = all.filter(a => a.classLevel === classLevelShort || a.classLevel === student.classLevel);

    const subs = submissionsAdapter.getWhere(s => s.studentId === student.id);
    return {
      assignments: matched,
      submittedIds: subs.map(s => s.assignmentId)
    };
  }, [student, assignmentsAdapter, submissionsAdapter, refreshTrigger]);

  const handleSubmitting = (assignmentId: string) => {
    if (!student) return;
    submissionsAdapter.create({
      studentId: student.id,
      assignmentId
    });
    setRefreshTrigger(prev => prev + 1);
    addToast({
      type: 'success',
      message: 'Homework assignment submitted successfully!'
    });
  };

  const stats = useMemo(() => {
    const total = assignments.length;
    const submitted = assignments.filter(a => submittedIds.includes(a.id)).length;
    const pending = assignments.filter(a => a.status === 'active' && !submittedIds.includes(a.id)).length;
    return {
      total,
      submitted,
      pending
    };
  }, [assignments, submittedIds]);

  const columns: Column<Assignment>[] = [
    {
      header: 'Subject',
      accessorKey: 'subject',
      cell: (row) => <span className="font-semibold text-slate-900 dark:text-white">{row.subject}</span>
    },
    {
      header: 'Title & Instructions',
      accessorKey: 'title',
      cell: (row) => (
        <div>
          <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{row.title}</span>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed max-w-[300px]" title={row.description}>
            {row.description}
          </div>
        </div>
      )
    },
    {
      header: 'Due Date',
      accessorKey: 'dueDate',
      cell: (row) => (
        <span className="font-mono text-xs text-slate-600 dark:text-slate-400">{row.dueDate}</span>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => {
        const isSubmitted = submittedIds.includes(row.id);
        if (isSubmitted) {
          return <Badge variant="success">Submitted</Badge>;
        }
        return (
          <Badge variant={row.status === 'active' ? 'warning' : 'neutral'} className="capitalize">
            {row.status === 'active' ? 'Pending' : 'Closed'}
          </Badge>
        );
      }
    },
    {
      header: 'Action',
      accessorKey: 'id',
      cell: (row) => {
        const isSubmitted = submittedIds.includes(row.id);
        const isActive = row.status === 'active';
        return (
          <Button
            variant={isSubmitted ? 'ghost' : 'primary'}
            size="sm"
            disabled={isSubmitted || !isActive}
            onClick={() => handleSubmitting(row.id)}
            className="py-1 px-3"
          >
            {isSubmitted ? 'Already Submitted' : !isActive ? 'Closed' : 'Submit Homework'}
          </Button>
        );
      }
    }
  ];

  if (!student) {
    return (
      <PageWrapper title="My Assignments">
        <EmptyState title="Student Profile Not Found" description="Could not map your logged in session with a student record." />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="My Assignments"
      subtitle={`Track your course assignments, check due dates, and upload homework for ${student.firstName} ${student.lastName}.`}
      breadcrumbs={[
        { label: 'Student Portal', path: '/student' },
        { label: 'My Assignments' }
      ]}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Homework"
          value={stats.total}
          icon={<ClipboardList className="text-primary-500" />}
        />
        <StatCard
          title="Submitted Tasks"
          value={stats.submitted}
          icon={<CheckCircle className="text-success-500" />}
        />
        <StatCard
          title="Pending Submissions"
          value={stats.pending}
          icon={<Clock className="text-warning-500" />}
          className={stats.pending > 0 ? 'bg-warning-50/10' : ''}
        />
      </div>

      {/* Main card */}
      <Card>
        <CardHeader>
          <CardTitle>My Assignments List</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          {assignments.length > 0 ? (
            <DataTable data={assignments} columns={columns} />
          ) : (
            <div className="p-6">
              <EmptyState
                title="No Assignments"
                description="Hooray! No homework assignments have been published for your class."
              />
            </div>
          )}
        </CardBody>
      </Card>
    </PageWrapper>
  );
}
