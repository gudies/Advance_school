import { useState, useMemo, useRef } from 'react';
import { useAcademics } from '../hooks/useAcademics';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Card, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { ClassLevel, Term, CLASS_LEVELS, TERMS, ACADEMIC_YEAR } from '../../../types/common';
import { LocalStorageAdapter } from '../../../services/adapters/localStorageAdapter';
import { Student } from '../../../types/student';
import { useNotificationStore } from '../../../stores/notificationStore';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ReportCardsPage() {
  const { generateReportCard } = useAcademics();
  const addToast = useNotificationStore((state) => state.addToast);
  const printAreaRef = useRef<HTMLDivElement>(null);

  const [classLevel, setClassLevel] = useState<ClassLevel>('JHS 1');
  const [selectedStudentId, setSelectedStudentId] = useState(() => {
    const tempAdapter = new LocalStorageAdapter<Student>('advance_students');
    const initialList = tempAdapter.getAll().filter((s) => s.classLevel === 'JHS 1' && s.status === 'active');
    return initialList.length > 0 ? initialList[0].id : '';
  });
  const [term, setTerm] = useState<Term>('Term 2');

  const handleClassLevelChange = (val: ClassLevel) => {
    setClassLevel(val);
    const tempAdapter = new LocalStorageAdapter<Student>('advance_students');
    const filteredList = tempAdapter.getAll().filter((s) => s.classLevel === val && s.status === 'active');
    if (filteredList.length > 0) {
      setSelectedStudentId(filteredList[0].id);
    } else {
      setSelectedStudentId('');
    }
  };

  const studentsList = useMemo(() => {
    return new LocalStorageAdapter<Student>('advance_students')
      .getAll()
      .filter((s) => s.classLevel === classLevel && s.status === 'active');
  }, [classLevel]);

  const reportCard = useMemo(() => {
    if (!selectedStudentId) return null;
    return generateReportCard(selectedStudentId, term, ACADEMIC_YEAR);
  }, [generateReportCard, selectedStudentId, term]);

  const handleDownloadPDF = async () => {
    const element = printAreaRef.current;
    if (!element || !reportCard) return;

    try {
      addToast({ type: 'info', message: 'Compiling report card PDF...' });
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`report-${reportCard.studentName.replace(' ', '_')}-${reportCard.term.replace(' ', '')}.pdf`);
      addToast({ type: 'success', message: 'Report card PDF downloaded successfully!' });
    } catch {
      addToast({ type: 'error', message: 'Failed to generate PDF.' });
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Academics' },
    { label: 'Report Cards' }
  ];

  return (
    <PageWrapper 
      title="Student Terminal Report Cards" 
      subtitle="Examine, verify, and generate WAEC-compliant terminal academic report sheets."
      breadcrumbs={breadcrumbs}
      action={
        reportCard && (
          <Button variant="primary" onClick={handleDownloadPDF} leftIcon={<Download size={16} />}>
            Download PDF
          </Button>
        )
      }
    >
      <div className="space-y-6">
        {/* Filters Selector */}
        <Card>
          <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Select Class Level"
              value={classLevel}
              onChange={(e) => handleClassLevelChange(e.target.value as ClassLevel)}
              options={CLASS_LEVELS.map((c) => ({ value: c, label: c }))}
            />
            <Select
              label="Select Student"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              options={studentsList.map((s) => ({ value: s.id, label: `${s.firstName} ${s.lastName}` }))}
              placeholder={studentsList.length > 0 ? 'Select a student...' : 'No active students in class'}
              disabled={studentsList.length === 0}
            />
            <Select
              label="Select Term"
              value={term}
              onChange={(e) => setTerm(e.target.value as Term)}
              options={TERMS.map((t) => ({ value: t, label: t }))}
            />
          </CardBody>
        </Card>

        {/* Report Card Document Preview */}
        {reportCard ? (
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-xl">
              <CardBody className="p-8 space-y-8 bg-white text-slate-800" ref={printAreaRef} id="report-card-print-area">
                
                {/* School Header */}
                <div className="flex justify-between items-center border-b-2 border-slate-200 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 flex items-center justify-center shrink-0">
                      <img src="/logo_transparent.png" alt="School Crest Logo" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold font-heading text-slate-900 leading-tight">Camied Behills</h2>
                      <p className="text-xs text-slate-500 font-semibold">International School</p>
                      <p className="text-[10px] text-slate-400 font-mono italic">Motto: Scientia Potestas Est</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h3 className="text-lg font-bold text-primary-600 uppercase tracking-wider">Terminal Report Card</h3>
                    <p className="text-sm font-semibold text-slate-500 mt-1">{reportCard.term} - {reportCard.academicYear}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">Date: {new Date().toLocaleDateString('en-GB')}</p>
                  </div>
                </div>

                {/* Student Metadata Card */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-400">Student Name</span>
                    <p className="font-semibold text-slate-800 text-sm mt-0.5">{reportCard.studentName}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Class Level</span>
                    <p className="font-semibold text-slate-800 text-sm mt-0.5">{reportCard.classLevel}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Class Size</span>
                    <p className="font-semibold text-slate-800 text-sm mt-0.5">{reportCard.classSize} Students</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Class Rank / Position</span>
                    <p className="font-bold text-primary-600 text-sm mt-0.5">{reportCard.overallPosition} / {reportCard.classSize}</p>
                  </div>
                </div>

                {/* Grades Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-slate-50 font-semibold text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3">Subject Name</th>
                        <th className="px-6 py-3 text-center">Class average (30%)</th>
                        <th className="px-6 py-3 text-center">Exam score (70%)</th>
                        <th className="px-6 py-3 text-center">Total Score</th>
                        <th className="px-6 py-3 text-center">WAEC Grade</th>
                        <th className="px-6 py-3">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      {reportCard.results.map((res) => (
                        <tr key={res.subject} className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-6 py-3 font-semibold text-slate-800">{res.subject}</td>
                          <td className="px-6 py-3 text-center text-slate-500 font-light">{res.classWorkScore}%</td>
                          <td className="px-6 py-3 text-center text-slate-500 font-light">{res.examScore}%</td>
                          <td className="px-6 py-3 text-center font-bold text-primary-600">{res.totalScore}%</td>
                          <td className="px-6 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              Number(res.grade) <= 3 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : Number(res.grade) <= 6 
                                  ? 'bg-primary-50 text-primary-700' 
                                  : 'bg-rose-50 text-rose-700'
                            }`}>
                              Grade {res.grade}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-slate-500 font-light capitalize">{res.remark}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div className="p-4 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-slate-400 text-xs font-semibold">Total Aggregated Score</span>
                    <p className="text-xl font-bold text-slate-800 font-heading">{reportCard.totalScore} / {reportCard.results.length * 100}</p>
                  </div>
                  <div className="p-4 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-slate-400 text-xs font-semibold">Grade Average Score</span>
                    <p className="text-xl font-bold text-slate-800 font-heading">{reportCard.averageScore}%</p>
                  </div>
                  <div className="p-4 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-slate-400 text-xs font-semibold">Term Attendance</span>
                    <p className="text-xl font-bold text-slate-800 font-heading">{reportCard.attendanceSummary.daysPresent} / {reportCard.attendanceSummary.totalDays} Days</p>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="space-y-4 border-t border-slate-100 pt-6">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-slate-400 text-xs font-bold font-heading">Class Teacher's Comments</span>
                    <p className="text-slate-700 font-light mt-1 italic">"{reportCard.teacherComment}"</p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-slate-400 text-xs font-bold font-heading">Head Teacher's Remarks</span>
                    <p className="text-slate-700 font-light mt-1 italic">"{reportCard.headTeacherComment}"</p>
                  </div>
                </div>

                {/* Printable footer */}
                <div className="grid grid-cols-2 gap-12 pt-8 text-center text-xs text-slate-400 border-t border-slate-100">
                  <div className="space-y-4">
                    <div className="h-6 border-b border-slate-200 mx-auto w-40" />
                    <p>Class Teacher</p>
                  </div>
                  <div className="space-y-4">
                    <div className="h-6 border-b border-slate-200 mx-auto w-40" />
                    <p>Head Teacher (Stamp / Sign)</p>
                  </div>
                </div>

              </CardBody>
            </Card>
          </div>
        ) : (
          <Card className="py-12 text-center text-slate-400 text-sm">
            Please select a student and configure the active terminal filters to preview the academic transcript.
          </Card>
        )}
      </div>
    </PageWrapper>
  );
}
