import { useState, useMemo } from 'react';
import { useAuthStore } from '../../../../stores/authStore';
import { useTeacher } from '../hooks/useTeacher';
import { PageWrapper } from '../../../../components/layout/PageWrapper';
import { Card, CardHeader, CardTitle, CardBody } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { ClassLevel, CLASS_LEVELS } from '../../../../types/common';
import { Student, AttendanceRecord } from '../../../../types/student';
import { useNotificationStore } from '../../../../stores/notificationStore';
import { LocalStorageAdapter } from '../../../../services/adapters/localStorageAdapter';
import { Save, CalendarRange, Check, X, Eye, Clock } from 'lucide-react';

const CLASS_OPTIONS = CLASS_LEVELS.map(c => ({ value: c, label: c }));

export default function MarkAttendancePage() {
  const { user } = useAuthStore();
  const teacherEmail = user?.email || 'teacher@camiedbehills.edu.gh';
  
  const { getStudentsByClass, saveClassAttendance, getClassAttendanceForDate } = useTeacher(teacherEmail);
  const addToast = useNotificationStore((state) => state.addToast);

  const [selectedClass, setSelectedClass] = useState<ClassLevel>('JHS 1');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  
  const students = useMemo(() => {
    return getStudentsByClass(selectedClass);
  }, [selectedClass, getStudentsByClass]);

  // Track attendance entries in state
  const [entries, setEntries] = useState<Record<string, { status: AttendanceRecord['status']; notes: string }>>(() => {
    const initialDate = new Date().toISOString().split('T')[0];
    const tempStudentAdapter = new LocalStorageAdapter<Student>('advance_students');
    const classStudents = tempStudentAdapter.getAll().filter(s => s.classLevel === 'JHS 1' && s.status === 'active');
    
    const tempAttendanceAdapter = new LocalStorageAdapter<AttendanceRecord>('advance_attendance');
    const existing = tempAttendanceAdapter.getAll().filter(a => a.date === initialDate);

    const initialEntries: Record<string, { status: AttendanceRecord['status']; notes: string }> = {};
    classStudents.forEach((student) => {
      const match = existing.find(e => e.studentId === student.id);
      initialEntries[student.id] = {
        status: match ? match.status : 'present',
        notes: match ? match.notes || '' : ''
      };
    });
    return initialEntries;
  });

  const handleStatusChange = (studentId: string, status: AttendanceRecord['status']) => {
    setEntries((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setEntries((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes
      }
    }));
  };

  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    const records = students.map((student) => {
      const entry = entries[student.id] || { status: 'present', notes: '' };
      return {
        studentId: student.id,
        status: entry.status,
        notes: entry.notes
      };
    });

    const success = saveClassAttendance(selectedClass, selectedDate, records);
    if (success) {
      addToast({ type: 'success', message: `Attendance for ${selectedClass} on ${selectedDate} saved successfully!` });
    } else {
      addToast({ type: 'error', message: 'Failed to save attendance logs.' });
    }
  };

  const attendanceSummary = useMemo(() => {
    const values = Object.values(entries);
    const total = values.length;
    const present = values.filter(v => v.status === 'present').length;
    const absent = values.filter(v => v.status === 'absent').length;
    const late = values.filter(v => v.status === 'late').length;
    const excused = values.filter(v => v.status === 'excused').length;

    return { total, present, absent, late, excused };
  }, [entries]);

  const breadcrumbs = [
    { label: 'Teacher Portal', path: '/teacher' },
    { label: 'Daily Attendance' }
  ];

  return (
    <PageWrapper
      title="Class Attendance Register"
      subtitle="Mark daily student rolls, checking present, late, excused, or absent records."
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="p-4 bg-surface-primary rounded-xl border border-border-secondary grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Class Level"
            value={selectedClass}
            onChange={(e) => {
              const val = e.target.value as ClassLevel;
              setSelectedClass(val);
              const classStudents = getStudentsByClass(val);
              const existing = getClassAttendanceForDate(val, selectedDate);
              const initialEntries: Record<string, { status: AttendanceRecord['status']; notes: string }> = {};
              classStudents.forEach((student) => {
                const match = existing.find(e => e.studentId === student.id);
                initialEntries[student.id] = {
                  status: match ? match.status : 'present',
                  notes: match ? match.notes || '' : ''
                };
              });
              setEntries(initialEntries);
            }}
            options={CLASS_OPTIONS}
          />
          <Input
            label="Select Date"
            type="date"
            value={selectedDate}
            onChange={(e) => {
              const dateVal = e.target.value;
              setSelectedDate(dateVal);
              const existing = getClassAttendanceForDate(selectedClass, dateVal);
              const initialEntries: Record<string, { status: AttendanceRecord['status']; notes: string }> = {};
              students.forEach((student) => {
                const match = existing.find(e => e.studentId === student.id);
                initialEntries[student.id] = {
                  status: match ? match.status : 'present',
                  notes: match ? match.notes || '' : ''
                };
              });
              setEntries(initialEntries);
            }}
          />
        </div>

        {/* Dashboard Statistics summary */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-border-secondary rounded-xl text-center">
            <div className="text-xl font-bold text-slate-700 dark:text-slate-300">{attendanceSummary.total}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Total Roll</div>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-center">
            <div className="text-xl font-bold text-emerald-600">{attendanceSummary.present}</div>
            <div className="text-[10px] text-emerald-500 uppercase tracking-wider mt-1">Present</div>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl text-center">
            <div className="text-xl font-bold text-amber-600">{attendanceSummary.late}</div>
            <div className="text-[10px] text-amber-500 uppercase tracking-wider mt-1">Late</div>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl text-center">
            <div className="text-xl font-bold text-indigo-600">{attendanceSummary.excused}</div>
            <div className="text-[10px] text-indigo-500 uppercase tracking-wider mt-1">Excused</div>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl text-center">
            <div className="text-xl font-bold text-rose-600">{attendanceSummary.absent}</div>
            <div className="text-[10px] text-rose-500 uppercase tracking-wider mt-1">Absent</div>
          </div>
        </div>

        {/* Form and Student list */}
        <form onSubmit={handleSaveAttendance}>
          <Card>
            <CardHeader className="flex justify-between items-center flex-row">
              <CardTitle className="flex items-center gap-2">
                <CalendarRange className="text-primary-500" size={18} />
                Student Roll Call register — {selectedClass}
              </CardTitle>
              <Button
                type="submit"
                variant="primary"
                leftIcon={<Save size={14} />}
              >
                Save Attendance Register
              </Button>
            </CardHeader>
            <CardBody className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-500 dark:text-slate-400">
                <thead className="text-[10px] text-slate-400 uppercase bg-slate-50 dark:bg-slate-900 border-b border-border-secondary">
                  <tr>
                    <th className="px-6 py-3">Student Name</th>
                    <th className="px-6 py-3 text-center">Attendance Status Selection</th>
                    <th className="px-6 py-3">Notes / Comments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-secondary">
                  {students.length > 0 ? (
                    students.map((student) => {
                      const entry = entries[student.id] || { status: 'present', notes: '' };

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                          <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                            {student.firstName} {student.lastName}
                          </td>
                          <td className="px-6 py-3 text-center">
                            <div className="inline-flex rounded-lg border border-border-secondary p-0.5 bg-slate-50 dark:bg-slate-900 gap-1">
                              <button
                                type="button"
                                onClick={() => handleStatusChange(student.id, 'present')}
                                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                                  entry.status === 'present'
                                    ? 'bg-emerald-600 text-white shadow-md'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                                }`}
                              >
                                <Check size={12} /> Present
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(student.id, 'late')}
                                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                                  entry.status === 'late'
                                    ? 'bg-amber-500 text-white shadow-md'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                                }`}
                              >
                                <Clock size={12} /> Late
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(student.id, 'excused')}
                                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                                  entry.status === 'excused'
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                                }`}
                              >
                                <Eye size={12} /> Excused
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(student.id, 'absent')}
                                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                                  entry.status === 'absent'
                                    ? 'bg-rose-600 text-white shadow-md'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                                }`}
                              >
                                <X size={12} /> Absent
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <Input
                              type="text"
                              value={entry.notes}
                              onChange={(e) => handleNotesChange(student.id, e.target.value)}
                              className="h-8 py-1 text-xs"
                              placeholder="Add reason for late/absent..."
                            />
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-slate-400">
                        No active students found in {selectedClass}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </form>
      </div>
    </PageWrapper>
  );
}
