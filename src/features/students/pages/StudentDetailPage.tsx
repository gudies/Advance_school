import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStudents } from '../hooks/useStudents';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Tabs } from '../../../components/ui/Tabs';
import { LocalStorageAdapter } from '../../../services/adapters/localStorageAdapter';
import { Payment, Status } from '../../../types';
import { useConfirmationStore } from '../../../stores/confirmationStore';
import { 
  ArrowLeft, 
  User, 
  BookOpen, 
  Calendar, 
  Wallet, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  UserX 
} from 'lucide-react';

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getStudentById, updateAdmissionStatus } = useStudents();
  const { askConfirm } = useConfirmationStore();
  
  const student = useMemo(() => (id ? getStudentById(id) : null), [id, getStudentById]);
  const [activeTab, setActiveTab] = useState('bio');

  // Load actual payments for this student
  const studentPayments = useMemo(() => {
    if (!student) return [];
    const paymentsAdapter = new LocalStorageAdapter<Payment>('advance_payments');
    return paymentsAdapter.getAll().filter((p) => p.studentId === student.id);
  }, [student]);

  if (!student) {
    return (
      <PageWrapper title="Student Details">
        <Card>
          <CardBody className="py-12 text-center text-slate-400">
            Student record not found.
            <div className="mt-4">
              <Button variant="outline" onClick={() => navigate('/students')}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Directory
              </Button>
            </div>
          </CardBody>
        </Card>
      </PageWrapper>
    );
  }

  const handleStatusChange = (newStatus: 'active' | 'suspended' | 'inactive') => {
    askConfirm({
      title: 'Update Student Status',
      message: `Are you sure you want to change the student status to "${newStatus}"?`,
      confirmLabel: 'Update Status',
      type: newStatus === 'suspended' ? 'danger' : 'warning',
      onConfirm: () => updateAdmissionStatus(student.id, newStatus as Status)
    });
  };

  const tabs = [
    { id: 'bio', label: 'Bio Profile', icon: <User className="h-4 w-4" /> },
    { id: 'academics', label: 'Academics', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'attendance', label: 'Attendance', icon: <Calendar className="h-4 w-4" /> },
    { id: 'finance', label: 'Fee Payments', icon: <Wallet className="h-4 w-4" /> },
  ];

  return (
    <PageWrapper
      title={`${student.firstName} ${student.lastName}`}
      subtitle={`Profile registry of ${student.firstName} including contact credentials and school history.`}
      breadcrumbs={[
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Students', path: '/students' },
        { label: 'Profile' },
      ]}
      action={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/students')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          {student.status === 'active' || student.status === 'enrolled' ? (
            <Button variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-50 border border-rose-200" onClick={() => handleStatusChange('suspended')}>
              <UserX className="h-4 w-4 mr-2" />
              Suspend Student
            </Button>
          ) : (
            <Button variant="primary" size="sm" className="bg-success-600 hover:bg-success-700 text-white shadow-success" onClick={() => handleStatusChange('active')}>
              Re-activate
            </Button>
          )}
        </div>
      }
    >
      <div className="grid grid-3 gap-6">
        {/* Left Side: Summary Card */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardBody className="flex flex-col items-center text-center p-6 space-y-4">
              <div className="w-24 h-24 rounded-full bg-primary-100 text-primary-700 flex-center font-bold text-2xl select-none shadow-sm">
                {student.firstName[0]}{student.lastName[0]}
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
                  {student.firstName} {student.lastName}
                </h3>
                <p className="text-xs text-secondary font-light">{student.studentId}</p>
              </div>

              <div className="flex gap-2">
                <Badge variant="primary">{student.classLevel}</Badge>
                <Badge variant={student.status === 'active' || student.status === 'enrolled' ? 'success' : 'neutral'} className="capitalize">
                  {student.status}
                </Badge>
              </div>

              <div className="w-full border-t border-slate-100 dark:border-slate-800 pt-4 text-left space-y-3">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="text-xs truncate font-medium">{student.address}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="text-xs font-light">Enrolled: {new Date(student.admissionDate).toLocaleDateString()}</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Guardian Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Guardian Information</CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="space-y-0.5">
                <p className="text-xs text-slate-400 font-light">Full Name:</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{student.guardian.name} ({student.guardian.relationship})</p>
              </div>

              <div className="space-y-0.5">
                <p className="text-xs text-slate-400 font-light">Primary Contacts:</p>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 mt-1">
                  <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="text-xs font-medium">{student.guardian.phone}</span>
                </div>
                {student.guardian.email && (
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 mt-1">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="text-xs font-medium truncate">{student.guardian.email}</span>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Side: Tab Details Panel */}
        <div className="md:col-span-2 space-y-6">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          {/* TAB 1: BIO */}
          {activeTab === 'bio' && (
            <Card>
              <CardBody className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Detailed Bio</h4>
                  <div className="grid grid-2 gap-y-4 gap-x-6">
                    <div>
                      <p className="text-xs text-slate-400 font-light">First Name</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{student.firstName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-light">Last Name</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{student.lastName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-light">Gender</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{student.gender}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-light">Date of Birth</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {new Date(student.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Extended Info</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-slate-400 font-light">Previous School</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{student.previousSchool || 'None Recorded'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-light">Medical Info</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{student.healthInfo || 'No health conditions reported'}</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* TAB 2: ACADEMICS */}
          {activeTab === 'academics' && (
            <Card>
              <CardBody className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Continuous Assessment (Term 1)</h4>
                
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500 shrink-0">
                        <BookOpen size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Mathematics</p>
                        <p className="text-xs text-secondary font-light">Class Teacher: Ama Mensah</p>
                      </div>
                    </div>
                    <Badge variant="success">A1 (92%)</Badge>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500 shrink-0">
                        <BookOpen size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Information & Communications Tech</p>
                        <p className="text-xs text-secondary font-light">Class Teacher: Ama Mensah</p>
                      </div>
                    </div>
                    <Badge variant="primary">B2 (78%)</Badge>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500 shrink-0">
                        <BookOpen size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Integrated Science</p>
                        <p className="text-xs text-secondary font-light">Class Teacher: Kwabena Osei</p>
                      </div>
                    </div>
                    <Badge variant="success">A1 (89%)</Badge>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* TAB 3: ATTENDANCE */}
          {activeTab === 'attendance' && (
            <Card>
              <CardBody className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Weekly Attendance Logs</h4>
                
                <div className="space-y-3">
                  {[
                    { date: '2025-06-12', status: 'present', note: 'Checked in at 8:12 AM' },
                    { date: '2025-06-11', status: 'present', note: 'Checked in at 8:15 AM' },
                    { date: '2025-06-10', status: 'late', note: 'Checked in at 8:45 AM' },
                    { date: '2025-06-09', status: 'present', note: 'Checked in at 8:05 AM' },
                    { date: '2025-06-06', status: 'excused', note: 'PTA excused absence' },
                  ].map((rec, index) => {
                    const statusVar = 
                      rec.status === 'present' ? 'success' :
                      rec.status === 'late' ? 'warning' : 'neutral';
                    return (
                      <div key={index} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/10">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <div>
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{new Date(rec.date).toLocaleDateString()}</p>
                            <p className="text-[10px] text-secondary font-light">{rec.note}</p>
                          </div>
                        </div>
                        <Badge variant={statusVar} className="capitalize">{rec.status}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardBody>
            </Card>
          )}

          {/* TAB 4: FINANCE / FEES */}
          {activeTab === 'finance' && (
            <Card>
              <CardBody className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Terminal Invoices & Receipts</h4>
                
                <div className="space-y-4">
                  {studentPayments.length > 0 ? (
                    studentPayments.map((pay) => (
                      <div key={pay.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/10">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-success-50 dark:bg-success-950/20 text-success-600 dark:text-success-400 rounded-lg shrink-0">
                            <Wallet size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{pay.term} Fee Receipt</p>
                            <p className="text-xs text-secondary font-light mt-0.5">Receipt: {pay.receiptNumber} • Method: {pay.method}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">GH₵{pay.amountPaid.toLocaleString()}</p>
                          <Badge variant="success" className="capitalize mt-1">{pay.status}</Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/30 text-center text-slate-400">
                      No invoices or payments registered for this student.
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
