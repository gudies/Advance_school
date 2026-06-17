import { PageWrapper } from '../../../../components/layout/PageWrapper';
import { Card, CardBody, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Clock, Calendar, BookOpen, MapPin } from 'lucide-react';

interface TimetableSlot {
  time: string;
  subject: string;
  classLevel: string;
  room: string;
  duration: string;
}

export default function TeacherTimetablePage() {
  const schedule: Record<string, TimetableSlot[]> = {
    'Monday': [
      { time: '08:30 AM', subject: 'Mathematics', classLevel: 'JHS Level 1 (Class Alpha)', room: 'Block A - Room 101', duration: '90 mins' },
      { time: '10:45 AM', subject: 'ICT & Technology', classLevel: 'JHS Level 2 (Class Beta)', room: 'Computer Lab 1', duration: '60 mins' }
    ],
    'Tuesday': [
      { time: '09:30 AM', subject: 'Mathematics', classLevel: 'JHS Level 1 (Class Alpha)', room: 'Block A - Room 101', duration: '90 mins' },
      { time: '01:15 PM', subject: 'General Sciences', classLevel: 'JHS Level 3 (Class Alpha)', room: 'Science Lab 2', duration: '90 mins' }
    ],
    'Wednesday': [
      { time: '08:30 AM', subject: 'Mathematics', classLevel: 'JHS Level 1 (Class Alpha)', room: 'Block A - Room 101', duration: '90 mins' },
      { time: '11:30 AM', subject: 'ICT & Technology', classLevel: 'JHS Level 2 (Class Beta)', room: 'Computer Lab 1', duration: '60 mins' }
    ],
    'Thursday': [
      { time: '10:45 AM', subject: 'ICT & Technology', classLevel: 'JHS Level 2 (Class Beta)', room: 'Computer Lab 1', duration: '60 mins' },
      { time: '02:00 PM', subject: 'Mathematics (Practical)', classLevel: 'JHS Level 1 (Class Alpha)', room: 'Block A - Room 101', duration: '60 mins' }
    ],
    'Friday': [
      { time: '09:30 AM', subject: 'General Sciences', classLevel: 'JHS Level 3 (Class Alpha)', room: 'Science Lab 2', duration: '90 mins' },
      { time: '01:15 PM', subject: 'Academic Staff Briefing', classLevel: 'All Teachers', room: 'Conference Hall', duration: '60 mins' }
    ]
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <PageWrapper
      title="My Teaching Timetable"
      subtitle="View your assigned courses, lecture schedules, allocated classrooms, and teaching cycles."
      breadcrumbs={[
        { label: 'Teacher Portal', path: '/teacher' },
        { label: 'Weekly Timetable' }
      ]}
    >
      <div className="grid grid-cols-1 gap-6">
        {days.map((day) => {
          const slots = schedule[day] || [];
          return (
            <Card key={day} className="overflow-hidden">
              <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b border-border-secondary py-3">
                <CardTitle className="text-sm font-extrabold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <Calendar size={16} className="text-primary-500" />
                  {day}
                </CardTitle>
              </CardHeader>
              <CardBody className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
                {slots.length > 0 ? (
                  slots.map((slot, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-all gap-4">
                      {/* Left: Time and Duration */}
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-primary-50 dark:bg-primary-950/20 text-primary-700 dark:text-primary-400 rounded-xl flex flex-col items-center justify-center shrink-0 font-bold border border-primary-100/50 dark:border-primary-950/30">
                          <Clock size={16} />
                          <span className="text-[10px] uppercase mt-1 leading-none">{slot.time.split(' ')[0]}</span>
                          <span className="text-[8px] opacity-80 leading-none mt-0.5">{slot.time.split(' ')[1]}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-800 dark:text-white">{slot.subject}</span>
                            <Badge variant={slot.classLevel.includes('All') ? 'warning' : 'primary'} className="text-[9px]">
                              {slot.duration}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <BookOpen size={12} />
                            <span>{slot.classLevel}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Room Location */}
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 md:text-right md:justify-end">
                        <MapPin size={14} className="text-slate-400 shrink-0" />
                        <span className="font-medium">{slot.room}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-slate-450 text-xs italic">No teaching slots scheduled for this day.</div>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>
    </PageWrapper>
  );
}
