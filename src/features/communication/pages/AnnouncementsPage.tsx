import { useState } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import { useCommunication } from '../hooks/useCommunication';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';
import { Textarea } from '../../../components/ui/Textarea';
import { useNotificationStore } from '../../../stores/notificationStore';
import { Plus, Calendar } from 'lucide-react';
import { AnnouncementPriority, AnnouncementTarget } from '../../../types/communication';

export default function AnnouncementsPage() {
  const { user } = useAuthStore();
  const { announcements, createAnnouncement } = useCommunication();
  const addToast = useNotificationStore((state) => state.addToast);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<AnnouncementPriority>('normal');
  const [target, setTarget] = useState<AnnouncementTarget>('all');

  const canPost = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'teacher';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      addToast({ type: 'error', message: 'Please complete all required fields.' });
      return;
    }

    createAnnouncement({
      title,
      content,
      authorId: user?.id || 'usr_super',
      authorName: `${user?.firstName} ${user?.lastName}`,
      priority,
      target
    });

    addToast({ type: 'success', message: 'Announcement published successfully!' });
    setIsModalOpen(false);
  };

  const breadcrumbs = [
    { label: 'Communication Hub' },
    { label: 'Announcements' }
  ];

  return (
    <PageWrapper
      title="School Bulletins"
      subtitle="Publish and review circulars, events notice alerts, and general newsletters."
      breadcrumbs={breadcrumbs}
      action={
        canPost ? (
          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
            onClick={() => {
              setTitle('');
              setContent('');
              setPriority('normal');
              setTarget('all');
              setIsModalOpen(true);
            }}
          >
            Create Notice
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {announcements.map((ann) => (
            <Card key={ann.id} className="relative overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary-500 to-indigo-600 shrink-0" />
              <CardHeader className="pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <Badge variant={ann.priority === 'urgent' ? 'danger' : ann.priority === 'high' ? 'warning' : 'primary'} className="mb-2 uppercase text-[10px]">
                    {ann.priority} Priority
                  </Badge>
                  <CardTitle className="text-base font-extrabold text-slate-800 dark:text-white mt-1">
                    {ann.title}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
                  <Calendar size={14} />
                  <span>{new Date(ann.publishDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
              </CardHeader>
              <CardBody>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-light whitespace-pre-line">{ann.content}</p>
                <div className="mt-4 border-t border-slate-50 dark:border-slate-800 pt-2 flex justify-between items-center text-[10px] text-slate-400">
                  <span>Author: {ann.authorName}</span>
                  <Badge variant="neutral" className="capitalize text-[10px]">Audience: {ann.target}</Badge>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Modal Wizard */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Compose School Circular"
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Circular Title"
              placeholder="e.g. Mid-Term Break Notice"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <Textarea
              label="Bulletin Body Content"
              placeholder="Detail all dates, timelines, and details..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Priority Level"
                value={priority}
                onChange={(e) => setPriority(e.target.value as AnnouncementPriority)}
                options={[
                  { value: 'low', label: 'Low priority' },
                  { value: 'normal', label: 'Normal priority' },
                  { value: 'high', label: 'High priority' },
                  { value: 'urgent', label: 'Urgent Alert' }
                ]}
              />
              <Select
                label="Target Audience"
                value={target}
                onChange={(e) => setTarget(e.target.value as AnnouncementTarget)}
                options={[
                  { value: 'all', label: 'Everyone (All)' },
                  { value: 'teachers', label: 'Teachers Only' },
                  { value: 'parents', label: 'Parents Only' },
                  { value: 'students', label: 'Students Only' }
                ]}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border-secondary">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
              >
                Publish Notice
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </PageWrapper>
  );
}
