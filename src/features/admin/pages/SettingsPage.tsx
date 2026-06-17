import { useState } from 'react';
import { useAdmin, SchoolSettings } from '../hooks/useAdmin';
import { useAuthStore } from '../../../stores/authStore';
import { useNotificationStore } from '../../../stores/notificationStore';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Tabs } from '../../../components/ui/Tabs';
import { ClassLevel, Term, CLASS_LEVELS, TERMS } from '../../../types/common';
import { Building, Calendar, LayoutGrid, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const { settings, saveSettings } = useAdmin();
  const { user } = useAuthStore();
  const addToast = useNotificationStore((state) => state.addToast);

  const [activeTab, setActiveTab] = useState('school');
  
  // State for forms
  const [schoolName, setSchoolName] = useState(settings.schoolName);
  const [academicYear, setAcademicYear] = useState(settings.academicYear);
  const [activeTerm, setActiveTerm] = useState<Term>(settings.activeTerm);
  const [classLevels, setClassLevels] = useState<Record<ClassLevel, boolean>>(settings.classLevels);
  
  const [schoolMotto, setSchoolMotto] = useState('Scientia Potestas Est');
  const [schoolAddress, setSchoolAddress] = useState('Camied Hills, Accra, Ghana');

  const handleToggleClass = (lvl: ClassLevel) => {
    setClassLevels((prev) => ({
      ...prev,
      [lvl]: !prev[lvl]
    }));
  };

  const handleSave = () => {
    if (!user) return;
    try {
      const updated: SchoolSettings = {
        id: settings.id || 'global',
        schoolName,
        academicYear,
        activeTerm,
        classLevels
      };
      saveSettings(updated, user.id, `${user.firstName} ${user.lastName}`);
      addToast({ type: 'success', message: 'Global settings updated successfully!' });
    } catch (err) {
      addToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to save settings.' });
    }
  };

  const tabs = [
    { id: 'school', label: 'School Metadata', icon: <Building size={16} /> },
    { id: 'academic', label: 'Academic Term', icon: <Calendar size={16} /> },
    { id: 'classes', label: 'Class Configuration', icon: <LayoutGrid size={16} /> }
  ];

  const breadcrumbs = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Admin Panel' },
    { label: 'Settings' }
  ];

  return (
    <PageWrapper 
      title="Global School Settings" 
      subtitle="Manage institutional configuration parameters, active terms, and active academic class pipelines."
      breadcrumbs={breadcrumbs}
      action={
        <Button variant="primary" onClick={handleSave} leftIcon={<CheckCircle size={18} />}>
          Save Settings
        </Button>
      }
    >
      <div className="space-y-6">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="pill" />

        {activeTab === 'school' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>School Information</CardTitle>
                </CardHeader>
                <CardBody className="space-y-4">
                  <Input
                    label="School Name *"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    required
                  />
                  <Input
                    label="School Motto"
                    value={schoolMotto}
                    onChange={(e) => setSchoolMotto(e.target.value)}
                  />
                  <Input
                    label="Address"
                    value={schoolAddress}
                    onChange={(e) => setSchoolAddress(e.target.value)}
                  />
                </CardBody>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>School Crest / Logo</CardTitle>
                </CardHeader>
                <CardBody className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="w-32 h-32 flex items-center justify-center mb-4 shrink-0">
                    <img src="/logo_transparent.png" alt="School crest preview" className="w-full h-full object-contain" />
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Camied Behills Logo</h4>
                  <p className="text-xs text-slate-500 mt-1">Stored securely in the application assets</p>
                </CardBody>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'academic' && (
          <div className="max-w-2xl animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Active Term & Academic Calendar</CardTitle>
              </CardHeader>
              <CardBody className="space-y-6">
                <Select
                  label="Active Term *"
                  value={activeTerm}
                  onChange={(e) => setActiveTerm(e.target.value as Term)}
                  options={TERMS.map((t) => ({ value: t, label: t }))}
                />
                <Input
                  label="Active Academic Year *"
                  placeholder="e.g. 2025/2026"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  required
                />
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl text-amber-800 dark:text-amber-300 text-sm">
                  <strong>Important Notice:</strong> Modifying the active academic term affects invoicing, fee schedules, exam records, and student report card calculations globally across the portal.
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {activeTab === 'classes' && (
          <div className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Institutional Class Channels</CardTitle>
              </CardHeader>
              <CardBody>
                <p className="text-sm text-slate-500 mb-6">
                  Select which class levels are active in the system. Disabling a level hides it from enrollment portals and grading pipelines without deleting historical student transcripts.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {CLASS_LEVELS.map((lvl) => {
                    const isActive = classLevels[lvl];
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => handleToggleClass(lvl)}
                        className={`p-4 rounded-xl border text-center font-medium transition-all duration-200 ${
                          isActive
                            ? 'border-primary-500 bg-primary-50/30 dark:bg-primary-950/10 text-primary-700 dark:text-primary-300 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="text-sm font-semibold">{lvl}</div>
                        <div className="text-[10px] mt-1 uppercase tracking-wider font-bold">
                          {isActive ? 'Active' : 'Disabled'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
