import { useMemo } from 'react';
import { useAuthStore } from '../../../../stores/authStore';
import { useStudent } from '../hooks/useStudent';
import { PageWrapper } from '../../../../components/layout/PageWrapper';
import { Card, CardHeader, CardTitle, CardBody } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { DataTable, Column } from '../../../../components/data-display/DataTable';
import { Calendar, CheckCircle2 } from 'lucide-react';
import { AttendanceRecord } from '../../../../types/student';

export default function MyAttendancePage() {
  const { user } = useAuthStore();
  const studentName = useMemo(() => ({
    firstName: user?.firstName || 'Akua',
    lastName: user?.lastName || 'Adjei'
  }), [user]);

  const { attendance, attendanceSummary } = useStudent(studentName);

  const columns: Column<AttendanceRecord>[] = [
    {
      header: 'Date Logged',
      accessorKey: 'date',
      sortable: true,
      cell: (item) => new Date(item.date).toLocaleDateString('en-GB')
    },
    {
      header: 'Attendance Status',
      accessorKey: 'status',
      sortable: true,
      cell: (item) => (
        <Badge variant={item.status === 'present' ? 'success' : item.status === 'late' ? 'warning' : 'danger'} className="capitalize">
          {item.status}
        </Badge>
      )
    },
    {
      header: 'Notes / Explanations',
      accessorKey: 'notes'
    }
  ];

  const breadcrumbs = [
    { label: 'Student Portal', path: '/student' },
    { label: 'My Attendance' }
  ];

  return (
    <PageWrapper
      title="My Attendance Logs"
      subtitle="Track your daily class attendance record and review excused/absent logs."
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-border-secondary rounded-xl text-center">
            <div className="text-2xl font-black text-slate-700 dark:text-slate-300">{attendance.length}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Total Checked Days</div>
          </div>
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-center">
            <div className="text-2xl font-black text-emerald-600">{attendanceSummary.present}</div>
            <div className="text-[10px] text-emerald-500 uppercase tracking-wider mt-1">Present</div>
          </div>
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl text-center">
            <div className="text-2xl font-black text-amber-600">{attendanceSummary.late}</div>
            <div className="text-[10px] text-amber-500 uppercase tracking-wider mt-1">Late</div>
          </div>
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl text-center">
            <div className="text-2xl font-black text-indigo-600">{attendanceSummary.excused}</div>
            <div className="text-[10px] text-indigo-500 uppercase tracking-wider mt-1">Excused</div>
          </div>
          <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl text-center">
            <div className="text-2xl font-black text-rose-600">{attendanceSummary.absent}</div>
            <div className="text-[10px] text-rose-500 uppercase tracking-wider mt-1">Absent</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Table */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="text-primary-500" size={18} />
                  Historical Attendance Log Register
                </CardTitle>
              </CardHeader>
              <CardBody>
                <DataTable
                  columns={columns}
                  data={attendance}
                  searchPlaceholder="Search logs by date..."
                  searchKey="date"
                />
              </CardBody>
            </Card>
          </div>

          {/* Quick summary widget */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500" size={18} />
                Attendance Rating
              </CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="text-center p-6 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <div className="text-5xl font-black text-emerald-600 mb-2 font-heading">
                  {attendanceSummary.rate}%
                </div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Attendance Score</div>
              </div>

              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-xs rounded-xl leading-relaxed text-slate-600 dark:text-slate-400 font-light">
                <strong>Congratulations:</strong> Your attendance is above the target benchmark threshold (90%+). Keep up the excellent work of arriving on time every single day!
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
