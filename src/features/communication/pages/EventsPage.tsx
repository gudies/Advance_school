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
import { useNotificationStore } from '../../../stores/notificationStore';
import { Calendar, Plus, MapPin } from 'lucide-react';
import { EventCategory } from '../../../types/communication';

export default function EventsPage() {
  const { user } = useAuthStore();
  const { events, createEvent } = useCommunication();
  const addToast = useNotificationStore((state) => state.addToast);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState<EventCategory>('academic');
  const [location, setLocation] = useState('');

  const canCreate = user?.role === 'super_admin' || user?.role === 'admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate || !endDate) {
      addToast({ type: 'error', message: 'Please complete all required fields.' });
      return;
    }

    createEvent({
      title,
      description,
      startDate,
      endDate,
      category,
      location: location || 'School Grounds',
      organizerId: user?.id || 'usr_super',
      targetAudience: ['all']
    });

    addToast({ type: 'success', message: `School event "${title}" scheduled successfully.` });
    setIsModalOpen(false);
  };

  const getCategoryBadge = (cat: EventCategory) => {
    const maps: Record<EventCategory, 'success' | 'warning' | 'primary' | 'danger' | 'neutral'> = {
      academic: 'success',
      sports: 'warning',
      holiday: 'danger',
      meeting: 'primary',
      other: 'neutral'
    };
    return <Badge variant={maps[cat] || 'neutral'} className="capitalize">{cat}</Badge>;
  };

  const breadcrumbs = [
    { label: 'Communication Hub', path: '/communication/announcements' },
    { label: 'School Events Calendar' }
  ];

  return (
    <PageWrapper
      title="Events & Calendars"
      subtitle="Schedule assembly programs, PTA forums, athletic meets, and national vacations."
      breadcrumbs={breadcrumbs}
      action={
        canCreate ? (
          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
            onClick={() => {
              setTitle('');
              setDescription('');
              setStartDate('');
              setEndDate('');
              setCategory('academic');
              setLocation('');
              setIsModalOpen(true);
            }}
          >
            Schedule Event
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => (
            <Card key={evt.id} className="relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="h-2 bg-gradient-to-r from-primary-600 to-indigo-600 shrink-0" />
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-2">
                    {getCategoryBadge(evt.category)}
                  </div>
                  <CardTitle className="text-sm font-extrabold text-slate-800 dark:text-white mt-2">
                    {evt.title}
                  </CardTitle>
                </CardHeader>
                <CardBody className="py-2 space-y-3">
                  <p className="text-xs text-slate-500 font-light leading-relaxed min-h-[40px]">{evt.description}</p>
                  
                  <div className="space-y-1.5 text-[10px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-slate-400" />
                      <span>Starts: {new Date(evt.startDate).toLocaleDateString('en-GB')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-slate-400" />
                      <span>Ends: {new Date(evt.endDate).toLocaleDateString('en-GB')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-slate-400" />
                      <span className="truncate">{evt.location}</span>
                    </div>
                  </div>
                </CardBody>
              </div>
            </Card>
          ))}
        </div>

        {/* Modal form */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Schedule School Event"
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Event Title"
              placeholder="e.g. Inter-House Sports Gala"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <Input
              label="Short Description"
              placeholder="A brief description of the event..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
              <Input
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Event Category"
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                options={[
                  { value: 'academic', label: 'Academic Activity' },
                  { value: 'sports', label: 'Sports / Athletics' },
                  { value: 'holiday', label: 'School Vacation' },
                  { value: 'meeting', label: 'Meeting / PTA Forum' },
                  { value: 'other', label: 'Other Event' }
                ]}
              />
              <Input
                label="Location / Venue"
                placeholder="e.g. Sports Stadium"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
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
                Schedule Event
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </PageWrapper>
  );
}
