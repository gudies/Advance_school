import { useState, useMemo } from 'react';
import { useAuthStore } from '../../../../stores/authStore';
import { useParent } from '../hooks/useParent';
import { useCommunication } from '../../../communication/hooks/useCommunication';
import { PageWrapper } from '../../../../components/layout/PageWrapper';
import { Card, CardHeader, CardTitle, CardBody } from '../../../../components/ui/Card';
import { StatCard } from '../../../../components/data-display/StatCard';
import { Badge } from '../../../../components/ui/Badge';
import { CURRENCY_SYMBOL } from '../../../../types/common';
import { GraduationCap, Calendar, Wallet, Megaphone, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ParentDashboardPage() {
  const { user } = useAuthStore();
  const parentEmail = user?.email || 'parent@camiedbehills.edu.gh';
  
  const { children, getAttendanceForChild, getInvoicesForChild, getResultsForChild } = useParent(parentEmail);
  const { announcements } = useCommunication();
  
  const [selectedChildId, setSelectedChildId] = useState<string>(() => {
    return children.length > 0 ? children[0].id : '';
  });

  const activeChild = useMemo(() => {
    return children.find(c => c.id === selectedChildId) || null;
  }, [children, selectedChildId]);

  // Calculate stats for the selected child
  const stats = useMemo(() => {
    if (!activeChild) return { attendanceRate: 100, pendingFees: 0, averageGrade: 'N/A' };
    
    // Attendance
    const att = getAttendanceForChild(activeChild.id);
    const presentCount = att.filter(a => a.status === 'present' || a.status === 'late').length;
    const attendanceRate = att.length > 0 ? Math.round((presentCount / att.length) * 100) : 100;

    // Invoices
    const inv = getInvoicesForChild(activeChild.id);
    const pendingFees = inv.filter(i => i.status !== 'paid').reduce((acc, i) => acc + i.total, 0);

    // Results
    const res = getResultsForChild(activeChild.id);
    const examResults = res.filter(r => r.type === 'end_of_term');
    const averageScore = examResults.length > 0 
      ? Math.round(examResults.reduce((acc, r) => acc + r.score, 0) / examResults.length)
      : null;

    let averageGrade = 'N/A';
    if (averageScore !== null) {
      if (averageScore >= 80) averageGrade = '1 (Excellent)';
      else if (averageScore >= 70) averageGrade = '2 (Very Good)';
      else if (averageScore >= 60) averageGrade = '3 (Good)';
      else if (averageScore >= 50) averageGrade = '4 (Pass)';
      else averageGrade = '9 (Fail)';
    }

    return {
      attendanceRate,
      pendingFees,
      averageGrade
    };
  }, [activeChild, getAttendanceForChild, getInvoicesForChild, getResultsForChild]);

  const breadcrumbs = [
    { label: 'Parent Portal' },
    { label: 'Dashboard' }
  ];

  return (
    <PageWrapper 
      title={`Welcome, ${user?.firstName || 'Parent'}`}
      subtitle="Parent Portal — Monitor your children's educational progress, attendance, and fee status."
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
                  {child.firstName} {child.lastName} ({child.classLevel})
                </button>
              ))}
            </div>
          </div>
        )}

        {activeChild ? (
          <>
            {/* Child Header Card */}
            <div className="p-6 bg-gradient-to-r from-primary-600 to-indigo-700 rounded-2xl text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex-center text-2xl font-bold border-2 border-white/40">
                  {activeChild.firstName[0]}{activeChild.lastName[0]}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{activeChild.firstName} {activeChild.lastName}</h2>
                  <p className="text-white/80 text-sm">Class Level: {activeChild.classLevel} | Student ID: {activeChild.studentId}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link
                  to="/parent/performance"
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold flex items-center gap-2 border border-white/20 transition-all"
                >
                  View Performance <GraduationCap size={14} />
                </Link>
                <Link
                  to="/parent/fees"
                  className="px-4 py-2 bg-white text-primary-900 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shadow-md"
                >
                  Pay Fees <Wallet size={14} />
                </Link>
              </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Attendance Rate"
                value={`${stats.attendanceRate}%`}
                icon={<Calendar className="text-emerald-500" />}
                description="Target benchmark threshold (90%+)"
              />
              <StatCard
                title="Average Terminal Grade"
                value={stats.averageGrade}
                icon={<GraduationCap className="text-indigo-500" />}
                description="Calculated from end-of-term exams"
              />
              <StatCard
                title="Outstanding Bill"
                value={`${CURRENCY_SYMBOL}${stats.pendingFees.toLocaleString()}`}
                icon={<Wallet className="text-rose-500" />}
                description="Outstanding fee balances due this term"
              />
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Bulletins */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Megaphone className="text-primary-500" size={18} />
                      School Bulletins & Announcements
                    </CardTitle>
                  </CardHeader>
                  <CardBody className="divide-y divide-border-secondary">
                    {announcements.length > 0 ? (
                      announcements.map((ann) => (
                        <div key={ann.id} className="py-4 first:pt-0 last:pb-0">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-slate-800 dark:text-white text-sm">{ann.title}</h4>
                            <Badge variant={ann.priority === 'urgent' ? 'danger' : ann.priority === 'high' ? 'warning' : 'primary'}>
                              {ann.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 font-light mb-2">{ann.content}</p>
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>Posted by: {ann.authorName}</span>
                            <span>{new Date(ann.publishDate).toLocaleDateString('en-GB')}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-slate-400 text-sm">No recent school bulletins.</div>
                    )}
                  </CardBody>
                </Card>
              </div>

              {/* Right Column - Child Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="text-indigo-500" size={18} />
                    Student Profile details
                  </CardTitle>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-border-secondary pb-2">
                      <span className="text-slate-400">Full Name:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{activeChild.firstName} {activeChild.lastName}</span>
                    </div>
                    <div className="flex justify-between border-b border-border-secondary pb-2">
                      <span className="text-slate-400">Gender:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{activeChild.gender}</span>
                    </div>
                    <div className="flex justify-between border-b border-border-secondary pb-2">
                      <span className="text-slate-400">Class Section:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{activeChild.classLevel}</span>
                    </div>
                    <div className="flex justify-between border-b border-border-secondary pb-2">
                      <span className="text-slate-400">Admission Date:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{new Date(activeChild.admissionDate).toLocaleDateString('en-GB')}</span>
                    </div>
                    <div className="flex justify-between pb-2">
                      <span className="text-slate-400">Status:</span>
                      <Badge variant={activeChild.status === 'active' || activeChild.status === 'enrolled' ? 'success' : 'danger'}>
                        {activeChild.status}
                      </Badge>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </>
        ) : (
          <div className="p-8 bg-surface-primary rounded-xl border border-border-secondary text-center text-slate-400">
            No children registered under this parent email ({parentEmail}). Please contact school administration.
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
