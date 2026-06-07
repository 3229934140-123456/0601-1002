export type PostType = 'service' | 'warehouse' | 'store';

export type PriorityLevel = 'urgent' | 'high' | 'normal' | 'low';

export type HandoverStatus = 'pending' | 'confirmed' | 'returned' | 'completed';

export type ShiftStatus = 'ongoing' | 'upcoming' | 'finished';

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  post: PostType;
  phone: string;
}

export interface Attachment {
  id: string;
  type: 'image' | 'voice';
  url: string;
  name: string;
  duration?: number;
  size?: number;
}

export interface HandoverItem {
  id: string;
  title: string;
  description: string;
  priority: PriorityLevel;
  status: HandoverStatus;
  post: PostType;
  creator: TeamMember;
  assignee: TeamMember;
  customerName?: string;
  orderNo?: string;
  attachments: Attachment[];
  tags: string[];
  createdAt: string;
  deadline?: string;
  confirmedAt?: string;
  returnedReason?: string;
  returnedAt?: string;
  shiftId: string;
}

export interface Shift {
  id: string;
  name: string;
  post: PostType;
  startTime: string;
  endTime: string;
  status: ShiftStatus;
  leader: TeamMember;
  members: TeamMember[];
  handoverCount: number;
  completedCount: number;
  date: string;
}

export interface ReminderItem {
  id: string;
  type: 'timeout' | 'pending' | 'returned' | 'system';
  title: string;
  content: string;
  itemId: string;
  createdAt: string;
  read: boolean;
  relatedType?: 'handover' | 'shift';
}

export interface StatsData {
  totalHandovers: number;
  completedRate: number;
  onTimeRate: number;
  avgHandleTime: number;
  postStats: {
    post: PostType;
    count: number;
    completedRate: number;
  }[];
  topTags: {
    tag: string;
    count: number;
  }[];
  dailyTrend: {
    date: string;
    count: number;
  }[];
}

export interface HandoverTemplate {
  id: string;
  name: string;
  post: PostType;
  items: {
    title: string;
    description: string;
    priority: PriorityLevel;
  }[];
}

export type ActivityType = 'create' | 'confirm' | 'return' | 'resend' | 'complete' | 'member_confirm' | 'summary' | 'remind';

export interface ActivityItem {
  id: string;
  shiftId: string;
  type: ActivityType;
  itemId?: string;
  memberId?: string;
  operator: TeamMember;
  title: string;
  description?: string;
  createdAt: string;
}
