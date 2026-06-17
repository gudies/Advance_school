import { useState, useMemo } from 'react';
import { useAuthStore } from '../../../../stores/authStore';
import { useTeacher } from '../hooks/useTeacher';
import { useAcademics } from '../../../academics/hooks/useAcademics';
import { PageWrapper } from '../../../../components/layout/PageWrapper';
import { Card, CardHeader, CardTitle, CardBody } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { ClassLevel, CLASS_LEVELS } from '../../../../types/common';
import { Subject, GHANA_GRADING_SCALE } from '../../../../types/academic';
import { useNotificationStore } from '../../../../stores/notificationStore';
import { LocalStorageAdapter } from '../../../../services/adapters/localStorageAdapter';
import { Assessment, ExamResult } from '../../../../types/academic';
import { Student } from '../../../../types/student';
import { Save, ClipboardList } from 'lucide-react';

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

const CLASS_OPTIONS = CLASS_LEVELS.map(c => ({ value: c, label: c }));

export default function GradeEntryPage() {
  const { user } = useAuthStore();
  const teacherEmail = user?.email || 'teacher@camiedbehills.edu.gh';
  
  const { getStudentsByClass, teacher } = useTeacher(teacherEmail);
  const { recordExamResult } = useAcademics();
  const addToast = useNotificationStore((state) => state.addToast);

  const [selectedClass, setSelectedClass] = useState<ClassLevel>('JHS 1');
  const [selectedSubject, setSelectedSubject] = useState<Subject>('Mathematics');
  
  const students = useMemo(() => {
    return getStudentsByClass(selectedClass);
  }, [selectedClass, getStudentsByClass]);

  // Find or create assessment IDs for class/subject
  const resolvedAssessments = useMemo(() => {
    const assessmentAdapter = new LocalStorageAdapter<Assessment>('advance_assessments');
    const all = assessmentAdapter.getAll();
    
    let testAss = all.find(a => a.classLevel === selectedClass && a.subject === selectedSubject && a.type === 'class_test');
    let examAss = all.find(a => a.classLevel === selectedClass && a.subject === selectedSubject && a.type === 'end_of_term');

    if (!testAss) {
      testAss = assessmentAdapter.create({
        title: `${selectedSubject} Class Work`,
        classLevel: selectedClass,
        subject: selectedSubject,
        type: 'class_test',
        maxScore: 30,
        date: new Date().toISOString(),
        teacherId: teacher?.id || 'usr_teacher1'
      });
    }

    if (!examAss) {
      examAss = assessmentAdapter.create({
        title: `${selectedSubject} Terminal Exam`,
        classLevel: selectedClass,
        subject: selectedSubject,
        type: 'end_of_term',
        maxScore: 70,
        date: new Date().toISOString(),
        teacherId: teacher?.id || 'usr_teacher1'
      });
    }

    return {
      testAssId: testAss.id,
      examAssId: examAss.id
    };
  }, [selectedClass, selectedSubject, teacher]);

  // Load existing results into state
  const [scores, setScores] = useState<Record<string, { test: number; exam: number }>>(() => {
    const tempStaffAdapter = new LocalStorageAdapter<Student>('advance_students');
    const classStudents = tempStaffAdapter.getAll().filter((s) => s.classLevel === 'JHS 1' && s.status === 'active');
    
    const assessmentAdapter = new LocalStorageAdapter<Assessment>('advance_assessments');
    const allAssessments = assessmentAdapter.getAll();
    const testAss = allAssessments.find(a => a.classLevel === 'JHS 1' && a.subject === 'Mathematics' && a.type === 'class_test');
    const examAss = allAssessments.find(a => a.classLevel === 'JHS 1' && a.subject === 'Mathematics' && a.type === 'end_of_term');
    
    const testId = testAss ? testAss.id : `assess_t_JHS1_Mathematics`;
    const examId = examAss ? examAss.id : `assess_e_JHS1_Mathematics`;

    const resultAdapter = new LocalStorageAdapter<ExamResult>('advance_exam_results');
    const allResults = resultAdapter.getAll();
    const initialScores: Record<string, { test: number; exam: number }> = {};

    classStudents.forEach((student) => {
      const testRes = allResults.find(r => r.assessmentId === testId && r.studentId === student.id);
      const examRes = allResults.find(r => r.assessmentId === examId && r.studentId === student.id);
      
      initialScores[student.id] = {
        test: testRes ? testRes.score : 0,
        exam: examRes ? examRes.score : 0
      };
    });
    return initialScores;
  });

  const loadScores = (classLvl: ClassLevel, sub: Subject) => {
    const tempStaffAdapter = new LocalStorageAdapter<Student>('advance_students');
    const classStudents = tempStaffAdapter.getAll().filter((s) => s.classLevel === classLvl && s.status === 'active');
    
    const assessmentAdapter = new LocalStorageAdapter<Assessment>('advance_assessments');
    const allAssessments = assessmentAdapter.getAll();
    const testAss = allAssessments.find(a => a.classLevel === classLvl && a.subject === sub && a.type === 'class_test');
    const examAss = allAssessments.find(a => a.classLevel === classLvl && a.subject === sub && a.type === 'end_of_term');
    
    const testId = testAss ? testAss.id : `assess_t_${classLvl.replace(' ', '')}_${sub.replace(' ', '')}`;
    const examId = examAss ? examAss.id : `assess_e_${classLvl.replace(' ', '')}_${sub.replace(' ', '')}`;

    const resultAdapter = new LocalStorageAdapter<ExamResult>('advance_exam_results');
    const allResults = resultAdapter.getAll();
    const initialScores: Record<string, { test: number; exam: number }> = {};

    classStudents.forEach((student) => {
      const testRes = allResults.find(r => r.assessmentId === testId && r.studentId === student.id);
      const examRes = allResults.find(r => r.assessmentId === examId && r.studentId === student.id);
      
      initialScores[student.id] = {
        test: testRes ? testRes.score : 0,
        exam: examRes ? examRes.score : 0
      };
    });
    setScores(initialScores);
  };

  const handleScoreChange = (studentId: string, field: 'test' | 'exam', val: string) => {
    const num = Math.min(field === 'test' ? 30 : 70, Math.max(0, Number(val) || 0));
    setScores((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: num
      }
    }));
  };

  const handleSaveGrades = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      students.forEach((student) => {
        const studentScore = scores[student.id] || { test: 0, exam: 0 };
        
        // Save test result (out of 30)
        recordExamResult({
          id: `res_t_${student.id}_${resolvedAssessments.testAssId}`,
          assessmentId: resolvedAssessments.testAssId,
          studentId: student.id,
          score: studentScore.test
        });

        // Save exam result (out of 70)
        recordExamResult({
          id: `res_e_${student.id}_${resolvedAssessments.examAssId}`,
          assessmentId: resolvedAssessments.examAssId,
          studentId: student.id,
          score: studentScore.exam
        });
      });

      addToast({ type: 'success', message: 'Grades and assessment scores recorded successfully!' });
    } catch {
      addToast({ type: 'error', message: 'Failed to record assessment scores.' });
    }
  };

  const calculateGradePoint = (test: number, exam: number) => {
    const total = test + exam;
    const scale = GHANA_GRADING_SCALE.find(s => total >= s.minScore && total <= s.maxScore);
    return scale ? { grade: scale.grade, remark: scale.remark } : { grade: '9', remark: 'Fail' };
  };

  const breadcrumbs = [
    { label: 'Teacher Portal', path: '/teacher' },
    { label: 'Grade Entry Book' }
  ];

  return (
    <PageWrapper
      title="Grade Entry Book"
      subtitle="Input student continuous assessment (30%) and final term examination (70%) scores."
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="p-4 bg-surface-primary rounded-xl border border-border-secondary grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Class Level"
            value={selectedClass}
            onChange={(e) => {
              const val = e.target.value as ClassLevel;
              setSelectedClass(val);
              loadScores(val, selectedSubject);
            }}
            options={CLASS_OPTIONS}
          />
          <Select
            label="Academic Subject"
            value={selectedSubject}
            onChange={(e) => {
              const val = e.target.value as Subject;
              setSelectedSubject(val);
              loadScores(selectedClass, val);
            }}
            options={SUBJECT_OPTIONS}
          />
        </div>

        {/* Grade Entry Form */}
        <form onSubmit={handleSaveGrades}>
          <Card>
            <CardHeader className="flex justify-between items-center flex-row">
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="text-primary-500" size={18} />
                Student Grade Register — {selectedSubject} ({selectedClass})
              </CardTitle>
              <Button
                type="submit"
                variant="primary"
                leftIcon={<Save size={14} />}
              >
                Save All Grades
              </Button>
            </CardHeader>
            <CardBody className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-500 dark:text-slate-400">
                <thead className="text-[10px] text-slate-400 uppercase bg-slate-50 dark:bg-slate-900 border-b border-border-secondary">
                  <tr>
                    <th className="px-6 py-3">Student Name</th>
                    <th className="px-6 py-3">Class Work (Max 30)</th>
                    <th className="px-6 py-3">Exam Score (Max 70)</th>
                    <th className="px-6 py-3">Weighted Total (100%)</th>
                    <th className="px-6 py-3">Grade Point</th>
                    <th className="px-6 py-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-secondary">
                  {students.length > 0 ? (
                    students.map((student) => {
                      const studScore = scores[student.id] || { test: 0, exam: 0 };
                      const total = studScore.test + studScore.exam;
                      const grading = calculateGradePoint(studScore.test, studScore.exam);

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                          <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                            {student.firstName} {student.lastName}
                          </td>
                          <td className="px-6 py-3">
                            <div className="w-20">
                              <Input
                                type="number"
                                value={studScore.test || ''}
                                onChange={(e) => handleScoreChange(student.id, 'test', e.target.value)}
                                className="h-8 py-1 px-2 text-xs"
                                placeholder="0"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <div className="w-20">
                              <Input
                                type="number"
                                value={studScore.exam || ''}
                                onChange={(e) => handleScoreChange(student.id, 'exam', e.target.value)}
                                className="h-8 py-1 px-2 text-xs"
                                placeholder="0"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 font-extrabold text-primary-600">
                            {total}%
                          </td>
                          <td className="px-6 py-4 font-bold">
                            Grade {grading.grade}
                          </td>
                          <td className="px-6 py-4 text-slate-400">
                            {grading.remark}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        No active students found in {selectedClass}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </form>
      </div>
    </PageWrapper>
  );
}
