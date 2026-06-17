import { useMemo } from 'react';
import { LocalStorageAdapter } from '../../../../services/adapters/localStorageAdapter';
import { Student, AttendanceRecord } from '../../../../types/student';
import { ExamResult, Assessment, GHANA_GRADING_SCALE } from '../../../../types/academic';
import { TimetableEntry } from '../../teacher/hooks/useTeacher';

export function useStudent(studentName: { firstName: string; lastName: string }) {
  const studentAdapter = useMemo(() => new LocalStorageAdapter<Student>('advance_students'), []);
  const attendanceAdapter = useMemo(() => new LocalStorageAdapter<AttendanceRecord>('advance_student_attendance'), []);
  const resultAdapter = useMemo(() => new LocalStorageAdapter<ExamResult>('advance_exam_results'), []);
  const assessmentAdapter = useMemo(() => new LocalStorageAdapter<Assessment>('advance_assessments'), []);

  // Resolve student profile
  const student = useMemo(() => {
    const all = studentAdapter.getAll();
    return all.find(
      (s) => 
        s.firstName.toLowerCase() === studentName.firstName.toLowerCase() && 
        s.lastName.toLowerCase() === studentName.lastName.toLowerCase()
    ) || null;
  }, [studentAdapter, studentName]);

  // timetable based on student's class (default to JHS 1 if not set)
  const timetable = useMemo<TimetableEntry[]>(() => {
    if (!student) return [];
    return [
      { id: 'st1', day: 'Monday', time: '08:30 - 09:30', subject: 'Mathematics', classLevel: student.classLevel, room: `${student.classLevel} Room` },
      { id: 'st2', day: 'Monday', time: '10:00 - 11:00', subject: 'English Language', classLevel: student.classLevel, room: `${student.classLevel} Room` },
      { id: 'st3', day: 'Tuesday', time: '09:00 - 10:00', subject: 'Integrated Science', classLevel: student.classLevel, room: 'Science Lab' },
      { id: 'st4', day: 'Wednesday', time: '11:30 - 12:30', subject: 'Social Studies', classLevel: student.classLevel, room: `${student.classLevel} Room` },
      { id: 'st5', day: 'Thursday', time: '08:30 - 09:30', subject: 'ICT', classLevel: student.classLevel, room: 'IT Lab' },
      { id: 'st6', day: 'Friday', time: '10:30 - 11:30', subject: 'French', classLevel: student.classLevel, room: `${student.classLevel} Room` }
    ];
  }, [student]);

  const attendance = useMemo(() => {
    if (!student) return [];
    return attendanceAdapter.getAll().filter((a) => a.studentId === student.id);
  }, [attendanceAdapter, student]);

  const results = useMemo(() => {
    if (!student) return [];
    const allResults = resultAdapter.getAll();
    const allAssessments = assessmentAdapter.getAll();

    return allResults
      .filter((r) => r.studentId === student.id)
      .map((r) => {
        const assess = allAssessments.find((a) => a.id === r.assessmentId);
        const scale = GHANA_GRADING_SCALE.find((s) => r.score >= s.minScore && r.score <= s.maxScore);
        return {
          ...r,
          assessmentName: assess ? assess.title : 'Unknown Assessment',
          subject: assess ? assess.subject : 'General',
          type: assess ? assess.type : 'class_test',
          grade: scale ? scale.grade : '9',
          remark: r.comments || (scale ? scale.remark : 'Fail')
        };
      });
  }, [resultAdapter, assessmentAdapter, student]);

  const attendanceSummary = useMemo(() => {
    if (attendance.length === 0) return { rate: 100, present: 0, absent: 0, late: 0, excused: 0 };
    const presentCount = attendance.filter(a => a.status === 'present').length;
    const absentCount = attendance.filter(a => a.status === 'absent').length;
    const lateCount = attendance.filter(a => a.status === 'late').length;
    const excusedCount = attendance.filter(a => a.status === 'excused').length;

    const totalDays = attendance.length;
    const rate = Math.round(((presentCount + lateCount) / totalDays) * 100);

    return {
      rate,
      present: presentCount,
      absent: absentCount,
      late: lateCount,
      excused: excusedCount
    };
  }, [attendance]);

  return {
    student,
    timetable,
    attendance,
    results,
    attendanceSummary
  };
}
