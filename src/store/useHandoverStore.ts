import { create } from 'zustand';
import {
  Shift,
  HandoverItem,
  ReminderItem,
  TeamMember,
  PostType,
  PriorityLevel,
  HandoverStatus,
  ShiftStatus,
  HandoverTemplate,
  Attachment,
  StatsData
} from '../types/handover';
import {
  mockShifts,
  mockHandoverItems,
  mockReminders,
  mockMembers,
  mockTemplates,
  mockStats
} from '../data/mockData';

interface HandoverStore {
  shifts: Shift[];
  handoverItems: HandoverItem[];
  reminders: ReminderItem[];
  members: TeamMember[];
  templates: HandoverTemplate[];
  shiftSummaries: Record<string, string>;

  addShift: (shift: Omit<Shift, 'id' | 'handoverCount' | 'completedCount' | 'status'>) => void;
  getShiftsByPost: (post: PostType) => Shift[];
  getShiftById: (id: string) => Shift | undefined;

  addHandoverItem: (item: Omit<HandoverItem, 'id' | 'status' | 'createdAt'>) => void;
  updateHandoverItem: (id: string, updates: Partial<HandoverItem>) => void;
  getHandoverItemById: (id: string) => HandoverItem | undefined;
  getHandoverItemsByShift: (shiftId: string) => HandoverItem[];

  confirmHandover: (id: string) => void;
  returnHandover: (id: string, reason: string) => void;
  resendHandover: (id: string, updates?: Partial<HandoverItem>) => void;
  completeHandover: (id: string) => void;

  addReminder: (reminder: Omit<ReminderItem, 'id' | 'createdAt' | 'read'>) => void;
  markReminderRead: (id: string) => void;
  markAllRemindersRead: () => void;
  getUnreadCount: () => number;

  addShiftSummary: (shiftId: string, summary: string) => void;
  getShiftSummary: (shiftId: string) => string;

