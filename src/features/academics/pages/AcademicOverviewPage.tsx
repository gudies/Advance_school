import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import { StatCard } from '../../../components/data-display/StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen, GraduationCap, Award, Percent } from 'lucide-react';

const CLASS_AVERAGES = [
  { class: 'Primary 1', average: 78 },
  { class: 'Primary 3', average: 72 },
  { class: 'Primary 6', average: 75 },
  { class: 'JHS 1', average: 68 },
  { class: 'JHS 2', average: 64 },
  { class: 'SS 1', average: 70 }
];

export default function AcademicOverviewPage() {
  const breadcrumbs = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Academics' },
    { label: 'Overview' }
  ];

  return (
    <PageWrapper 
      title="Academic Analytics Overview" 
      subtitle="Examine student metrics, view passing rates, and analyze average grades across grade levels."
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="School Passing Rate"
            value="92.4%"
            icon={<Percent className="text-emerald-500" />}
            trend={{ value: '1.2%', type: 'up' }}
            description="Target passing threshold (50%+)"
          />
          <StatCard
            title="Average Exam Grade"
            value="71.8 / 100"
            icon={<Award className="text-primary-500" />}
            trend={{ value: '0.8%', type: 'up' }}
            description="Across JHS & Primary levels"
          />
          <StatCard
            title="Active Subjects Billed"
            value="14 Subjects"
            icon={<BookOpen className="text-slate-500" />}
            description="Aligned to WAEC syllabus"
          />
          <StatCard
            title="Top Performing Class"
            value="Primary 1"
            icon={<GraduationCap className="text-amber-500" />}
            description="With a 78.4 average score"
          />
        </div>

        {/* Averages Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Average Exam Scores by Class Level</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CLASS_AVERAGES} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                  <XAxis dataKey="class" className="text-xs text-slate-500" />
                  <YAxis className="text-xs text-slate-500" domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value) => `${value}%`}
                    contentStyle={{ 
                      backgroundColor: 'var(--color-surface-primary)', 
                      borderColor: 'var(--color-border-primary)',
                      borderRadius: 'var(--radius-lg)'
                    }} 
                  />
                  <Bar dataKey="average" name="Class Average" fill="var(--color-primary-500)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>
    </PageWrapper>
  );
}
