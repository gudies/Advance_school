import { useState, useCallback, useMemo } from 'react';
import { LocalStorageAdapter } from '../../../services/adapters/localStorageAdapter';
import { Announcement, Message, Conversation, SchoolEvent } from '../../../types/communication';

export function useCommunication() {
  const announcementAdapter = useMemo(() => new LocalStorageAdapter<Announcement>('advance_announcements'), []);
  const messageAdapter = useMemo(() => new LocalStorageAdapter<Message>('advance_messages'), []);
  const conversationAdapter = useMemo(() => new LocalStorageAdapter<Conversation>('advance_conversations'), []);
  const eventAdapter = useMemo(() => new LocalStorageAdapter<SchoolEvent>('advance_events'), []);

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const all = announcementAdapter.getAll();
    if (all.length === 0) {
      // Seed default announcements
      const seed: Announcement[] = [
        {
          id: 'ann_1',
          title: 'Welcome to Term 2!',
          content: 'We welcome all students, teachers, and parents back to a new term. Let\'s work together to make this academic term fruitful and successful.',
          authorId: 'usr_super',
          authorName: 'Kwame Asante',
          target: 'all',
          priority: 'high',
          publishDate: new Date().toISOString()
        },
        {
          id: 'ann_2',
          title: 'PTA General Meeting',
          content: 'There will be a general Parent-Teacher Association (PTA) meeting in the school hall this coming Friday at 3:00 PM. Attendance is highly encouraged.',
          authorId: 'usr_super',
          authorName: 'Kwame Asante',
          target: 'parents',
          priority: 'urgent',
          publishDate: new Date().toISOString()
        }
      ];
      seed.forEach(x => announcementAdapter.create(x));
      return announcementAdapter.getAll();
    }
    return all;
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const all = conversationAdapter.getAll();
    if (all.length === 0) {
      const seed: Conversation[] = [
        {
          id: 'conv_1',
          participants: [
            { id: 'usr_super', name: 'Kwame Asante', role: 'super_admin' },
            { id: 'usr_parent1', name: 'Kofi Adjei', role: 'parent' }
          ],
          lastMessage: 'Hello Kofi, Akua\'s math grades have improved significantly.',
          lastMessageTimestamp: new Date().toISOString(),
          unreadCount: 0
        }
      ];
      seed.forEach(x => conversationAdapter.create(x));
      return conversationAdapter.getAll();
    }
    return all;
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const all = messageAdapter.getAll();
    if (all.length === 0) {
      const seed: Message[] = [
        {
          id: 'msg_1',
          conversationId: 'conv_1',
          senderId: 'usr_super',
          content: 'Hello Kofi, Akua\'s math grades have improved significantly.',
          timestamp: new Date().toISOString(),
          isRead: true
        }
      ];
      seed.forEach(x => messageAdapter.create(x));
      return messageAdapter.getAll();
    }
    return all;
  });

  const [events, setEvents] = useState<SchoolEvent[]>(() => {
    const all = eventAdapter.getAll();
    if (all.length === 0) {
      const seed: SchoolEvent[] = [
        {
          id: 'evt_1',
          title: 'Mid-Term Examinations',
          description: 'Mid-Term assessments for all JHS and SS levels.',
          startDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString().split('T')[0],
          endDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0],
          category: 'academic',
          location: 'Main Hall / Classrooms',
          organizerId: 'usr_super',
          targetAudience: ['students', 'teachers']
        },
        {
          id: 'evt_2',
          title: 'Sports Day Carnival',
          description: 'Annual inter-house sports competitions and athletics.',
          startDate: new Date(new Date().setDate(new Date().getDate() + 20)).toISOString().split('T')[0],
          endDate: new Date(new Date().setDate(new Date().getDate() + 21)).toISOString().split('T')[0],
          category: 'sports',
          location: 'School Sports Complex',
          organizerId: 'usr_super',
          targetAudience: ['all']
        }
      ];
      seed.forEach(x => eventAdapter.create(x));
      return eventAdapter.getAll();
    }
    return all;
  });

  const refreshAnnouncements = useCallback(() => {
    setAnnouncements(announcementAdapter.getAll());
  }, [announcementAdapter]);

  const refreshConversations = useCallback(() => {
    setConversations(conversationAdapter.getAll());
  }, [conversationAdapter]);

  const refreshMessages = useCallback(() => {
    setMessages(messageAdapter.getAll());
  }, [messageAdapter]);

  const refreshEvents = useCallback(() => {
    setEvents(eventAdapter.getAll());
  }, [eventAdapter]);

  const createAnnouncement = useCallback((ann: Omit<Announcement, 'id' | 'publishDate'>) => {
    const newAnn: Announcement = {
      ...ann,
      id: `ann_${Math.random().toString(36).substring(7)}`,
      publishDate: new Date().toISOString()
    };
    announcementAdapter.create(newAnn);
    refreshAnnouncements();
  }, [announcementAdapter, refreshAnnouncements]);

  const createEvent = useCallback((evt: Omit<SchoolEvent, 'id'>) => {
    const newEvt: SchoolEvent = {
      ...evt,
      id: `evt_${Math.random().toString(36).substring(7)}`
    };
    eventAdapter.create(newEvt);
    refreshEvents();
  }, [eventAdapter, refreshEvents]);

  const sendMessage = useCallback((conversationId: string, senderId: string, content: string) => {
    const newMsg: Message = {
      id: `msg_${Math.random().toString(36).substring(7)}`,
      conversationId,
      senderId,
      content,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    messageAdapter.create(newMsg);

    // Update conversation last message
    const conv = conversationAdapter.getById(conversationId);
    if (conv) {
      conversationAdapter.update(conversationId, {
        lastMessage: content,
        lastMessageTimestamp: newMsg.timestamp
      });
    }

    refreshMessages();
    refreshConversations();
  }, [messageAdapter, conversationAdapter, refreshMessages, refreshConversations]);

  const startConversation = useCallback((senderId: string, senderName: string, senderRole: string, receiverId: string, receiverName: string, receiverRole: string) => {
    // Check if conversation already exists
    const allConv = conversationAdapter.getAll();
    const existing = allConv.find(c => 
      c.participants.some(p => p.id === senderId) && 
      c.participants.some(p => p.id === receiverId)
    );

    if (existing) return existing.id;

    const newId = `conv_${Math.random().toString(36).substring(7)}`;
    const newConv: Conversation = {
      id: newId,
      participants: [
        { id: senderId, name: senderName, role: senderRole },
        { id: receiverId, name: receiverName, role: receiverRole }
      ],
      lastMessage: '',
      lastMessageTimestamp: new Date().toISOString(),
      unreadCount: 0
    };
    conversationAdapter.create(newConv);
    refreshConversations();
    return newId;
  }, [conversationAdapter, refreshConversations]);

  return {
    announcements,
    conversations,
    messages,
    events,
    createAnnouncement,
    createEvent,
    sendMessage,
    startConversation,
    refreshAnnouncements,
    refreshConversations,
    refreshMessages,
    refreshEvents
  };
}
