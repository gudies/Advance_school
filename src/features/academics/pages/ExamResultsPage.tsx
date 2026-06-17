import { useState, useMemo } from 'react';
import { useAcademics } from '../hooks/useAcademics';
import { useAuthStore } from '../../../stores/authStore';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';
import { ClassLevel, Term, CLASS_LEVELS, TERMS, ACADEMIC_YEAR } from '../../../types/common';
import { Subject, Assessment, ExamResult } from '../../../types/academic';
import { useNotificationStore } from '../../../stores/notificationStore';
import { LocalStorageAdapter } from '../../../services/adapters/localStorageAdapter';
import { Student } from '../../../types/student';
import { Save } from 'lucide-react';

const SUBJECT_OPTIONS: { value: Subject; label: string }[] = [
  { value: 'English Language', label: 'English Language' },
  { value: 'Mathematics', label: 'Mathematics' },
  { value: 'Integrated Science', label: 'Integrated Science' },
  { value: 'Social Studies', label: 'Social Studies' },
  { value: 'ICT', label: 'ICT' },
  { value: 'French', label: 'French' },
  { value: 'Ghanaian Language', label: 'Ghanaian Language' },
  { value: 'RME', label: 'Religious & Moral Education (RME)' }
];

export default function ExamResultsPage() {
  const { assessments, results, createAssessment, recordExamResult, getGradebook } = useAcademics();
  const { user } = useAuthStore();
  const addToast = useNotificationStore((state) => state.addToast);

  const [classLevel, setClassLevel] = useState<ClassLevel>('JHS 1');
  const [subject, setSubject] = useState<Subject>('English Language');
  const [term, setTerm] = useState<Term>('Term 2');
  
  const studentsInClass = useMemo(() => {
    return new LocalStorageAdapter<Student>('advance_students')
      .getAll()
      .filter((s) => s.classLevel === classLevel && s.status === 'active');
  }, [classLevel]);

  // Find or create assessment IDs
  const assessmentIds = useMemo(() => {
    if (!user) return { testId: '', examId: '' };

    // Find class test assessment
    let test = assessments.find(
      (a) => a.classLevel === classLevel && a.subject === subject && a.type === 'class_test'
    );
    // Find exam assessment
    let exam = assessments.find(
      (a) => a.classLevel === classLevel && a.subject === subject && a.type === 'end_of_term'
    );

    // If they don't exist, we auto-create placeholders
    if (!test) {
      const newTest: Assessment = {
        id: `assess_t_${classLevel.replace(' ', '')}_${subject.replace(' ', '')}`,
        title: `${subject} Class Work Average`,
        classLevel,
        subject,
        type: 'class_test',
        maxScore: 100,
        date: new Date().toISOString().split('T')[0],
        teacherId: user.id
      };
      createAssessment(newTest);
      test = newTest;
    }

    if (!exam) {
      const newExam: Assessment = {
        id: `assess_e_${classLevel.replace(' ', '')}_${subject.replace(' ', '')}`,
        title: `${subject} End of Term Exam`,
        classLevel,
        subject,
        type: 'end_of_term',
        maxScore: 100,
        date: new Date().toISOString().split('T')[0],
        teacherId: user.id
      };
      createAssessment(newExam);
      exam = newExam;
    }

    return {
      testId: test.id,
      examId: exam.id
    };
  }, [classLevel, subject, assessments, user, createAssessment]);

  // Temporary state for editing scores
  const [editingScores, setEditingScores] = useState<Record<string, { classWork: number; exam: number }>>(() => {
    const tempAdapter = new LocalStorageAdapter<Student>('advance_students');
    const classStudents = tempAdapter.getAll().filter((s) => s.classLevel === 'JHS 1' && s.status === 'active');
    const testId = `assess_t_JHS1_EnglishLanguage`;
    const examId = `assess_e_JHS1_EnglishLanguage`;
    
    const tempResultsAdapter = new LocalStorageAdapter<ExamResult>('advance_exam_results');
    const allResults = tempResultsAdapter.getAll();
    
    const scores: Record<string, { classWork: number; exam: number }> = {};
    classStudents.forEach((student) => {
      const testRes = allResults.find((r) => r.assessmentId === testId && r.studentId === student.id);
      const examRes = allResults.find((r) => r.assessmentId === examId && r.studentId === student.id);

      scores[student.id] = {
        classWork: testRes ? testRes.score : 0,
        exam: examRes ? examRes.score : 0
      };
    });
    return scores;
  });

  const loadEditingScores = (newClass: ClassLevel, newSub: Subject) => {
    const tempAdapter = new LocalStorageAdapter<Student>('advance_students');
    const classStudents = tempAdapter.getAll().filter((s) => s.classLevel === newClass && s.status === 'active');
    
    const test = assessments.find((a) => a.classLevel === newClass && a.subject === newSub && a.type === 'class_test');
    const exam = assessments.find((a) => a.classLevel === newClass && a.subject === newSub && a.type === 'end_of_term');
    
    const testId = test ? test.id : `assess_t_${newClass.replace(' ', '')}_${newSub.replace(' ', '')}`;
    const examId = exam ? exam.id : `assess_e_${newClass.replace(' ', '')}_${newSub.replace(' ', '')}`;
    
    const scores: Record<string, { classWork: number; exam: number }> = {};
    classStudents.forEach((student) => {
      const testRes = results.find((r) => r.assessmentId === testId && r.studentId === student.id);
      const examRes = results.find((r) => r.assessmentId === examId && r.studentId === student.id);

      scores[student.id] = {
        classWork: testRes ? testRes.score : 0,
        exam: examRes ? examRes.score : 0
      };
    });
    setEditingScores(scores);
  };

  const handleScoreChange = (studentId: string, field: 'classWork' | 'exam', value: string) => {
    const num = Math.min(Math.max(Number(value) || 0, 0), 100); // boundary check [0, 100]
    setEditingScores((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: num
      }
    }));
  };

  const handleSaveGrades = () => {
    try {
      studentsInClass.forEach((student) => {
        const studentScores = editingScores[student.id] || { classWork: 0, exam: 0 };
        
        // Save test result
        const testRes: ExamResult = {
          id: `res_t_${student.id}_${assessmentIds.testId}`,
          assessmentId: assessmentIds.testId,
          studentId: student.id,
          score: studentScores.classWork
        };
        recordExamResult(testRes);

        // Save exam result
        const examRes: ExamResult = {
          id: `res_e_${student.id}_${assessmentIds.examId}`,
          assessmentId: assessmentIds.examId,
          studentId: student.id,
          score: studentScores.exam
        };
        recordExamResult(examRes);
      });

      addToast({ type: 'success', message: 'Grades successfully recorded and saved to local storage!' });
    } catch (err) {
      addToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to save grades.' });
    }
  };

  const gradebookData = useMemo(() => {
    return getGradebook(classLevel, subject);
  }, [getGradebook, classLevel, subject]);

  const breadcrumbs = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Academics' },
    { label: 'Gradebook' }
  ];

  return (
    <PageWrapper 
      title="Institutional Gradebook & Marks Entry" 
      subtitle="Select active class channels, record WAEC-aligned test scores, and compile student grades."
      breadcrumbs={breadcrumbs}
      action={
        <Button variant="primary" onClick={handleSaveGrades} leftIcon={<Save size={18} />}>
          Save Grades
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Class Level"
              value={classLevel}
              onChange={(e) => {
                const val = e.target.value as ClassLevel;
                setClassLevel(val);
                loadEditingScores(val, subject);
              }}
              options={CLASS_LEVELS.map((c) => ({ value: c, label: c }))}
            />
            <Select
              label="Subject"
              value={subject}
              onChange={(e) => {
                const val = e.target.value as Subject;
                setSubject(val);
                loadEditingScores(classLevel, val);
              }}
              options={SUBJECT_OPTIONS}
            />
            <Select
              label="Term"
              value={term}
              onChange={(e) => {
                const val = e.target.value as Term;
                setTerm(val);
                loadEditingScores(classLevel, subject);
              }}
              options={TERMS.map((t) => ({ value: t, label: t }))}
            />
          </CardBody>
        </Card>

        {/* Grades Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Continuous Assessment Grades & Positions</CardTitle>
              <span className="text-xs text-slate-400 font-mono">Academic Cycle: {ACADEMIC_YEAR}</span>
            </div>
          </CardHeader>
          <CardBody>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/50 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4">Class Work (Out of 100)</th>
                    <th className="px-6 py-4">End of Term Exam (Out of 100)</th>
                    <th className="px-6 py-4">Weighted Total (30% + 70%)</th>
                    <th className="px-6 py-4">WAEC Grade</th>
                    <th className="px-6 py-4">Remark</th>
                    <th className="px-6 py-4 text-center">Rank</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {studentsInClass.length > 0 ? (
                    studentsInClass.map((student) => {
                      const editScores = editingScores[student.id] || { classWork: 0, exam: 0 };
                      const compiled = gradebookData.find((g) => g.studentId === student.id);

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                          <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                            {student.firstName} {student.lastName}
                          </td>
                          <td className="px-6 py-3">
                            <div className="w-24">
                              <Input
                                type="number"
                                value={editScores.classWork || ''}
                                onChange={(e) => handleScoreChange(student.id, 'classWork', e.target.value)}
                                className="h-8 py-1 px-2 text-xs"
                                placeholder="0"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <div className="w-24">
                              <Input
                                type="number"
                                value={editScores.exam || ''}
                                onChange={(e) => handleScoreChange(student.id, 'exam', e.target.value)}
                                className="h-8 py-1 px-2 text-xs"
                                placeholder="0"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold text-primary-600 dark:text-primary-400">
                            {compiled ? compiled.totalScore : 0}%
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={compiled && Number(compiled.grade) <= 3 ? 'success' : compiled && Number(compiled.grade) <= 6 ? 'primary' : 'danger'}>
                              {compiled ? compiled.grade : '9'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-slate-500 font-light">
                            {compiled ? compiled.remark : 'Fail'}
                          </td>
                          <td className="px-6 py-4 text-center font-bold font-heading text-slate-800 dark:text-slate-200">
                            {compiled ? compiled.position : '-'}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                        No active students enrolled in {classLevel} found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>
    </PageWrapper>
  );
}
