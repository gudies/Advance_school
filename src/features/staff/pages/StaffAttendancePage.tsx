import { useState, useMemo } from 'react';
import { useStaff } from '../hooks/useStaff';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { StatCard } from '../../../components/data-display/StatCard';
import { LocalStorageAdapter } from '../../../services/adapters/localStorageAdapter';
import { Staff, StaffAttendance } from '../../../types';
import { Save, Calendar as CalendarIcon, CheckCircle, Clock, ShieldAlert } from 'lucide-react';
import { useNotificationStore } from '../../../stores/notificationStore';



export default function StaffAttendancePage() {
  const { staffList } = useStaff();
  const addToast = useNotificationStore(state => state.addToast);
  
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const adapter = useMemo(() => new LocalStorageAdapter<StaffAttendance>('advance_staff_attendance'), []);

  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, Partial<StaffAttendance>>>(() => {
    const initialDate = new Date().toISOString().split('T')[0];
    const targetDate = new Date(initialDate).toISOString().split('T')[0];
    const tempAdapter = new LocalStorageAdapter<StaffAttendance>('advance_staff_attendance');
    const tempStaffAdapter = new LocalStorageAdapter<Staff>('advance_staff');
    const existing = tempAdapter.getWhere(a => a.date.startsWith(targetDate));
    const list = tempStaffAdapter.getAll();
    
    const recordMap: Record<string, Partial<StaffAttendance>> = {};
    list.forEach(staff => {
      const found = existing.find(e => e.staffId === staff.id);
      if (found) {
        recordMap[staff.id] = found;
      } else {
        recordMap[staff.id] = {
          staffId: staff.id,
          date: new Date(initialDate).toISOString(),
          status: 'present',
          checkInTime: '07:30',
          checkOutTime: '16:00'
        };
      }
    });
    return recordMap;
  });

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    const targetDate = new Date(date).toISOString().split('T')[0];
    const existing = adapter.getWhere(a => a.date.startsWith(targetDate));
    
    const recordMap: Record<string, Partial<StaffAttendance>> = {};
    staffList.forEach(staff => {
      const found = existing.find(e => e.staffId === staff.id);
      if (found) {
        recordMap[staff.id] = found;
      } else {
        recordMap[staff.id] = {
          staffId: staff.id,
          date: new Date(date).toISOString(),
          status: 'present',
          checkInTime: '07:30',
          checkOutTime: '16:00'
        };
      }
    });
    setAttendanceRecords(recordMap);
  };

  const handleUpdateRecord = (staffId: string, field: keyof StaffAttendance, value: string) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [staffId]: {
        ...prev[staffId],
        [field]: value
      }
    }));
  };

  const handleSaveAll = () => {
    // Delete existing for this date to prevent duplicates
    const targetDate = new Date(selectedDate).toISOString().split('T')[0];
    const existing = adapter.getWhere(a => a.date.startsWith(targetDate));
    existing.forEach(e => adapter.delete(e.id));

    // Save all new records
    Object.values(attendanceRecords).forEach(record => {
      adapter.create(record as Omit<StaffAttendance, 'id'>);
    });

    addToast({
      type: 'success',
      title: 'Attendance Saved',
      message: `Staff attendance for ${selectedDate} has been saved successfully.`
    });
  };

  // Stats
  const activeStaff = staffList.filter(s => s.status === 'active');
  const presentCount = Object.values(attendanceRecords).filter(r => r.status === 'present').length;
  const absentCount = Object.values(attendanceRecords).filter(r => r.status === 'absent').length;
  const lateCount = Object.values(attendanceRecords).filter(r => r.status === 'late').length;

  return (
    <PageWrapper
      title="Staff Attendance"
      subtitle="Manage daily check-ins, check-outs, and track staff availability."
      breadcrumbs={[
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Staff', path: '/staff' },
        { label: 'Attendance' },
      ]}
      action={
        <Button variant="primary" onClick={handleSaveAll}>
          <Save className="h-4 w-4 mr-2" /> Save Attendance
        </Button>
      }
    >
      <div className="space-y-6">
        <Card>
          <CardBody className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="p-3 bg-primary-50 text-primary-600 rounded-lg">
                <CalendarIcon size={24} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Select Date</p>
                <Input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="grid grid-4 gap-4">
          <StatCard title="Total Staff" value={activeStaff.length} icon={<CalendarIcon size={20} />} />
          <StatCard title="Present" value={presentCount} icon={<CheckCircle size={20} />} className="border-l-4 border-success-500" />
          <StatCard title="Late" value={lateCount} icon={<Clock size={20} />} className="border-l-4 border-warning-500" />
          <StatCard title="Absent" value={absentCount} icon={<ShieldAlert size={20} />} className="border-l-4 border-danger-500" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Register - {new Date(selectedDate).toLocaleDateString()}</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-secondary text-secondary font-medium border-b border-border-secondary uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Staff Name</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3 w-40">Status</th>
                  <th className="px-6 py-3 w-32">Check In</th>
                  <th className="px-6 py-3 w-32">Check Out</th>
                  <th className="px-6 py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-secondary">
                {activeStaff.map(staff => {
                  const record = attendanceRecords[staff.id];
                  if (!record) return null;

                  return (
                    <tr key={staff.id} className="hover:bg-surface-secondary/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex-center font-bold text-xs">
                            {staff.firstName[0]}{staff.lastName[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white leading-none">
                              {staff.firstName} {staff.lastName}
                            </p>
                            <p className="text-[10px] text-tertiary mt-0.5">{staff.staffId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 capitalize text-secondary">{staff.role.replace('_', ' ')}</td>
                      <td className="px-6 py-4">
                        <Select 
                          value={record.status as string}
                          onChange={(e) => handleUpdateRecord(staff.id, 'status', e.target.value)}
                          options={[
                            { value: 'present', label: 'Present' },
                            { value: 'late', label: 'Late' },
                            { value: 'absent', label: 'Absent' },
                            { value: 'excused', label: 'Excused' }
                          ]}
                          className={
                            record.status === 'present' ? 'text-success-700 bg-success-50' : 
                            record.status === 'late' ? 'text-warning-700 bg-warning-50' : 
                            record.status === 'absent' ? 'text-danger-700 bg-danger-50' : ''
                          }
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Input 
                          type="time" 
                          value={record.checkInTime || ''}
                          onChange={(e) => handleUpdateRecord(staff.id, 'checkInTime', e.target.value)}
                          disabled={record.status === 'absent'}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Input 
                          type="time" 
                          value={record.checkOutTime || ''}
                          onChange={(e) => handleUpdateRecord(staff.id, 'checkOutTime', e.target.value)}
                          disabled={record.status === 'absent'}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Input 
                          placeholder="Add note..."
                          value={record.notes || ''}
                          onChange={(e) => handleUpdateRecord(staff.id, 'notes', e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PageWrapper>
  );
}
