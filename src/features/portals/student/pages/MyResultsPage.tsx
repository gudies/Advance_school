import { useMemo } from 'react';
import { useAuthStore } from '../../../../stores/authStore';
import { useStudent } from '../hooks/useStudent';
import { PageWrapper } from '../../../../components/layout/PageWrapper';
import { Card, CardHeader, CardTitle, CardBody } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { DataTable, Column } from '../../../../components/data-display/DataTable';
import { Award, Percent } from 'lucide-react';

export default function MyResultsPage() {
  const { user } = useAuthStore();
  const studentName = useMemo(() => ({
    firstName: user?.firstName || 'Akua',
    lastName: user?.lastName || 'Adjei'
  }), [user]);

interface StudentResultRecord {
  id: string;
  assessmentId: string;
  studentId: string;
  score: number;
  comments?: string;
  assessmentName: string;
  subject: string;
  type: string;
  grade: string;
  remark: string;
}

  const { results } = useStudent(studentName);

  const columns: Column<StudentResultRecord>[] = [
    {
      header: 'Subject',
      accessorKey: 'subject',
      sortable: true
    },
    {
      header: 'Assessment Title',
      accessorKey: 'assessmentName',
      sortable: true
    },
    {
      header: 'Type',
      accessorKey: 'type',
      sortable: true,
      cell: (item) => (
        <Badge variant={item.type === 'end_of_term' ? 'success' : 'primary'} className="capitalize">
          {item.type.replace('_', ' ')}
        </Badge>
      )
    },
    {
      header: 'Score Achieved',
      accessorKey: 'score',
      sortable: true,
      cell: (item) => <span className="font-bold">{item.score} / 100</span>
    },
    {
      header: 'Grade Point',
      accessorKey: 'grade',
      sortable: true,
      cell: (item) => (
        <Badge variant={Number(item.grade) <= 3 ? 'success' : Number(item.grade) <= 6 ? 'warning' : 'danger'}>
          Grade {item.grade}
        </Badge>
      )
    },
    {
      header: 'Comments',
      accessorKey: 'remark'
    }
  ];

  const breadcrumbs = [
    { label: 'Student Portal', path: '/student' },
    { label: 'My Results' }
  ];

  return (
    <PageWrapper
      title="My Academic Results"
      subtitle="Examine your continuous assessment logs, term reports, and academic status."
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Table */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="text-primary-500" size={18} />
                  Terminal Assessment Results Register
                </CardTitle>
              </CardHeader>
              <CardBody>
                <DataTable
                  columns={columns}
                  data={results}
                  searchPlaceholder="Search by subject..."
                  searchKey="subject"
                />
              </CardBody>
            </Card>
          </div>

          {/* Academic Summary Widget */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="text-indigo-500" size={18} />
                Academic Summary Card
              </CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="text-center p-6 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <div className="text-5xl font-black text-primary-600 mb-2 font-heading">
                  {results.length > 0
                    ? Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length)
                    : 0}%
                </div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Term Average Grade</div>
              </div>

              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-xs rounded-xl leading-relaxed text-slate-600 dark:text-slate-400 font-light">
                <strong>Progress Notice:</strong> You are performing exceptionally well in Mathematics and Sciences. Maintain this standard to secure top term grades!
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
