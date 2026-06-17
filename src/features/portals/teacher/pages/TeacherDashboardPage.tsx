import { useMemo } from 'react';
import { useAuthStore } from '../../../../stores/authStore';
import { useTeacher } from '../hooks/useTeacher';
import { PageWrapper } from '../../../../components/layout/PageWrapper';
import { Card, CardHeader, CardTitle, CardBody } from '../../../../components/ui/Card';
import { StatCard } from '../../../../components/data-display/StatCard';
import { Link } from 'react-router-dom';
import { Users, CalendarCheck, Clock, PenTool, GraduationCap } from 'lucide-react';

export default function TeacherDashboardPage() {
  const { user } = useAuthStore();
  const teacherEmail = user?.email || 'teacher@camiedbehills.edu.gh';

  const { teacher, timetable, getStudentsByClass } = useTeacher(teacherEmail);

  // Calculate teacher dashboard stats
  const totalStudents = useMemo(() => {
    // Collect students from classLevels they teach (JHS 1, JHS 2, JHS 3)
    const jhs1 = getStudentsByClass('JHS 1').length;
    const jhs2 = getStudentsByClass('JHS 2').length;
    const jhs3 = getStudentsByClass('JHS 3').length;
    return jhs1 + jhs2 + jhs3;
  }, [getStudentsByClass]);

  const breadcrumbs = [
    { label: 'Teacher Portal' },
    { label: 'Dashboard' }
  ];

  return (
    <PageWrapper
      title={`Welcome Back, Ama`}
      subtitle="Teacher Portal — Submit student assessment scores, track class attendance, and manage daily timetables."
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Assigned Students"
            value={totalStudents || 12}
            icon={<Users className="text-primary-500" />}
            description="Across JHS 1, JHS 2 & JHS 3 classes"
          />
          <StatCard
            title="Timetable Sessions"
            value={`${timetable.length} Classes`}
            icon={<Clock className="text-indigo-500" />}
            description="Weekly contact period allocations"
          />
          <StatCard
            title="Assigned Department"
            value={teacher?.departmentId === 'dept_001' ? 'Languages & Math' : 'General'}
            icon={<GraduationCap className="text-amber-500" />}
            description="Linked to academic hierarchy"
          />
        </div>

        {/* Shortcut Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left - Weekly Timetable */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="text-primary-500" size={18} />
                My Weekly Teaching Timetable
              </CardTitle>
            </CardHeader>
            <CardBody className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-500 dark:text-slate-400">
                <thead className="text-[10px] text-slate-400 uppercase bg-slate-50 dark:bg-slate-900 border-b border-border-secondary">
                  <tr>
                    <th className="px-4 py-3">Day</th>
                    <th className="px-4 py-3">Time slot</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Class Level</th>
                    <th className="px-4 py-3">Classroom</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-secondary">
                  {timetable.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{entry.day}</td>
                      <td className="px-4 py-3">{entry.time}</td>
                      <td className="px-4 py-3 font-semibold text-primary-600">{entry.subject}</td>
                      <td className="px-4 py-3">{entry.classLevel}</td>
                      <td className="px-4 py-3 text-slate-400">{entry.room}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>

          {/* Right - Task shortcuts */}
          <Card className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="text-indigo-500" size={18} />
                Classroom Action Shortcuts
              </CardTitle>
            </CardHeader>
            <CardBody className="space-y-4 flex-1 flex flex-col justify-center">
              <p className="text-xs text-slate-500 font-light mb-4">
                Quickly jump to grade lists to input midterm and end-of-term exam marks, or log student roll calls.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  to="/teacher/attendance"
                  className="p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-border-secondary rounded-xl flex items-center gap-3 transition-all"
                >
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 rounded-lg">
                    <CalendarCheck size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">Daily Attendance</h4>
                    <span className="text-[10px] text-slate-400">Mark student register</span>
                  </div>
                </Link>

                <Link
                  to="/teacher/grades"
                  className="p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-border-secondary rounded-xl flex items-center gap-3 transition-all"
                >
                  <div className="p-3 bg-primary-100 dark:bg-primary-950/30 text-primary-600 rounded-lg">
                    <PenTool size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">Grade Entry Book</h4>
                    <span className="text-[10px] text-slate-400">Record assessment grades</span>
                  </div>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
