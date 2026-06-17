import { useMemo } from 'react';
import { useAuthStore } from '../../../../stores/authStore';
import { useStudent } from '../hooks/useStudent';
import { useCommunication } from '../../../communication/hooks/useCommunication';
import { PageWrapper } from '../../../../components/layout/PageWrapper';
import { Card, CardHeader, CardTitle, CardBody } from '../../../../components/ui/Card';
import { StatCard } from '../../../../components/data-display/StatCard';
import { Badge } from '../../../../components/ui/Badge';
import { Clock, GraduationCap, Calendar, Megaphone } from 'lucide-react';

export default function StudentDashboardPage() {
  const { user } = useAuthStore();
  const studentName = useMemo(() => ({
    firstName: user?.firstName || 'Akua',
    lastName: user?.lastName || 'Adjei'
  }), [user]);

  const { student, timetable, attendanceSummary, results } = useStudent(studentName);
  const { announcements } = useCommunication();

  const activeAnnouncements = useMemo(() => {
    return announcements.filter(a => a.target === 'all' || a.target === 'students');
  }, [announcements]);

  const breadcrumbs = [
    { label: 'Student Portal' },
    { label: 'Dashboard' }
  ];

  return (
    <PageWrapper
      title={`Welcome, ${student?.firstName || 'Student'}`}
      subtitle={`Student Portal — Class: ${student?.classLevel || 'JHS 1'} | ID: ${student?.studentId || 'ADV-2025-001'}`}
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="My Attendance Rate"
            value={`${attendanceSummary.rate}%`}
            icon={<Calendar className="text-emerald-500" />}
            description="Overall status this term"
          />
          <StatCard
            title="Registered Subjects"
            value="8 Subjects"
            icon={<GraduationCap className="text-indigo-500" />}
            description="Aligned to active WAEC syllabus"
          />
          <StatCard
            title="Completed Assessments"
            value={`${results.length} Tests`}
            icon={<Clock className="text-amber-500" />}
            description="Quizzes and terminal exams"
          />
        </div>

        {/* Timetable and Bulletins */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timetable Grid */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="text-primary-500" size={18} />
                  My Class Timetable
                </CardTitle>
              </CardHeader>
              <CardBody className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-500 dark:text-slate-400">
                  <thead className="text-[10px] text-slate-400 uppercase bg-slate-50 dark:bg-slate-900 border-b border-border-secondary">
                    <tr>
                      <th className="px-4 py-3">Day</th>
                      <th className="px-4 py-3">Time slot</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Room</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-secondary">
                    {timetable.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                        <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{entry.day}</td>
                        <td className="px-4 py-3">{entry.time}</td>
                        <td className="px-4 py-3 font-semibold text-primary-600">{entry.subject}</td>
                        <td className="px-4 py-3 text-slate-400">{entry.room}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </div>

          {/* School Announcements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="text-indigo-500" size={18} />
                Student Notice Board
              </CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              {activeAnnouncements.length > 0 ? (
                activeAnnouncements.map((ann) => (
                  <div key={ann.id} className="p-3 bg-slate-50 dark:bg-slate-900 border border-border-secondary rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-800 dark:text-white text-xs">{ann.title}</h4>
                      <Badge variant={ann.priority === 'urgent' ? 'danger' : 'primary'}>{ann.priority}</Badge>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal font-light">{ann.content}</p>
                    <div className="mt-2 text-[9px] text-slate-400 text-right">
                      {new Date(ann.publishDate).toLocaleDateString('en-GB')}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">No notifications on notice board.</div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
