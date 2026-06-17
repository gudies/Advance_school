import { useState, useMemo } from 'react';
import { useStudents } from '../../students/hooks/useStudents';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { DataTable, Column } from '../../../components/data-display/DataTable';
import { EmptyState } from '../../../components/data-display/EmptyState';
import { StatCard } from '../../../components/data-display/StatCard';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';
import { LocalStorageAdapter } from '../../../services/adapters/localStorageAdapter';
import { AttendanceRecord } from '../../../types';
import { Users, CheckCircle, Clock, AlertTriangle, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AcademicAttendancePage() {
  const { students } = useStudents();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  const attendanceAdapter = useMemo(() => new LocalStorageAdapter<AttendanceRecord>('advance_student_attendance'), []);

  const attendanceList = useMemo(() => {
    return attendanceAdapter.getAll();
  }, [attendanceAdapter]);

  // Daily Roster for the selected date
  const dailyRoster = useMemo(() => {
    return students.map(student => {
      // Find today's attendance
      const record = attendanceList.find(a => a.studentId === student.id && a.date === selectedDate);
      return {
        id: student.id,
        studentId: student.studentId,
        name: `${student.firstName} ${student.lastName}`,
        classLevel: student.classLevel,
        status: record ? record.status : 'unrecorded',
        notes: record ? record.notes : ''
      };
    });
  }, [students, attendanceList, selectedDate]);

  // Filtered Daily Roster
  const filteredRoster = useMemo(() => {
    return dailyRoster.filter(row => {
      const matchesSearch = row.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            row.studentId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = selectedClass === 'all' || row.classLevel === selectedClass;
      return matchesSearch && matchesClass;
    });
  }, [dailyRoster, searchTerm, selectedClass]);

  // Statistics for selected date
  const stats = useMemo(() => {
    const activeStudents = dailyRoster.length;
    const present = dailyRoster.filter(r => r.status === 'present').length;
    const late = dailyRoster.filter(r => r.status === 'late').length;
    const absent = dailyRoster.filter(r => r.status === 'absent').length;
    const excused = dailyRoster.filter(r => r.status === 'excused').length;
    const unrecorded = dailyRoster.filter(r => r.status === 'unrecorded').length;

    const recordedCount = present + late + absent + excused;
    const attendanceRate = recordedCount > 0 ? ((present + late) / recordedCount) * 100 : 100;

    return {
      activeStudents,
      present,
      late,
      absent,
      excused,
      unrecorded,
      attendanceRate: attendanceRate.toFixed(1) + '%'
    };
  }, [dailyRoster]);

  // Class-wise charts data
  const classChartData = useMemo(() => {
    const classData: Record<string, { present: number; total: number }> = {};
    
    // Group records by class level
    dailyRoster.forEach(r => {
      if (r.status !== 'unrecorded') {
        if (!classData[r.classLevel]) {
          classData[r.classLevel] = { present: 0, total: 0 };
        }
        classData[r.classLevel].total++;
        if (r.status === 'present' || r.status === 'late') {
          classData[r.classLevel].present++;
        }
      }
    });

    return Object.entries(classData).map(([className, data]) => ({
      class: className,
      rate: data.total > 0 ? Math.round((data.present / data.total) * 100) : 100
    }));
  }, [dailyRoster]);

interface RosterEntry {
  id: string;
  studentId: string;
  name: string;
  classLevel: string;
  status: string;
  notes?: string;
}

  const columns: Column<RosterEntry>[] = [
    {
      header: 'Student ID',
      accessorKey: 'studentId',
      cell: (row) => <span className="font-mono text-xs font-semibold">{row.studentId}</span>
    },
    {
      header: 'Student Name',
      accessorKey: 'name',
      cell: (row) => <span className="font-medium text-slate-900 dark:text-white">{row.name}</span>
    },
    {
      header: 'Class Level',
      accessorKey: 'classLevel',
      cell: (row) => <span className="capitalize">{row.classLevel}</span>
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => {
        const variants: Record<string, 'neutral' | 'success' | 'danger' | 'warning' | 'primary'> = {
          present: 'success',
          late: 'warning',
          absent: 'danger',
          excused: 'neutral',
          unrecorded: 'neutral'
        };
        return (
          <Badge variant={variants[row.status] || 'neutral'} className="capitalize">
            {row.status}
          </Badge>
        );
      }
    },
    {
      header: 'Notes / Remarks',
      accessorKey: 'notes',
      cell: (row) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {row.notes || <span className="italic text-slate-300 dark:text-slate-600">None</span>}
        </span>
      )
    }
  ];

  return (
    <PageWrapper
      title="Student Attendance Center"
      subtitle="Monitor school-wide student attendance, evaluate class-wise check-ins, and inspect absentees."
      breadcrumbs={[
        { label: 'Academic Reports', path: '/academics' },
        { label: 'Attendance logs' }
      ]}
    >
      {/* Date & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-end justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-border-secondary shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Input
            label="Log Date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full sm:w-48"
          />
          <Select
            label="Filter Class"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            options={[
              { value: 'all', label: 'All Classes' },
              { value: 'JHS 1', label: 'JHS Level 1' },
              { value: 'JHS 2', label: 'JHS Level 2' },
              { value: 'JHS 3', label: 'JHS Level 3' },
              { value: 'Primary 1', label: 'Primary 1' },
              { value: 'Primary 2', label: 'Primary 2' }
            ]}
            className="w-full sm:w-40"
          />
        </div>
        
        <div className="relative w-full sm:w-64">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student ID or name..."
            className="w-full pl-9"
          />
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Attendance Rate"
          value={stats.attendanceRate}
          icon={<CheckCircle className="text-success-500" />}
          className="bg-success-50/10"
        />
        <StatCard
          title="Present Today"
          value={stats.present + stats.late}
          icon={<Users className="text-primary-500" />}
        />
        <StatCard
          title="Absentees"
          value={stats.absent}
          icon={<AlertTriangle className="text-danger-500" />}
        />
        <StatCard
          title="Unrecorded"
          value={stats.unrecorded}
          icon={<Clock className="text-warning-500" />}
        />
      </div>

      {/* Split grid for list and charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roster list */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Daily Attendance Roster</CardTitle>
            </CardHeader>
            <CardBody className="p-0">
              {filteredRoster.length > 0 ? (
                <DataTable data={filteredRoster} columns={columns} />
              ) : (
                <div className="p-6">
                  <EmptyState
                    title="No Records Found"
                    description="No student attendance records matched your filter criteria."
                  />
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Charts */}
        <div className="col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Class Attendance %</CardTitle>
            </CardHeader>
            <CardBody className="flex flex-col justify-center items-center h-[300px]">
              {classChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-secondary)" />
                    <XAxis dataKey="class" tickLine={false} tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} unit="%" tickLine={false} tick={{ fontSize: 10 }} />
                    <Tooltip cursor={{ fill: 'transparent' }} formatter={(val) => [`${val}%`, 'Attendance Rate']} />
                    <Bar dataKey="rate" fill="var(--color-primary-500)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-slate-400 text-xs py-12">No class stats recorded for this date.</div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
