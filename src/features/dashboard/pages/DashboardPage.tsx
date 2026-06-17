import { useMemo, useState } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { 
  Users, 
  GraduationCap, 
  Wallet, 
  Activity, 
  TrendingUp, 
  Plus, 
  Calendar, 
  FileText, 
  Bell, 
  CheckCircle, 
  Clock, 
  BookOpen, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { LocalStorageAdapter } from '../../../services/adapters/localStorageAdapter';
import { Student, Staff, Payment } from '../../../types';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [selectedChild, setSelectedChild] = useState<string>('stu_001');

  // Load data from LocalStorage
  const students = useMemo(() => new LocalStorageAdapter<Student>('advance_students').getAll(), []);
  const staff = useMemo(() => new LocalStorageAdapter<Staff>('advance_staff').getAll(), []);
  const payments = useMemo(() => new LocalStorageAdapter<Payment>('advance_payments').getAll(), []);

  // calculations
  const totalStudents = students.length;
  const totalStaff = staff.length;
  const totalRevenue = useMemo(() => payments.reduce((sum, p) => sum + p.amountPaid, 0), [payments]);
  
  // Calculate fees collected vs outstanding
  // Total expected fees: Let's assume each student is billed 1250 per term (matching seedFeeStructures)
  const totalExpectedFees = totalStudents * 1250;
  const collectionRate = expectedFeePercent(totalExpectedFees, totalRevenue);
  const outstandingFees = Math.max(0, totalExpectedFees - totalRevenue);

  function expectedFeePercent(expected: number, actual: number) {
    if (expected === 0) return 0;
    return Math.round((actual / expected) * 100);
  }

  // Chart Data
  const revenueTrendData = [
    { name: 'Jan', revenue: totalRevenue * 0.4 },
    { name: 'Feb', revenue: totalRevenue * 0.6 },
    { name: 'Mar', revenue: totalRevenue * 0.75 },
    { name: 'Apr', revenue: totalRevenue * 0.8 },
    { name: 'May', revenue: totalRevenue * 0.95 },
    { name: 'Jun', revenue: totalRevenue },
  ];

  const genderData = useMemo(() => {
    const females = students.filter(s => s.gender === 'Female').length;
    const males = students.filter(s => s.gender === 'Male').length;
    return [
      { name: 'Female', value: females || 1 },
      { name: 'Male', value: males || 1 },
    ];
  }, [students]);

  const COLORS = ['var(--color-primary-500)', 'var(--color-success-500)'];

  if (!user) return null;

  // 1. ADMIN & SUPER_ADMIN DASHBOARD VIEW
  if (user.role === 'super_admin' || user.role === 'admin') {
    return (
      <div className="animate-fade-in-up space-y-8" style={{ animation: 'fadeInUp 0.5s ease forwards' }}>
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-primary-900 via-primary-800 to-indigo-900 text-white rounded-2xl shadow-xl overflow-hidden relative"
             style={{ 
               background: 'linear-gradient(135deg, var(--color-primary-900) 0%, var(--color-primary-800) 50%, var(--color-primary-900) 100%)',
               boxShadow: 'var(--shadow-lg)'
             }}>
          <div className="space-y-2 relative z-10">
            <h1 className="text-3xl font-extrabold font-heading tracking-tight flex items-center gap-2 text-white">
              Hello, {user.firstName} <Sparkles className="h-6 w-6 text-amber-400 animate-pulse" />
            </h1>
            <p className="text-white/85 font-light text-sm max-w-xl">
              Welcome back to Camied Behills International School Portal. Here is your overview of school performance, enrollment, and collection rate metrics today.
            </p>
          </div>
          <div className="flex gap-3 relative z-10 shrink-0">
            <Button variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 border-white/20 text-white hover:text-white">
              View Audit Log
            </Button>
            <Button variant="primary" size="sm" className="bg-success-600 hover:bg-success-700 text-white shadow-success">
              System Settings
            </Button>
          </div>
          {/* Subtle geometric overlay decoration */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:scale-[1.02] transition-transform duration-200">
            <CardBody className="flex items-center gap-4">
              <div className="p-3 bg-primary-100 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 rounded-xl shrink-0">
                <GraduationCap size={24} />
              </div>
              <div>
                <p className="text-xs text-secondary font-medium uppercase tracking-wider">Total Students</p>
                <h3 className="text-2xl font-bold font-heading">{totalStudents}</h3>
                <p className="text-[10px] text-success font-medium mt-0.5">Active Enrollment</p>
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-[1.02] transition-transform duration-200">
            <CardBody className="flex items-center gap-4">
              <div className="p-3 bg-success-100 dark:bg-success-950/30 text-success-600 dark:text-success-400 rounded-xl shrink-0">
                <Users size={24} />
              </div>
              <div>
                <p className="text-xs text-secondary font-medium uppercase tracking-wider">Total Staff</p>
                <h3 className="text-2xl font-bold font-heading">{totalStaff}</h3>
                <p className="text-[10px] text-secondary font-light mt-0.5">Academic & Auxiliary</p>
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-[1.02] transition-transform duration-200">
            <CardBody className="flex items-center gap-4">
              <div className="p-3 bg-warning-100 dark:bg-warning-950/30 text-warning-600 dark:text-warning-400 rounded-xl shrink-0">
                <Wallet size={24} />
              </div>
              <div>
                <p className="text-xs text-secondary font-medium uppercase tracking-wider">Fees Collected</p>
                <h3 className="text-2xl font-bold font-heading">{collectionRate}%</h3>
                <p className="text-[10px] text-success font-medium mt-0.5">Collection Rate</p>
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-[1.02] transition-transform duration-200">
            <CardBody className="flex items-center gap-4">
              <div className="p-3 bg-danger-100 dark:bg-danger-950/30 text-danger-600 dark:text-danger-400 rounded-xl shrink-0">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-xs text-secondary font-medium uppercase tracking-wider">Revenue</p>
                <h3 className="text-2xl font-bold font-heading">GH₵{totalRevenue.toLocaleString()}</h3>
                <p className="text-[10px] text-danger font-medium mt-0.5">GH₵{outstandingFees.toLocaleString()} Outstanding</p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="min-h-[22rem]">
            <CardHeader className="flex-between">
              <div>
                <CardTitle>Revenue Collection Trend</CardTitle>
                <p className="text-xs text-secondary font-light mt-1">Growth progression for the current term</p>
              </div>
              <Badge variant="primary">Term 1</Badge>
            </CardHeader>
            <CardBody className="h-64 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrendData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary-500)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--color-primary-500)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-secondary)" />
                  <XAxis dataKey="name" stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} />
                  <ChartTooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--color-surface-elevated)', 
                      borderColor: 'var(--color-border-primary)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-text-primary)'
                    }} 
                  />
                  <Area type="monotone" dataKey="revenue" stroke="var(--color-primary-600)" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          <Card className="min-h-[22rem]">
            <CardHeader className="flex-between">
              <div>
                <CardTitle>Student Gender Distribution</CardTitle>
                <p className="text-xs text-secondary font-light mt-1">Breakdown of girls vs boys currently enrolled</p>
              </div>
              <Badge variant="success">All Levels</Badge>
            </CardHeader>
            <CardBody className="h-64 flex items-center justify-center pt-4">
              <div className="w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {genderData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--color-surface-elevated)', 
                        borderColor: 'var(--color-border-primary)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--color-text-primary)'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-3 pl-4">
                {genderData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.name}:</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardBody className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="sm" className="flex-col gap-2 p-4 h-auto text-center" onClick={() => window.location.href='/students/enroll'}>
                <Plus className="h-5 w-5 text-primary-600" />
                <span className="text-xs font-semibold">Enroll Student</span>
              </Button>
              <Button variant="outline" size="sm" className="flex-col gap-2 p-4 h-auto text-center" onClick={() => window.location.href='/staff/register'}>
                <Plus className="h-5 w-5 text-success-600" />
                <span className="text-xs font-semibold">Register Staff</span>
              </Button>
              <Button variant="outline" size="sm" className="flex-col gap-2 p-4 h-auto text-center" onClick={() => window.location.href='/fees/payments'}>
                <Wallet className="h-5 w-5 text-warning-600" />
                <span className="text-xs font-semibold">Record Payment</span>
              </Button>
              <Button variant="outline" size="sm" className="flex-col gap-2 p-4 h-auto text-center" onClick={() => window.location.href='/admin/settings'}>
                <FileText className="h-5 w-5 text-danger-600" />
                <span className="text-xs font-semibold">Configurations</span>
              </Button>
            </CardBody>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="flex-between">
              <CardTitle>Recent Activity Log</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs font-semibold">View All <ArrowRight className="h-3 w-3 ml-1" /></Button>
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <div className="flex items-start gap-4 p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                  <div className="p-2 bg-success-50 dark:bg-success-950/20 text-success-600 dark:text-success-400 rounded-lg shrink-0">
                    <CheckCircle size={18} />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">New Payment Recorded</p>
                    <p className="text-xs text-secondary font-light">Received GH₵1,250 tuition fee payment from Akua Adjei</p>
                  </div>
                  <span className="text-[10px] text-tertiary shrink-0 mt-0.5">10 mins ago</span>
                </div>

                <div className="flex items-start gap-4 p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                  <div className="p-2 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 rounded-lg shrink-0">
                    <Users size={18} />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">New Student Enrolled</p>
                    <p className="text-xs text-secondary font-light">Kwabena Osei enrolled successfully under Level JHS 2</p>
                  </div>
                  <span className="text-[10px] text-tertiary shrink-0 mt-0.5">2 hours ago</span>
                </div>

                <div className="flex items-start gap-4 p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                  <div className="p-2 bg-warning-50 dark:bg-warning-950/20 text-warning-600 dark:text-warning-400 rounded-lg shrink-0">
                    <Clock size={18} />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Term Setup Configured</p>
                    <p className="text-xs text-secondary font-light">Fee Structure configuration updated for 2025/2026 Academic Year</p>
                  </div>
                  <span className="text-[10px] text-tertiary shrink-0 mt-0.5">1 day ago</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  // 2. TEACHER DASHBOARD VIEW
  if (user.role === 'teacher') {
    return (
      <div className="animate-fade-in-up space-y-8" style={{ animation: 'fadeInUp 0.5s ease forwards' }}>
        <div className="p-6 bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 text-white rounded-2xl shadow-xl overflow-hidden relative"
             style={{ background: 'linear-gradient(135deg, var(--color-success-700) 0%, var(--color-success-600) 50%, var(--color-success-700) 100%)' }}>
          <h1 className="text-3xl font-extrabold font-heading tracking-tight mb-2 text-white">
            Welcome, Ama Mensah
          </h1>
          <p className="text-white/85 font-light text-sm max-w-xl">
            Check your today's classes, prepare lesson summaries, or easily log classroom attendance from your dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardBody className="flex items-center gap-4">
              <div className="p-3 bg-primary-100 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 rounded-xl shrink-0">
                <GraduationCap size={24} />
              </div>
              <div>
                <p className="text-xs text-secondary font-medium uppercase tracking-wider">My Students</p>
                <h3 className="text-2xl font-bold font-heading">{totalStudents}</h3>
                <p className="text-[10px] text-success font-medium mt-0.5">Assigned Class</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center gap-4">
              <div className="p-3 bg-success-100 dark:bg-success-950/30 text-success-600 dark:text-success-400 rounded-xl shrink-0">
                <BookOpen size={24} />
              </div>
              <div>
                <p className="text-xs text-secondary font-medium uppercase tracking-wider">Active Subjects</p>
                <h3 className="text-2xl font-bold font-heading">3</h3>
                <p className="text-[10px] text-secondary font-light mt-0.5">Mathematics, ICT, General Sci</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center gap-4">
              <div className="p-3 bg-info-100 dark:bg-info-950/30 text-info-600 dark:text-info-400 rounded-xl shrink-0">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-xs text-secondary font-medium uppercase tracking-wider">Avg Attendance</p>
                <h3 className="text-2xl font-bold font-heading">95%</h3>
                <p className="text-[10px] text-success font-medium mt-0.5">Perfect Record</p>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="min-h-[20rem]">
            <CardHeader>
              <CardTitle>Today's Teaching Schedule</CardTitle>
            </CardHeader>
            <CardBody className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
              <div className="flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-50 dark:bg-primary-950/20 rounded-xl flex flex-col items-center justify-center text-primary-600 shrink-0 font-bold">
                    <span className="text-xs leading-none">08:30</span>
                    <span className="text-[9px] leading-none uppercase mt-0.5">AM</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Mathematics</h4>
                    <p className="text-xs text-secondary font-light">JHS Level 1 (Class Alpha)</p>
                  </div>
                </div>
                <Badge variant="primary">Ongoing</Badge>
              </div>

              <div className="flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 shrink-0 font-bold">
                    <span className="text-xs leading-none">10:45</span>
                    <span className="text-[9px] leading-none uppercase mt-0.5">AM</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">ICT & Technology</h4>
                    <p className="text-xs text-secondary font-light">JHS Level 2 (Class Beta)</p>
                  </div>
                </div>
                <Badge variant="neutral">Upcoming</Badge>
              </div>

              <div className="flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 shrink-0 font-bold">
                    <span className="text-xs leading-none">01:15</span>
                    <span className="text-[9px] leading-none uppercase mt-0.5">PM</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">General Sciences</h4>
                    <p className="text-xs text-secondary font-light">JHS Level 1 (Class Alpha)</p>
                  </div>
                </div>
                <Badge variant="neutral">Upcoming</Badge>
              </div>
            </CardBody>
          </Card>

          <Card className="min-h-[20rem]">
            <CardHeader className="flex-between">
              <CardTitle>Recent Announcements</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs font-semibold">All announcements <ArrowRight className="h-3 w-3 ml-1" /></Button>
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <div className="flex items-start gap-4 p-4">
                  <div className="p-2 bg-warning-50 dark:bg-warning-950/20 text-warning-600 dark:text-warning-400 rounded-lg shrink-0">
                    <Bell size={16} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h5 className="text-sm font-semibold text-slate-800 dark:text-slate-200">PTA Meeting Scheduled</h5>
                    <p className="text-xs text-secondary font-light leading-relaxed">
                      Please note that the Parent-Teacher association general meeting will take place this Saturday in the main hall starting at 10:00 AM.
                    </p>
                    <span className="text-[10px] text-tertiary block mt-1">Shared yesterday by Admin</span>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4">
                  <div className="p-2 bg-info-50 dark:bg-info-950/20 text-info-600 dark:text-info-400 rounded-lg shrink-0">
                    <Bell size={16} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h5 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Mid-Term Exams Notice</h5>
                    <p className="text-xs text-secondary font-light leading-relaxed">
                      Final dates for assessment grading submission have been locked. Ensure all grades are key-logged in by Friday.
                    </p>
                    <span className="text-[10px] text-tertiary block mt-1">Shared 3 days ago</span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  // 3. PARENT DASHBOARD VIEW
  if (user.role === 'parent') {
    const parentChild = students.find(s => s.id === selectedChild) || students[0];

    return (
      <div className="animate-fade-in-up space-y-8" style={{ animation: 'fadeInUp 0.5s ease forwards' }}>
        {/* Header with Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900 text-white rounded-2xl shadow-xl">
          <div>
            <h1 className="text-3xl font-extrabold font-heading tracking-tight mb-1.5 text-white">
              Welcome, Kofi Adjei
            </h1>
            <p className="text-white/85 font-light text-sm">
              View your children's terminal performance, fee invoices, outstanding balance payments and timetables.
            </p>
          </div>
          {students.length > 1 && (
            <div className="shrink-0 flex items-center gap-3">
              <span className="text-sm font-medium text-slate-400">Select Child:</span>
              <select
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Selected Child Info Cards */}
        {parentChild && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardBody className="flex items-center gap-4">
                <div className="p-3 bg-primary-100 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 rounded-xl shrink-0">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <p className="text-xs text-secondary font-medium uppercase tracking-wider">Class Level</p>
                  <h3 className="text-2xl font-bold font-heading">{parentChild.classLevel}</h3>
                  <p className="text-[10px] text-secondary font-light mt-0.5">Class Alpha</p>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="flex items-center gap-4">
                <div className="p-3 bg-success-100 dark:bg-success-950/30 text-success-600 dark:text-success-400 rounded-xl shrink-0">
                  <Wallet size={24} />
                </div>
                <div>
                  <p className="text-xs text-secondary font-medium uppercase tracking-wider">Fees Outstanding</p>
                  <h3 className="text-2xl font-bold font-heading">GH₵0.00</h3>
                  <p className="text-[10px] text-success font-medium mt-0.5">Fully Paid (Term 1)</p>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="flex items-center gap-4">
                <div className="p-3 bg-info-100 dark:bg-info-950/30 text-info-600 dark:text-info-400 rounded-xl shrink-0">
                  <Activity size={24} />
                </div>
                <div>
                  <p className="text-xs text-secondary font-medium uppercase tracking-wider">Weekly Attendance</p>
                  <h3 className="text-2xl font-bold font-heading">98%</h3>
                  <p className="text-[10px] text-success font-medium mt-0.5">Excellent record</p>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex-between">
              <CardTitle>Child's Performance Report</CardTitle>
              <Button variant="outline" size="sm">Download PDF Report</Button>
            </CardHeader>
            <CardBody className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
              <div className="flex items-center justify-between p-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Mathematics</h4>
                  <p className="text-xs text-secondary font-light">Assessed Mid-Term test</p>
                </div>
                <Badge variant="success">A1 (92%)</Badge>
              </div>

              <div className="flex items-center justify-between p-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Information & Communications Tech</h4>
                  <p className="text-xs text-secondary font-light">Class Assessment quiz 2</p>
                </div>
                <Badge variant="primary">B2 (78%)</Badge>
              </div>

              <div className="flex items-center justify-between p-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Integrated Science</h4>
                  <p className="text-xs text-secondary font-light">Practical laboratory evaluation</p>
                </div>
                <Badge variant="success">A1 (89%)</Badge>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Payment Invoices</CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/10">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">JHS 1 Tuition Fee - Term 1</h4>
                  <p className="text-xs text-secondary font-light mt-0.5">Reference: INV-2025-001</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">GH₵1,250.00</p>
                  <Badge variant="success" className="mt-1">Paid</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/10 opacity-60">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">JHS 1 Tuition Fee - Term 2</h4>
                  <p className="text-xs text-secondary font-light mt-0.5">Billed in advance</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">GH₵1,250.00</p>
                  <Badge variant="neutral" className="mt-1">Pending</Badge>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  // 4. STUDENT DASHBOARD VIEW
  if (user.role === 'student') {
    return (
      <div className="animate-fade-in-up space-y-8" style={{ animation: 'fadeInUp 0.5s ease forwards' }}>
        <div className="p-6 bg-gradient-to-r from-indigo-800 via-indigo-700 to-primary-800 text-white rounded-2xl shadow-xl overflow-hidden relative"
             style={{ background: 'linear-gradient(135deg, var(--color-primary-700) 0%, var(--color-primary-600) 50%, var(--color-primary-700) 100%)' }}>
          <h1 className="text-3xl font-extrabold font-heading tracking-tight mb-2 text-white">
            Hi, Akua Adjei!
          </h1>
          <p className="text-white/85 font-light text-sm max-w-xl">
            Keep track of your personal class schedules, view homework assignments, and check assessment results.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardBody className="flex items-center gap-4">
              <div className="p-3 bg-primary-100 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 rounded-xl shrink-0">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-xs text-secondary font-medium uppercase tracking-wider">Attendance Rate</p>
                <h3 className="text-2xl font-bold font-heading">98%</h3>
                <p className="text-[10px] text-success font-medium mt-0.5">38 Days Present</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center gap-4">
              <div className="p-3 bg-success-100 dark:bg-success-950/30 text-success-600 dark:text-success-400 rounded-xl shrink-0">
                <FileText size={24} />
              </div>
              <div>
                <p className="text-xs text-secondary font-medium uppercase tracking-wider">Homeworks Due</p>
                <h3 className="text-2xl font-bold font-heading">2</h3>
                <p className="text-[10px] text-danger font-medium mt-0.5">Submit by tomorrow</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center gap-4">
              <div className="p-3 bg-info-100 dark:bg-info-950/30 text-info-600 dark:text-info-400 rounded-xl shrink-0">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-xs text-secondary font-medium uppercase tracking-wider">Overall Grade</p>
                <h3 className="text-2xl font-bold font-heading">A (86.3%)</h3>
                <p className="text-[10px] text-success font-medium mt-0.5">Class Rank: 4th</p>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>My Assignments</CardTitle>
            </CardHeader>
            <CardBody className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
              <div className="flex items-center justify-between p-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Algebra Homework 3</h4>
                  <p className="text-xs text-secondary font-light mt-0.5">Class: Math 101 • Due: Tomorrow at 4:00 PM</p>
                </div>
                <Badge variant="danger">Due Tomorrow</Badge>
              </div>

              <div className="flex items-center justify-between p-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Integrated Science Project</h4>
                  <p className="text-xs text-secondary font-light mt-0.5">Group Research Project on Soils • Due in 4 days</p>
                </div>
                <Badge variant="warning">Pending</Badge>
              </div>

              <div className="flex items-center justify-between p-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">ICT Lab Report 1</h4>
                  <p className="text-xs text-secondary font-light mt-0.5">Submit lab write-up for basic spreadsheet operations</p>
                </div>
                <Badge variant="success">Completed</Badge>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today's Timetable</CardTitle>
            </CardHeader>
            <CardBody className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
              <div className="flex items-center gap-4 p-4">
                <span className="text-xs font-bold text-slate-400 w-16">08:30 AM</span>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Mathematics</h4>
                  <p className="text-xs text-secondary font-light">Ama Mensah • Class Alpha</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4">
                <span className="text-xs font-bold text-slate-400 w-16">10:45 AM</span>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">ICT & Computing</h4>
                  <p className="text-xs text-secondary font-light">Ama Mensah • Computer Lab 2</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4">
                <span className="text-xs font-bold text-slate-400 w-16">01:15 PM</span>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">General Integrated Science</h4>
                  <p className="text-xs text-secondary font-light">Kwabena Osei • Science Lab</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
