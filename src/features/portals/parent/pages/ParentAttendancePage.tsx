import { useState, useMemo } from 'react';
import { useAuthStore } from '../../../../stores/authStore';
import { useParent } from '../hooks/useParent';
import { PageWrapper } from '../../../../components/layout/PageWrapper';
import { Card, CardBody, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { DataTable, Column } from '../../../../components/data-display/DataTable';
import { EmptyState } from '../../../../components/data-display/EmptyState';
import { StatCard } from '../../../../components/data-display/StatCard';
import { Badge } from '../../../../components/ui/Badge';
import { Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { AttendanceRecord } from '../../../../types/student';

export default function ParentAttendancePage() {
  const { user } = useAuthStore();
  const parentEmail = user?.email || 'parent@camiedbehills.edu.gh';
  
  const { children, getAttendanceForChild } = useParent(parentEmail);
  
  const [selectedChildId, setSelectedChildId] = useState<string>(() => {
    return children.length > 0 ? children[0].id : '';
  });

  const activeChild = useMemo(() => {
    return children.find(c => c.id === selectedChildId) || null;
  }, [children, selectedChildId]);

  const childAttendance = useMemo(() => {
    if (!activeChild) return [];
    return getAttendanceForChild(activeChild.id).sort((a, b) => b.date.localeCompare(a.date));
  }, [activeChild, getAttendanceForChild]);

  const stats = useMemo(() => {
    if (childAttendance.length === 0) {
      return { total: 0, present: 0, absent: 0, late: 0, rate: 100 };
    }
    const total = childAttendance.length;
    const present = childAttendance.filter(a => a.status === 'present').length;
    const late = childAttendance.filter(a => a.status === 'late').length;
    const absent = childAttendance.filter(a => a.status === 'absent').length;
    const rate = Math.round(((present + late) / total) * 100);

    return { total, present, absent, late, rate };
  }, [childAttendance]);

  const columns: Column<AttendanceRecord>[] = [
    {
      header: 'Date',
      accessorKey: 'date',
      cell: (row) => <span className="font-mono text-xs font-semibold">{row.date}</span>
    },
    {
      header: 'Attendance Status',
      accessorKey: 'status',
      cell: (row) => {
        const variants: Record<string, 'neutral' | 'success' | 'danger' | 'warning' | 'primary'> = {
          present: 'success',
          late: 'warning',
          absent: 'danger',
          excused: 'neutral'
        };
        return (
          <Badge variant={variants[row.status] || 'neutral'} className="capitalize">
            {row.status}
          </Badge>
        );
      }
    },
    {
      header: 'Check-In Details / Notes',
      accessorKey: 'notes',
      cell: (row) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {row.notes || <span className="italic text-slate-350 dark:text-slate-650">No notes recorded</span>}
        </span>
      )
    }
  ];

  return (
    <PageWrapper
      title="Child Attendance Report"
      subtitle="Monitor your child's daily class check-ins, punctuality records, and monthly rates."
      breadcrumbs={[
        { label: 'Parent Portal', path: '/parent' },
        { label: 'Attendance logs' }
      ]}
    >
      {/* Selector for children */}
      {children.length > 1 && (
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-border-secondary shadow-sm mb-6 w-fit">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-450">Select Child:</span>
          <select
            value={selectedChildId}
            onChange={(e) => setSelectedChildId(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-850 dark:border-slate-700 dark:text-white"
          >
            {children.map(c => (
              <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
            ))}
          </select>
        </div>
      )}

      {activeChild ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Attendance Rate"
              value={`${stats.rate}%`}
              icon={<CheckCircle className="text-success-500" />}
              className="bg-success-50/10"
            />
            <StatCard
              title="Days Present"
              value={stats.present}
              icon={<Calendar className="text-primary-500" />}
            />
            <StatCard
              title="Days Late"
              value={stats.late}
              icon={<Clock className="text-warning-500" />}
            />
            <StatCard
              title="Days Absent"
              value={stats.absent}
              icon={<AlertTriangle className="text-danger-500" />}
            />
          </div>

          {/* Roster list */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Log: {activeChild.firstName} {activeChild.lastName}</CardTitle>
            </CardHeader>
            <CardBody className="p-0">
              {childAttendance.length > 0 ? (
                <DataTable data={childAttendance} columns={columns} />
              ) : (
                <div className="p-6">
                  <EmptyState
                    title="No Records Found"
                    description="No attendance logs found for this child."
                  />
                </div>
              )}
            </CardBody>
          </Card>
        </>
      ) : (
        <EmptyState
          title="No Children Linked"
          description="We could not find any student accounts linked to your guardian profile."
        />
      )}
    </PageWrapper>
  );
}
