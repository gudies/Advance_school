import { useState, useMemo } from 'react';
import { PageWrapper } from '../../../../components/layout/PageWrapper';
import { Card, CardBody, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Badge } from '../../../../components/ui/Badge';
import { Modal } from '../../../../components/ui/Modal';
import { DataTable, Column } from '../../../../components/data-display/DataTable';
import { EmptyState } from '../../../../components/data-display/EmptyState';
import { StatCard } from '../../../../components/data-display/StatCard';
import { LocalStorageAdapter } from '../../../../services/adapters/localStorageAdapter';
import { useNotificationStore } from '../../../../stores/notificationStore';
import { PenTool, Plus, BookOpen, Clock, Users } from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  classLevel: string;
  dueDate: string;
  submissionsCount: number;
  totalStudents: number;
  status: 'active' | 'closed';
}

export default function TeacherAssignmentsPage() {
  const addToast = useNotificationStore((state) => state.addToast);
  const adapter = useMemo(() => new LocalStorageAdapter<Assignment>('advance_assignments'), []);

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const list = adapter.getAll();
    if (list.length === 0) {
      const seed: Assignment[] = [
        {
          id: 'asg_1',
          title: 'Algebraic Expressions Practice',
          description: 'Solve problems on page 42, questions 1 to 10 in your Mathematics coursebook. Show all working steps.',
          subject: 'Mathematics',
          classLevel: 'JHS 1',
          dueDate: '2026-06-18',
          submissionsCount: 10,
          totalStudents: 12,
          status: 'active'
        },
        {
          id: 'asg_2',
          title: 'Introduction to HTML & CSS',
          description: 'Create a simple static webpage about your favorite hobby using basic tags. Submit HTML file.',
          subject: 'ICT & Technology',
          classLevel: 'JHS 2',
          dueDate: '2026-06-22',
          submissionsCount: 4,
          totalStudents: 10,
          status: 'active'
        },
        {
          id: 'asg_3',
          title: 'Integrated Science Lab Report 2',
          description: 'Write a summary of the photosynthesis experiment conducted in the lab on Wednesday.',
          subject: 'General Sciences',
          classLevel: 'JHS 3',
          dueDate: '2026-06-12',
          submissionsCount: 11,
          totalStudents: 11,
          status: 'closed'
        }
      ];
      seed.forEach(x => adapter.create(x));
      return seed;
    }
    return list;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [classLevel, setClassLevel] = useState('JHS 1');
  const [dueDate, setDueDate] = useState('');

  const refreshAssignments = () => {
    setAssignments(adapter.getAll());
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newAsg: Assignment = {
      id: `asg_${Math.random().toString(36).substring(7)}`,
      title,
      description,
      subject,
      classLevel,
      dueDate,
      submissionsCount: 0,
      totalStudents: classLevel === 'JHS 1' ? 12 : classLevel === 'JHS 2' ? 10 : 11,
      status: 'active'
    };

    adapter.create(newAsg);
    refreshAssignments();
    setIsModalOpen(false);

    // Clear fields
    setTitle('');
    setDescription('');
    setDueDate('');

    addToast({
      type: 'success',
      message: 'New homework assignment created!'
    });
  };

  const handleToggleStatus = (id: string, currentStatus: 'active' | 'closed') => {
    adapter.update(id, {
      status: currentStatus === 'active' ? 'closed' : 'active'
    });
    refreshAssignments();
    addToast({
      type: 'info',
      message: `Assignment marked as ${currentStatus === 'active' ? 'closed' : 'active'}.`
    });
  };

  const stats = useMemo(() => {
    const active = assignments.filter(a => a.status === 'active').length;
    const closed = assignments.filter(a => a.status === 'closed').length;
    const totalSubmissions = assignments.reduce((sum, a) => sum + a.submissionsCount, 0);
    return {
      active,
      closed,
      totalSubmissions,
      total: assignments.length
    };
  }, [assignments]);

  const columns: Column<Assignment>[] = [
    {
      header: 'Assignment Details',
      accessorKey: 'title',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-50 dark:bg-primary-950/20 text-primary-600 rounded-lg shrink-0">
            <PenTool size={16} />
          </div>
          <div>
            <span className="font-semibold text-slate-900 dark:text-white">{row.title}</span>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 max-w-[200px] truncate" title={row.description}>
              {row.description}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Subject & Class',
      accessorKey: 'subject',
      cell: (row) => (
        <div>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{row.subject}</span>
          <div className="text-[10px] text-slate-400 capitalize">Class Level: {row.classLevel}</div>
        </div>
      )
    },
    {
      header: 'Submissions',
      accessorKey: 'submissionsCount',
      cell: (row) => {
        const pct = Math.round((row.submissionsCount / row.totalStudents) * 100);
        return (
          <div>
            <span className="font-bold text-slate-900 dark:text-white">{row.submissionsCount}/{row.totalStudents}</span>
            <span className="text-[10px] text-slate-500 ml-1">({pct}%)</span>
          </div>
        );
      }
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
      cell: (row) => (
        <Badge variant={row.status === 'active' ? 'success' : 'neutral'} className="capitalize">
          {row.status}
        </Badge>
      )
    },
    {
      header: 'Action',
      accessorKey: 'id',
      cell: (row) => (
        <Button
          variant="outline"
          size="sm"
          className="py-1 px-2"
          onClick={() => handleToggleStatus(row.id, row.status)}
        >
          {row.status === 'active' ? 'Close' : 'Reopen'}
        </Button>
      )
    }
  ];

  return (
    <PageWrapper
      title="Homework Assignments"
      subtitle="Publish assignments, monitor student submissions rates, and manage timelines."
      breadcrumbs={[
        { label: 'Teacher Portal', path: '/teacher' },
        { label: 'Assignments' }
      ]}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Active Assignments"
          value={stats.active}
          icon={<Clock className="text-success-500" />}
        />
        <StatCard
          title="Total Submissions"
          value={stats.totalSubmissions}
          icon={<Users className="text-primary-500" />}
        />
        <StatCard
          title="Closed Inactive"
          value={stats.closed}
          icon={<BookOpen className="text-slate-500" />}
        />
        <StatCard
          title="Total Workbooks"
          value={stats.total}
          icon={<PenTool className="text-indigo-500" />}
        />
      </div>

      {/* Main card */}
      <Card>
        <CardHeader className="flex-between">
          <CardTitle>Assignments Ledger</CardTitle>
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Assignment
          </Button>
        </CardHeader>
        <CardBody className="p-0">
          {assignments.length > 0 ? (
            <DataTable data={assignments} columns={columns} />
          ) : (
            <div className="p-6">
              <EmptyState
                title="No Assignments"
                description="You have not published any homework assignments yet."
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Create Assignment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Homework Assignment"
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Assignment Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Solve Quadratic Equations..."
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              options={[
                { value: 'Mathematics', label: 'Mathematics' },
                { value: 'ICT & Technology', label: 'ICT & Technology' },
                { value: 'General Sciences', label: 'General Sciences' }
              ]}
            />
            <Select
              label="Class Level"
              value={classLevel}
              onChange={(e) => setClassLevel(e.target.value)}
              options={[
                { value: 'JHS 1', label: 'JHS Level 1' },
                { value: 'JHS 2', label: 'JHS Level 2' },
                { value: 'JHS 3', label: 'JHS Level 3' }
              ]}
            />
          </div>
          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-secondary mb-1">Instructions</label>
            <textarea
              className="w-full bg-surface-secondary border border-border-primary rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-900"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="State the homework guidelines, questions, textbook references, and format details..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border-secondary">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Publish Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
