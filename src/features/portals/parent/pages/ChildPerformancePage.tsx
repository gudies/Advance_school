import { useState, useMemo } from 'react';
import { useAuthStore } from '../../../../stores/authStore';
import { useParent } from '../hooks/useParent';
import { PageWrapper } from '../../../../components/layout/PageWrapper';
import { Card, CardHeader, CardTitle, CardBody } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { DataTable, Column } from '../../../../components/data-display/DataTable';
import { FileDown, Award, Percent } from 'lucide-react';
import { useNotificationStore } from '../../../../stores/notificationStore';

export default function ChildPerformancePage() {
  const { user } = useAuthStore();
  const parentEmail = user?.email || 'parent@camiedbehills.edu.gh';
  
  const { children, getResultsForChild } = useParent(parentEmail);
  const addToast = useNotificationStore((state) => state.addToast);
  
  const [selectedChildId, setSelectedChildId] = useState<string>(() => {
    return children.length > 0 ? children[0].id : '';
  });

  const activeChild = useMemo(() => {
    return children.find(c => c.id === selectedChildId) || null;
  }, [children, selectedChildId]);

  const results = useMemo(() => {
    if (!activeChild) return [];
    return getResultsForChild(activeChild.id);
  }, [activeChild, getResultsForChild]);

  const handleDownloadReport = () => {
    addToast({ type: 'info', message: 'Downloading full academic report card...' });
    setTimeout(() => {
      addToast({ type: 'success', message: 'Report card PDF downloaded successfully!' });
    }, 1500);
  };

interface ChildPerformanceRecord {
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

  const columns: Column<ChildPerformanceRecord>[] = [
    {
      header: 'Subject Name',
      accessorKey: 'subject',
      sortable: true
    },
    {
      header: 'Assessment Title',
      accessorKey: 'assessmentName',
      sortable: true
    },
    {
      header: 'Assessment Type',
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
      header: 'Teacher Remarks',
      accessorKey: 'remark'
    }
  ];

  const breadcrumbs = [
    { label: 'Parent Portal', path: '/parent' },
    { label: 'Academic Performance' }
  ];

  return (
    <PageWrapper
      title="Academic Performance"
      subtitle="Examine your child's continuous test logs, terminal scores, and subject-wise positions."
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Child Selector */}
        {children.length > 1 && (
          <div className="flex items-center gap-3 p-4 bg-surface-primary rounded-xl border border-border-secondary">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Select Child:</span>
            <div className="flex gap-2">
              {children.map(child => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChildId(child.id)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                    selectedChildId === child.id 
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' 
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {child.firstName} {child.lastName}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeChild ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left - Grid of classes/grades list */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="flex justify-between items-center flex-row">
                  <CardTitle className="flex items-center gap-2">
                    <Award className="text-primary-500" size={18} />
                    Grades & Assessment Results
                  </CardTitle>
                  <button
                    onClick={handleDownloadReport}
                    className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-sm shadow-primary-600/15"
                  >
                    <FileDown size={14} /> Download PDF Report Card
                  </button>
                </CardHeader>
                <CardBody>
                  <DataTable
                    columns={columns}
                    data={results}
                    searchPlaceholder="Search by subject or exam title..."
                    searchKey="subject"
                  />
                </CardBody>
              </Card>
            </div>

            {/* Right - Overview & Recommendations */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Percent className="text-indigo-500" size={18} />
                    Academic Summary
                  </CardTitle>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div className="text-center p-6 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <div className="text-5xl font-black text-primary-600 mb-2 font-heading">
                      {results.length > 0
                        ? Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length)
                        : 0}%
                    </div>
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">Cumulative Subject Average</div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Teacher Guidance & Remarks</h4>
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-lg text-xs leading-relaxed text-slate-600 dark:text-slate-400 font-light">
                      Akua has demonstrated exceptional understanding in mathematics and sciences this term. Continuous focus on homework will maintain these outstanding levels. Keep up the good work!
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        ) : (
          <div className="p-8 bg-surface-primary rounded-xl border border-border-secondary text-center text-slate-400">
            No children profiles to evaluate.
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