  getStats: () => StatsData;
}

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const useHandoverStore = create<HandoverStore>((set, get) => ({
  shifts: mockShifts,
  handoverItems: mockHandoverItems,
  reminders: mockReminders,
  members: mockMembers,
  templates: mockTemplates,
  shiftSummaries: {},

  addShift: (shiftData) => {
    const newShift: Shift = {
      ...shiftData,
      id: generateId(),
      handoverCount: 0,
      completedCount: 0,
      status: 'upcoming' as ShiftStatus
    };
    set((state) => ({
      shifts: [...state.shifts, newShift]
    }));
  },

  getShiftsByPost: (post) => {
    return get().shifts.filter(s => s.post === post);
  },

  getShiftById: (id) => {
    return get().shifts.find(s => s.id === id);
  },

  addHandoverItem: (itemData) => {
    const newItem: HandoverItem = {
      ...itemData,
      id: generateId(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    set((state) => {
      const updatedShifts = state.shifts.map(s => 
        s.id === itemData.shiftId 
          ? { ...s, handoverCount: s.handoverCount + 1 }
          : s
      );
      return {
        handoverItems: [newItem, ...state.handoverItems],
        shifts: updatedShifts
      };
    });

    // 添加提醒
    get().addReminder({
      type: 'pending',
      title: '新的交接待确认',
      content: `你有一条新的交接事项待确认：${itemData.title}`,
      itemId: newItem.id
    });

    return newItem;
  },

  updateHandoverItem: (id, updates) => {
    set((state) => ({
      handoverItems: state.handoverItems.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    }));
  },

  getHandoverItemById: (id) => {
    return get().handoverItems.find(item => item.id === id);
  },

  getHandoverItemsByShift: (shiftId) => {
    return get().handoverItems.filter(item => item.shiftId === shiftId);
  },

  confirmHandover: (id) => {
    const item = get().getHandoverItemById(id);
    if (!item) return;

    set((state) => {
      const updatedItems = state.handoverItems.map(i =>
        i.id === id 
          ? { ...i, status: 'confirmed' as HandoverStatus, confirmedAt: new Date().toISOString() }
          : i
      );
      
      const confirmedCount = updatedItems.filter(
        i => i.shiftId === item.shiftId && (i.status === 'confirmed' || i.status === 'completed')
      ).length;

      const updatedShifts = state.shifts.map(s =>
        s.id === item.shiftId
          ? { ...s, completedCount: confirmedCount }
          : s
      );

      return {
        handoverItems: updatedItems,
        shifts: updatedShifts
      };
    });
  },

  returnHandover: (id, reason) => {
    const item = get().getHandoverItemById(id);
    if (!item) return;

    set((state) => ({
      handoverItems: state.handoverItems.map(i =>
        i.id === id
          ? { 
              ...i, 
              status: 'returned' as HandoverStatus, 
              returnedReason: reason,
              returnedAt: new Date().toISOString()
            }
          : i
      )
    }));

    // 添加退回提醒给创建人
    get().addReminder({
      type: 'returned',
      title: '交接被退回',
      content: `你的交接「${item.title}」被退回，请补充信息后重新提交`,
      itemId: id
    });
  },

  resendHandover: (id, updates = {}) => {
    const item = get().getHandoverItemById(id);
    if (!item) return;

    set((state) => ({
      handoverItems: state.handoverItems.map(i =>
        i.id === id
          ? {
              ...i,
              ...updates,
              status: 'pending' as HandoverStatus,
              returnedReason: undefined,
              returnedAt: undefined,
              confirmedAt: undefined,
              createdAt: new Date().toISOString()
            }
          : i
      )
    }));

    // 添加提醒
    get().addReminder({
      type: 'pending',
      title: '交接重新提交',
      content: `交接「${item.title}」已补充信息，重新提交待确认`,
      itemId: id
    });
  },

  completeHandover: (id) => {
    const item = get().getHandoverItemById(id);
    if (!item) return;

    set((state) => {
      const updatedItems = state.handoverItems.map(i =>
        i.id === id
          ? { ...i, status: 'completed' as HandoverStatus }
          : i
      );

      const completedCount = updatedItems.filter(
        i => i.shiftId === item.shiftId && (i.status === 'confirmed' || i.status === 'completed')
      ).length;

      const updatedShifts = state.shifts.map(s =>
        s.id === item.shiftId
          ? { ...s, completedCount: completedCount }
          : s
      );

      return {
        handoverItems: updatedItems,
        shifts: updatedShifts
      };
    });
  },

  addReminder: (reminderData) => {
    const newReminder: ReminderItem = {
      ...reminderData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      read: false
    };
    set((state) => ({
      reminders: [newReminder, ...state.reminders]
    }));
  },

  markReminderRead: (id) => {
    set((state) => ({
      reminders: state.reminders.map(r =>
        r.id === id ? { ...r, read: true } : r
      )
    }));
  },

  markAllRemindersRead: () => {
    set((state) => ({
      reminders: state.reminders.map(r => ({ ...r, read: true }))
    }));
  },

  getUnreadCount: () => {
    return get().reminders.filter(r => !r.read).length;
  },

  addShiftSummary: (shiftId, summary) => {
    set((state) => ({
      shiftSummaries: {
        ...state.shiftSummaries,
        [shiftId]: summary
      }
    }));
  },

  getShiftSummary: (shiftId) => {
    return get().shiftSummaries[shiftId] || '';
  },

  getStats: () => {
    const items = get().handoverItems;
    const total = items.length;
    const completedItems = items.filter(i => i.status === 'completed');
    const completedRate = total > 0 ? Math.round((completedItems.length / total) * 1000) / 10 : 0;

    const onTimeItems = items.filter(i => {
      if (!i.deadline) return true;
      if (i.status === 'completed' || i.status === 'confirmed') return true;
      return new Date(i.deadline).getTime() > Date.now();
    });
    const onTimeRate = total > 0 ? Math.round((onTimeItems.length / total) * 1000) / 10 : 0;

    const avgHandleTime = 45;

    const posts: PostType[] = ['service', 'warehouse', 'store'];
    const postStats = posts.map(post => {
      const postItems = items.filter(i => i.post === post);
      const postCompleted = postItems.filter(i => i.status === 'completed' || i.status === 'confirmed');
      return {
        post,
        count: postItems.length,
        completedRate: postItems.length > 0 
          ? Math.round((postCompleted.length / postItems.length) * 1000) / 10 
          : 0
      };
    });

    const tagCount: Record<string, number> = {};
    items.forEach(item => {
      item.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });
    const topTags = Object.entries(tagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      const dayCount = items.filter(item => {
        const itemTime = new Date(item.createdAt).getTime();
        return itemTime >= dayStart && itemTime < dayEnd;
      }).length;
      last7Days.push({ date: dateStr, count: dayCount });
    }

    return {
      totalHandovers: total,
      completedRate,
      onTimeRate,
      avgHandleTime,
      postStats,
      topTags,
      dailyTrend: last7Days
    };
  }
}));

export default useHandoverStore;
