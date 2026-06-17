import { ID, DateString } from './common';

export type AnnouncementTarget = 
  | 'all' 
  | 'admin' 
  | 'teachers' 
  | 'parents' 
  | 'students' 
  | 'specific_class';

export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Announcement {
  id: ID;
  title: string;
  content: string;
  authorId: ID;
  authorName: string;
  target: AnnouncementTarget;
  targetClass?: string; // If target is 'specific_class'
  priority: AnnouncementPriority;
  publishDate: DateString;
  expiryDate?: DateString;
  attachments?: string[];
}

export interface Message {
  id: ID;
  conversationId: ID;
  senderId: ID;
  content: string;
  timestamp: DateString;
  isRead: boolean;
  attachments?: string[];
}

export interface Conversation {
  id: ID;
  participants: { id: ID; name: string; role: string; avatar?: string }[];
  lastMessage?: string;
  lastMessageTimestamp?: DateString;
  unreadCount: number;
}

export type EventCategory = 'academic' | 'sports' | 'holiday' | 'meeting' | 'other';

export interface SchoolEvent {
  id: ID;
  title: string;
  description: string;
  startDate: DateString;
  endDate: DateString;
  category: EventCategory;
  location: string;
  organizerId: ID;
  targetAudience: AnnouncementTarget[];
}
