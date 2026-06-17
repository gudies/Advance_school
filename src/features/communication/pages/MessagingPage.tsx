import { useState, useMemo } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import { useCommunication } from '../hooks/useCommunication';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { LocalStorageAdapter } from '../../../services/adapters/localStorageAdapter';
import { User } from '../../../types/auth';
import { useNotificationStore } from '../../../stores/notificationStore';
import { MessageSquare, Send, Plus, User as UserIcon } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Select } from '../../../components/ui/Select';

export default function MessagingPage() {
  const { user } = useAuthStore();
  const currentUserId = user?.id || 'usr_super';
  
  const { conversations, messages, sendMessage, startConversation } = useCommunication();
  const addToast = useNotificationStore((state) => state.addToast);

  const [activeConvId, setActiveConvId] = useState<string>(() => {
    return conversations.length > 0 ? conversations[0].id : '';
  });
  
  const [typedMessage, setTypedMessage] = useState('');
  
  // Compose modal state
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [selectedRecipientId, setSelectedRecipientId] = useState('');

  const usersList = useMemo(() => {
    const adapter = new LocalStorageAdapter<User>('advance_users');
    return adapter.getAll().filter((u: User) => u.id !== currentUserId);
  }, [currentUserId]);

  const activeConv = useMemo(() => {
    return conversations.find((c) => c.id === activeConvId) || null;
  }, [conversations, activeConvId]);

  const activeMessages = useMemo(() => {
    return messages.filter((m) => m.conversationId === activeConvId);
  }, [messages, activeConvId]);

  const recipientUser = useMemo(() => {
    if (!activeConv) return null;
    return activeConv.participants.find((p) => p.id !== currentUserId) || null;
  }, [activeConv, currentUserId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeConvId) return;

    sendMessage(activeConvId, currentUserId, typedMessage.trim());
    setTypedMessage('');
  };

  const handleCompose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipientId) {
      addToast({ type: 'error', message: 'Please select a recipient.' });
      return;
    }

    const recipient = usersList.find((u: User) => u.id === selectedRecipientId);
    if (!recipient) return;

    const senderName = `${user?.firstName} ${user?.lastName}`;
    const senderRole = user?.role || 'super_admin';
    const receiverName = `${recipient.firstName} ${recipient.lastName}`;
    
    const newId = startConversation(
      currentUserId,
      senderName,
      senderRole,
      recipient.id,
      receiverName,
      recipient.role
    );

    setActiveConvId(newId);
    setIsComposeOpen(false);
    addToast({ type: 'success', message: `Conversation started with ${receiverName}!` });
  };

  const recipientOptions = useMemo(() => {
    return usersList.map((u: User) => ({
      value: u.id,
      label: `${u.firstName} ${u.lastName} (${u.role})`
    }));
  }, [usersList]);

  const breadcrumbs = [
    { label: 'Communication Hub', path: '/communication/announcements' },
    { label: 'Direct Messages' }
  ];

  return (
    <PageWrapper
      title="Direct Messages"
      subtitle="Exchange messages in real time with administrators, parents, and teachers."
      breadcrumbs={breadcrumbs}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-230px)]">
        
        {/* Left Column - Conversations list */}
        <Card className="lg:col-span-1 flex flex-col justify-between overflow-hidden">
          <CardHeader className="flex flex-row justify-between items-center border-b border-border-secondary">
            <CardTitle className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <MessageSquare size={16} /> Chats
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedRecipientId('');
                setIsComposeOpen(true);
              }}
              className="h-8 py-1 px-2.5"
            >
              <Plus size={14} className="mr-1" /> New Chat
            </Button>
          </CardHeader>
          <CardBody className="flex-1 overflow-y-auto divide-y divide-border-secondary p-0">
            {conversations.map((conv) => {
              const other = conv.participants.find(p => p.id !== currentUserId);
              const isSelected = conv.id === activeConvId;
              
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/10 flex items-center gap-3 transition-all ${
                    isSelected ? 'bg-primary-50/50 dark:bg-primary-950/10 border-l-4 border-primary-600' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold shrink-0">
                    <UserIcon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="font-bold text-xs text-slate-800 dark:text-white truncate">
                        {other ? other.name : 'Unknown User'}
                      </span>
                      <span className="text-[9px] text-slate-400">
                        {conv.lastMessageTimestamp ? new Date(conv.lastMessageTimestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">{conv.lastMessage || 'No messages yet...'}</p>
                  </div>
                </button>
              );
            })}
          </CardBody>
        </Card>

        {/* Right Columns - Chat Thread */}
        <Card className="lg:col-span-2 flex flex-col justify-between overflow-hidden">
          {activeConv ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-border-secondary flex items-center gap-3 bg-slate-50 dark:bg-slate-900 shrink-0">
                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold">
                  <UserIcon size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-white">
                    {recipientUser ? recipientUser.name : 'Recipient'}
                  </h4>
                  <Badge variant="neutral" className="capitalize text-[8px] py-0 px-1 font-mono">
                    {recipientUser ? recipientUser.role : ''}
                  </Badge>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/5">
                {activeMessages.map((msg) => {
                  const isOwn = msg.senderId === currentUserId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-2xl text-xs leading-normal font-light shadow-sm ${
                          isOwn
                            ? 'bg-primary-600 text-white rounded-br-none'
                            : 'bg-white border border-border-secondary text-slate-800 dark:bg-slate-900 dark:text-slate-100 rounded-bl-none'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <div className={`text-[8px] mt-1 text-right ${isOwn ? 'text-white/60' : 'text-slate-400'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSend} className="p-4 border-t border-border-secondary flex gap-2 shrink-0 bg-white dark:bg-slate-900">
                <Input
                  placeholder="Type your message..."
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  className="h-10 text-xs flex-1"
                />
                <Button
                  type="submit"
                  variant="primary"
                  className="h-10 px-4 shrink-0"
                >
                  <Send size={14} />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-slate-400 text-xs">
              <MessageSquare size={36} className="mb-2 text-slate-300" />
              Select a conversation to start direct messaging
            </div>
          )}
        </Card>
      </div>

      {/* Compose Modal */}
      <Modal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        title="Start Chat Conversation"
        size="sm"
      >
        <form onSubmit={handleCompose} className="space-y-4">
          <Select
            label="Search Directory Recipient"
            value={selectedRecipientId}
            onChange={(e) => setSelectedRecipientId(e.target.value)}
            options={recipientOptions}
            required
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-border-secondary">
            <Button
              variant="outline"
              onClick={() => setIsComposeOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              Initiate Chat
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
