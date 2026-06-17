import { useCallback, useMemo } from 'react';
import { LocalStorageAdapter } from '../../../../services/adapters/localStorageAdapter';
import { Staff } from '../../../../types/staff';
import { Student, AttendanceRecord } from '../../../../types/student';
import { ClassLevel } from '../../../../types/common';
import { Subject } from '../../../../types/academic';

export interface TimetableEntry {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  time: string;
  subject: Subject;
  classLevel: ClassLevel;
  room: string;
}

export function useTeacher(teacherEmail: string) {
  const staffAdapter = useMemo(() => new LocalStorageAdapter<Staff>('advance_staff'), []);
  const studentAdapter = useMemo(() => new LocalStorageAdapter<Student>('advance_students'), []);
  const attendanceAdapter = useMemo(() => new LocalStorageAdapter<AttendanceRecord>('advance_student_attendance'), []);

  // Resolve teacher profile
  const teacher = useMemo(() => {
    const all = staffAdapter.getAll();
    return all.find((s) => s.email.toLowerCase() === teacherEmail.toLowerCase()) || null;
  }, [staffAdapter, teacherEmail]);

  // Mock timetable for teacher
  const timetable = useMemo<TimetableEntry[]>(() => {
    return [
      { id: 't1', day: 'Monday', time: '08:30 - 09:30', subject: 'Mathematics', classLevel: 'JHS 1', room: 'JHS 1 Room' },
      { id: 't2', day: 'Monday', time: '10:00 - 11:00', subject: 'Mathematics', classLevel: 'JHS 2', room: 'JHS 2 Room' },
      { id: 't3', day: 'Tuesday', time: '09:00 - 10:00', subject: 'Integrated Science', classLevel: 'JHS 1', room: 'Science Lab' },
      { id: 't4', day: 'Wednesday', time: '11:30 - 12:30', subject: 'Mathematics', classLevel: 'JHS 3', room: 'JHS 3 Room' },
      { id: 't5', day: 'Thursday', time: '08:30 - 09:30', subject: 'Mathematics', classLevel: 'JHS 2', room: 'JHS 2 Room' },
      { id: 't6', day: 'Friday', time: '10:30 - 11:30', subject: 'Integrated Science', classLevel: 'JHS 3', room: 'Science Lab' }
    ];
  }, []);

  const getStudentsByClass = useCallback((classLevel: ClassLevel) => {
    return studentAdapter.getAll().filter((s) => s.classLevel === classLevel && s.status === 'active');
  }, [studentAdapter]);

  const saveClassAttendance = useCallback((classLevel: ClassLevel, date: string, records: { studentId: string; status: AttendanceRecord['status']; notes?: string }[]) => {
    const existing = attendanceAdapter.getAll();
    
    // Filter out existing records for this class and date
    const studentsInClassIds = getStudentsByClass(classLevel).map(s => s.id);
    const updatedAttendance = existing.filter(rec => !(rec.date === date && studentsInClassIds.includes(rec.studentId)));

    // Create new records
    records.forEach(rec => {
      updatedAttendance.push({
        id: `att_${rec.studentId}_${date}`,
        studentId: rec.studentId,
        date,
        status: rec.status,
        notes: rec.notes
      });
    });

    localStorage.setItem('advance_student_attendance', JSON.stringify(updatedAttendance));
    return true;
  }, [attendanceAdapter, getStudentsByClass]);

  const getClassAttendanceForDate = useCallback((classLevel: ClassLevel, date: string) => {
    const allAtt = attendanceAdapter.getAll();
    const studentsInClassIds = getStudentsByClass(classLevel).map(s => s.id);
    return allAtt.filter(rec => rec.date === date && studentsInClassIds.includes(rec.studentId));
  }, [attendanceAdapter, getStudentsByClass]);

  return {
    teacher,
    timetable,
    getStudentsByClass,
    saveClassAttendance,
    getClassAttendanceForDate
  };
}
