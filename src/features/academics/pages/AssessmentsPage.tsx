import React, { useState } from 'react';
import { useAcademics } from '../hooks/useAcademics';
import { useAuthStore } from '../../../stores/authStore';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Card, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { DataTable, Column } from '../../../components/data-display/DataTable';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { ClassLevel, CLASS_LEVELS } from '../../../types/common';
import { Subject, Assessment, ExamType } from '../../../types/academic';
import { useNotificationStore } from '../../../stores/notificationStore';
import { Plus, Calendar, BookOpen } from 'lucide-react';

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

const TYPE_OPTIONS = [
  { value: 'class_test', label: 'Class Test' },
  { value: 'mid_term', label: 'Mid Term Exam' },
  { value: 'end_of_term', label: 'End of Term Exam' },
  { value: 'mock', label: 'Mock Exam' }
];

export default function AssessmentsPage() {
  const { assessments, createAssessment } = useAcademics();
  const { user } = useAuthStore();
  const addToast = useNotificationStore((state) => state.addToast);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [classLevel, setClassLevel] = useState<ClassLevel>('JHS 1');
  const [subject, setSubject] = useState<Subject>('English Language');
  const [type, setType] = useState<ExamType>('class_test');
  const [maxScore, setMaxScore] = useState('100');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleOpenModal = () => {
    setTitle('');
    setClassLevel('JHS 1');
    setSubject('English Language');
    setType('class_test');
    setMaxScore('100');
    setDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!title || !maxScore || !date) {
      addToast({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    const newAssess: Assessment = {
      id: `assess_${Math.random().toString(36).substring(7)}`,
      title,
      classLevel,
      subject,
      type,
      maxScore: Number(maxScore),
      date,
      teacherId: user.id
    };

    createAssessment(newAssess);
    addToast({ type: 'success', message: 'Academic assessment template created successfully!' });
    setIsModalOpen(false);
  };

  const columns: Column<Assessment>[] = [
    {
      header: 'Title',
      accessorKey: 'title',
      sortable: true,
      cell: (item) => (
        <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-white">
          <BookOpen size={16} className="text-primary-500 shrink-0" />
          <span>{item.title}</span>
        </div>
      )
    },
    {
      header: 'Class Level',
      accessorKey: 'classLevel',
      sortable: true
    },
    {
      header: 'Subject',
      accessorKey: 'subject',
      sortable: true
    },
    {
      header: 'Type',
      accessorKey: 'type',
      sortable: true,
      cell: (item) => {
        const variants: Record<string, 'primary' | 'success' | 'warning' | 'neutral'> = {
          class_test: 'primary',
          mid_term: 'primary',
          end_of_term: 'success',
          mock: 'warning'
        };
        return <Badge variant={variants[item.type] || 'neutral'} className="capitalize">{item.type.replace('_', ' ')}</Badge>;
      }
    },
    {
      header: 'Max Score',
      accessorKey: 'maxScore',
      cell: (item) => `${item.maxScore} Marks`
    },
    {
      header: 'Date Created',
      accessorKey: 'date',
      cell: (item) => (
        <div className="flex items-center gap-2 text-slate-500">
          <Calendar size={14} />
          <span>{new Date(item.date).toLocaleDateString('en-GB')}</span>
        </div>
      )
    }
  ];

  const breadcrumbs = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Academics' },
    { label: 'Assessments' }
  ];

  return (
    <PageWrapper 
      title="Continuous Assessments Registry" 
      subtitle="Define school continuous test grids, homework templates, and end-of-term examinations."
      breadcrumbs={breadcrumbs}
      action={
        <Button variant="primary" onClick={handleOpenModal} leftIcon={<Plus size={16} />}>
          Create Assessment
        </Button>
      }
    >
      <Card>
        <CardBody>
          <DataTable 
            data={assessments} 
            columns={columns} 
            searchKey="title" 
            searchPlaceholder="Search assessments by title..." 
            pageSize={10} 
          />
        </CardBody>
      </Card>

      {/* Create Assessment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Academic Assessment Layout"
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Assessment Title *"
            placeholder="e.g. Mid-Term ICT Practical Test"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Class Level *"
              value={classLevel}
              onChange={(e) => setClassLevel(e.target.value as ClassLevel)}
              options={CLASS_LEVELS.map((c) => ({ value: c, label: c }))}
            />
            <Select
              label="Subject *"
              value={subject}
              onChange={(e) => setSubject(e.target.value as Subject)}
              options={SUBJECT_OPTIONS}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Assessment Type *"
              value={type}
              onChange={(e) => setType(e.target.value as ExamType)}
              options={TYPE_OPTIONS}
            />
            <Input
              label="Max Possible Score *"
              type="number"
              placeholder="100"
              value={maxScore}
              onChange={(e) => setMaxScore(e.target.value)}
              required
            />
          </div>
          <Input
            label="Assessment Date *"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create Assessment
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
