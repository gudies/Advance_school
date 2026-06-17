import { useState, useCallback, useMemo } from 'react';
import { LocalStorageAdapter } from '../../../services/adapters/localStorageAdapter';
import { Assessment, ExamResult, SubjectResult, ReportCard, Subject, GradeValue, GHANA_GRADING_SCALE } from '../../../types/academic';
import { Student } from '../../../types/student';
import { Term, ClassLevel } from '../../../types/common';

export function useAcademics() {
  const assessmentAdapter = useMemo(() => new LocalStorageAdapter<Assessment>('advance_assessments'), []);
  const resultAdapter = useMemo(() => new LocalStorageAdapter<ExamResult>('advance_exam_results'), []);
  const studentAdapter = useMemo(() => new LocalStorageAdapter<Student>('advance_students'), []);

  const [assessments, setAssessments] = useState<Assessment[]>(() => assessmentAdapter.getAll());
  const [results, setResults] = useState<ExamResult[]>(() => resultAdapter.getAll());

  const refreshAssessments = useCallback(() => {
    setAssessments(assessmentAdapter.getAll());
  }, [assessmentAdapter]);

  const refreshResults = useCallback(() => {
    setResults(resultAdapter.getAll());
  }, [resultAdapter]);

  const createAssessment = useCallback((newAssess: Assessment) => {
    assessmentAdapter.create(newAssess);
    refreshAssessments();
  }, [assessmentAdapter, refreshAssessments]);

  const recordExamResult = useCallback((newResult: ExamResult) => {
    const all = resultAdapter.getAll();
    const existing = all.find(
      (r) => r.assessmentId === newResult.assessmentId && r.studentId === newResult.studentId
    );
    if (existing) {
      resultAdapter.update(existing.id, newResult);
    } else {
      resultAdapter.create(newResult);
    }
    refreshResults();
  }, [resultAdapter, refreshResults]);

  // Lookup grade value and remark based on score
  const getGradeFromScore = useCallback((score: number): { grade: GradeValue; remark: string } => {
    const scale = GHANA_GRADING_SCALE.find((s) => score >= s.minScore && score <= s.maxScore);
    return scale ? { grade: scale.grade, remark: scale.remark } : { grade: '9', remark: 'Fail' };
  }, []);

  const getGradebook = useCallback((classLevel: ClassLevel, subject: Subject) => {
    const studentsInClass = studentAdapter.getAll().filter((s) => s.classLevel === classLevel && s.status === 'active');
    const classAssessments = assessmentAdapter.getAll().filter(
      (a) => a.classLevel === classLevel && a.subject === subject
    );

    // Find end-of-term assessment
    const examAssess = classAssessments.find((a) => a.type === 'end_of_term');
    // Find class tests
    const testAssessments = classAssessments.filter((a) => a.type === 'class_test');

    const resultsList = resultAdapter.getAll();

    let currentPosition = 1;
    let previousScore = -1;

    return studentsInClass.map((student) => {
      // Calculate average test score (scaled to 30%)
      const studentTestScores = testAssessments.map((a) => {
        const res = resultsList.find((r) => r.assessmentId === a.id && r.studentId === student.id);
        return res ? (res.score / a.maxScore) * 30 : 0;
      });
      const classWorkScore = studentTestScores.length > 0
        ? Math.round(studentTestScores.reduce((acc, s) => acc + s, 0) / studentTestScores.length * 10) / 10
        : 0;

      // Calculate exam score (scaled to 70%)
      const examRes = examAssess 
        ? resultsList.find((r) => r.assessmentId === examAssess.id && r.studentId === student.id)
        : null;
      const examScore = examRes && examAssess
        ? Math.round((examRes.score / examAssess.maxScore) * 70 * 10) / 10
        : 0;

      const totalScore = Math.round(classWorkScore + examScore);
      const { grade, remark } = getGradeFromScore(totalScore);

      return {
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        classWorkScore,
        examScore,
        totalScore,
        grade,
        remark,
        examRawScore: examRes ? examRes.score : 0,
        examMaxScore: examAssess ? examAssess.maxScore : 100
      };
    }).sort((a, b) => b.totalScore - a.totalScore)
      .map((student, idx) => {
        if (idx === 0) {
          currentPosition = 1;
        } else if (student.totalScore < previousScore) {
          currentPosition = idx + 1;
        }
        previousScore = student.totalScore;
        return {
          ...student,
          position: currentPosition
        };
      });
  }, [studentAdapter, assessmentAdapter, resultAdapter, getGradeFromScore]);

  const generateReportCard = useCallback((studentId: string, term: Term, academicYear: string): ReportCard | null => {
    const student = studentAdapter.getById(studentId);
    if (!student) return null;

    const subjects: Subject[] = [
      'English Language', 'Mathematics', 'Integrated Science', 'Social Studies', 
      'ICT', 'French', 'Ghanaian Language', 'RME'
    ];

    const resultsSummary: SubjectResult[] = [];
    let totalScore = 0;

    subjects.forEach((subj) => {
      const gradebook = getGradebook(student.classLevel, subj);
      const studentRecord = gradebook.find((r) => r.studentId === studentId);

      if (studentRecord) {
        resultsSummary.push({
          subject: subj,
          classWorkScore: studentRecord.classWorkScore,
          examScore: studentRecord.examScore,
          totalScore: studentRecord.totalScore,
          grade: studentRecord.grade,
          remark: studentRecord.remark,
          positionInSubject: studentRecord.position
        });
        totalScore += studentRecord.totalScore;
      }
    });

    if (resultsSummary.length === 0) return null;

    const averageScore = Math.round((totalScore / resultsSummary.length) * 100) / 100;

    // Calculate overall class positions
    const classStudents = studentAdapter.getAll().filter((s) => s.classLevel === student.classLevel && s.status === 'active');
    const classTotalScores = classStudents.map((s) => {
      let sum = 0;
      subjects.forEach((subj) => {
        const gradebook = getGradebook(student.classLevel, subj);
        const record = gradebook.find((r) => r.studentId === s.id);
        if (record) sum += record.totalScore;
      });
      return { studentId: s.id, total: sum };
    }).sort((a, b) => b.total - a.total);

    const overallPosition = classTotalScores.findIndex((s) => s.studentId === studentId) + 1;

    // Default comments
    let teacherComment = 'A good performance. Keep it up.';
    if (averageScore >= 80) teacherComment = 'Excellent work. Maintain this standard.';
    else if (averageScore < 50) teacherComment = 'Needs to put in more effort next term.';

    return {
      id: `rep_${studentId}_${term.replace(' ', '')}`,
      studentId,
      studentName: `${student.firstName} ${student.lastName}`,
      classLevel: student.classLevel,
      term,
      academicYear,
      results: resultsSummary,
      totalScore,
      averageScore,
      overallPosition,
      classSize: classStudents.length,
      attendanceSummary: {
        totalDays: 60,
        daysPresent: 58,
        daysAbsent: 2
      },
      teacherComment,
      headTeacherComment: averageScore >= 70 ? 'A very promising result. Outstanding!' : 'Satisfactory progress. Put in more work.',
      nextTermBegins: '2026-09-08',
      dateIssued: new Date().toISOString().split('T')[0]
    };
  }, [studentAdapter, getGradebook]);

  return {
    assessments,
    results,
    createAssessment,
    recordExamResult,
    getGradebook,
    generateReportCard,
    refreshAssessments,
    refreshResults
  };
}
