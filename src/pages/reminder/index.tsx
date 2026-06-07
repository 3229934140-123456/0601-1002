import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import EmptyState from '../../components/EmptyState';
import useHandoverStore from '../../store/useHandoverStore';
import { ReminderItem } from '../../types/handover';
import { navigateTo, showToast, formatFullDate, getRelativeTime } from '../../utils';

type ReminderType = 'all' | 'timeout' | 'pending' | 'returned' | 'system';

const ReminderPage: React.FC = () => {
  const { reminders, markReminderRead, markAllRemindersRead, confirmHandover } = useHandoverStore();
  const [activeType, setActiveType] = useState<ReminderType>('all');

  usePullDownRefresh(() => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      showToast('刷新成功', 'success');
    }, 1000);
  });

  useDidShow(() => {
    // 页面显示时刷新
  });

  const typeList: { key: ReminderType; label: string; icon: string }[] = [
    { key: 'all', label: '全部', icon: '🔔' },
    { key: 'timeout', label: '超时', icon: '⏰' },
    { key: 'pending', label: '待确认', icon: '📋' },
    { key: 'returned', label: '已退回', icon: '↩️' },
    { key: 'system', label: '系统', icon: '📢' }
  ];

  const filteredReminders = useMemo(() => {
    if (activeType === 'all') return reminders;
    return reminders.filter(r => r.type === activeType);
  }, [reminders, activeType]);

  const unreadCount = reminders.filter(r => !r.read).length;

  const getTypeUnreadCount = (type: ReminderType): number => {
    if (type === 'all') return unreadCount;
    return reminders.filter(r => r.type === type && !r.read).length;
  };

  const getTypeIcon = (type: string): string => {
    const iconMap: Record<string, string> = {
      timeout: '⏰',
      pending: '📋',
      returned: '↩️',
      system: '📢'
    };
    return iconMap[type] || '🔔';
  };

  const handleMarkAllRead = () => {
    markAllRemindersRead();
    showToast('已全部标记为已读', 'success');
  };

  const handleViewDetail = (reminder: ReminderItem) => {
    markReminderRead(reminder.id);
    
    if (reminder.relatedType === 'shift') {
      navigateTo(`/pages/member-confirm/index?shiftId=${reminder.itemId}`);
    } else if (reminder.itemId) {
      navigateTo(`/pages/item-detail/index?id=${reminder.itemId}`);
    }
  };

  const handleQuickAction = (reminder: ReminderItem, e: any) => {
    e.stopPropagation();
    
    markReminderRead(reminder.id);
    
    if (reminder.relatedType === 'shift') {
      navigateTo(`/pages/member-confirm/index?shiftId=${reminder.itemId}`);
    } else if (reminder.type === 'pending' && reminder.itemId) {
      confirmHandover(reminder.itemId);
      showToast('已确认', 'success');
    } else if (reminder.type === 'returned' && reminder.itemId) {
      navigateTo(`/pages/item-detail/index?id=${reminder.itemId}`);
    } else if (reminder.itemId) {
      navigateTo(`/pages/item-detail/index?id=${reminder.itemId}`);
    }
  };

  const getActionText = (type: string): string => {
    const textMap: Record<string, string> = {
      timeout: '去处理',
      pending: '立即确认',
      returned: '去补充',
      system: '知道了'
    };
    return textMap[type] || '查看';
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.unreadCount}>
          <Text>未读消息：</Text>
          <Text className={styles.num}>{unreadCount}</Text>
          <Text> 条</Text>
        </View>
        {unreadCount > 0 && (
          <View className={styles.markReadBtn} onClick={handleMarkAllRead}>
            <Text>全部已读</Text>
          </View>
        )}
      </View>

      <ScrollView scrollX className={styles.tabBar}>
        {typeList.map(tab => {
          const count = getTypeUnreadCount(tab.key);
          return (
            <View
              key={tab.key}
              className={`${styles.tabItem} ${activeType === tab.key ? styles.active : ''}`}
              onClick={() => setActiveType(tab.key)}
            >
              <Text>{tab.label}</Text>
              {count > 0 && <Text className={styles.badge}>{count > 99 ? '99+' : count}</Text>}
            </View>
          );
        })}
      </ScrollView>

      <ScrollView scrollY className={styles.listContent}>
        {filteredReminders.length > 0 ? (
          filteredReminders.map(reminder => (
            <View
              key={reminder.id}
              className={`${styles.reminderCard} ${!reminder.read ? styles.unread : ''}`}
              onClick={() => handleViewDetail(reminder)}
            >
              <View className={styles.cardHeader}>
                <View className={`${styles.typeIcon} ${styles[reminder.type]}`}>
                  <Text>{getTypeIcon(reminder.type)}</Text>
                </View>
                <View className={styles.typeInfo}>
                  <Text className={styles.typeTitle}>{reminder.title}</Text>
                  <Text className={styles.typeTime}>{getRelativeTime(reminder.createdAt)}</Text>
                </View>
              </View>
              <View className={styles.cardContent}>
                <Text>{reminder.content}</Text>
              </View>
              <View className={styles.cardFooter}>
                <View
                  className={`${styles.actionBtn} ${reminder.type === 'pending' ? styles.primary : ''}`}
                  onClick={(e) => handleQuickAction(reminder, e)}
                >
                  <Text>{getActionText(reminder.type)}</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <EmptyState
            icon="🔔"
            title="暂无提醒"
            description="有新消息时会在这里显示"
          />
        )}
      </ScrollView>
    </View>
  );
};

export default ReminderPage;
