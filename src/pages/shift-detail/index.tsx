import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import Tag from '../../components/Tag';
import EmptyState from '../../components/EmptyState';
import HandoverItemCard from '../../components/HandoverItem';
import useHandoverStore from '../../store/useHandoverStore';
import { getPostName } from '../../data/mockData';
import { ActivityItem } from '../../types/handover';
import { navigateTo, navigateBack, showToast, formatTime } from '../../utils';

const ShiftDetailPage: React.FC = () => {
  const router = useRouter();
  const { shifts, handoverItems, activities } = useHandoverStore();

  const [shiftId, setShiftId] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'confirmed' | 'returned' | 'completed'>('all');
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [showAllActivities, setShowAllActivities] = useState(false);

  useDidShow(() => {
    const id = router.params.shiftId;
    if (id) {
      setShiftId(id);
    }
  });

  const shift = useMemo(() => shifts.find(s => s.id === shiftId), [shifts, shiftId]);
  const shiftHandoverItems = useMemo(() => handoverItems.filter(item => item.shiftId === shiftId), [handoverItems, shiftId]);
  const shiftActivities = useMemo(() => 
    activities.filter(a => a.shiftId === shiftId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ), 
    [activities, shiftId]
  );

  const activityFilterOptions = [
    { key: 'all', label: '全部', icon: '📋' },
    { key: 'create', label: '新建', icon: '📝' },
    { key: 'confirm', label: '确认', icon: '✅' },
    { key: 'return', label: '退回', icon: '↩️' },
    { key: 'resend', label: '重发', icon: '🔄' },
    { key: 'complete', label: '完成', icon: '🏁' },
    { key: 'member_confirm', label: '成员确认', icon: '👤' },
    { key: 'remind', label: '提醒', icon: '🔔' },
  ];

  const filteredActivities = useMemo(() => {
    if (activityFilter === 'all') return shiftActivities;
    return shiftActivities.filter(a => a.type === activityFilter);
  }, [shiftActivities, activityFilter]);

  // 将退回和对应的重发/确认串联成组
  const activityGroups = useMemo(() => {
    const groups: { id: string; activities: ActivityItem[]; isReturnChain: boolean }[] = [];
    const processedIds = new Set<string>();

    // 先按时间正序排列，便于查找关联
    const sortedActivities = [...filteredActivities].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    sortedActivities.forEach(activity => {
      if (processedIds.has(activity.id)) return;

      // 如果是退回操作，查找后续的重发和确认，组成一个链
      if (activity.type === 'return' && activity.itemId) {
        const chain: ActivityItem[] = [activity];
        processedIds.add(activity.id);

        // 查找后续的重发和确认
        let currentItemId = activity.itemId;
        let foundMore = true;
        
        while (foundMore) {
          foundMore = false;
          const nextActivity = sortedActivities.find(a => 
            !processedIds.has(a.id) && 
            a.itemId === currentItemId && 
            (a.type === 'resend' || a.type === 'confirm') &&
            new Date(a.createdAt).getTime() > new Date(chain[chain.length - 1].createdAt).getTime()
          );
          
          if (nextActivity) {
            chain.push(nextActivity);
            processedIds.add(nextActivity.id);
            if (nextActivity.type === 'resend') {
              // 重发后继续找确认
              foundMore = true;
            }
          }
        }

        groups.push({
          id: `chain-${activity.id}`,
          activities: chain,
          isReturnChain: true
        });
      } else {
        groups.push({
          id: activity.id,
          activities: [activity],
          isReturnChain: false
        });
        processedIds.add(activity.id);
      }
    });

    // 再按时间倒序排列显示
    return groups.sort((a, b) => {
      const aTime = new Date(a.activities[a.activities.length - 1].createdAt).getTime();
      const bTime = new Date(b.activities[b.activities.length - 1].createdAt).getTime();
      return bTime - aTime;
    });
  }, [filteredActivities]);

  const filteredItems = useMemo(() => {
    if (activeTab === 'all') return shiftHandoverItems;
    return shiftHandoverItems.filter(item => item.status === activeTab);
  }, [shiftHandoverItems, activeTab]);

  const stats = useMemo(() => {
    const total = shiftHandoverItems.length;
    const pending = shiftHandoverItems.filter(i => i.status === 'pending').length;
    const confirmed = shiftHandoverItems.filter(i => i.status === 'confirmed').length;
    const returned = shiftHandoverItems.filter(i => i.status === 'returned').length;
    const completed = shiftHandoverItems.filter(i => i.status === 'completed').length;
    const progress = total > 0 ? Math.round(((confirmed + completed) / total) * 100) : 0;
    return { total, pending, confirmed, returned, completed, progress };
  }, [shiftHandoverItems]);

  const handleCreateHandover = () => {
    if (shift) {
      navigateTo(`/pages/create-handover/index?shiftId=${shift.id}&post=${shift.post}`);
    }
  };

  const handleViewMembers = () => {
    if (shift) {
      navigateTo(`/pages/member-confirm/index?shiftId=${shift.id}`);
    }
  };

  const handleShiftSummary = () => {
    if (shift) {
      navigateTo(`/pages/shift-summary/index?shiftId=${shift.id}`);
    }
  };

  const statusMap = {
    ongoing: { text: '进行中', type: 'success' as const },
    upcoming: { text: '即将开始', type: 'warning' as const },
    finished: { text: '已结束', type: 'default' as const }
  };

  const getActivityIcon = (type: string): string => {
    const iconMap: Record<string, string> = {
      create: '📝',
      confirm: '✅',
      return: '↩️',
      resend: '🔄',
      complete: '🏁',
      member_confirm: '👤',
      summary: '📊',
      remind: '🔔'
    };
    return iconMap[type] || '📌';
  };

  const handleActivityClick = (activity: ActivityItem) => {
    if (activity.itemId) {
      navigateTo(`/pages/item-detail/index?id=${activity.itemId}`);
    } else if (activity.type === 'member_confirm' || activity.type === 'remind') {
      navigateTo(`/pages/member-confirm/index?shiftId=${activity.shiftId}`);
    } else if (activity.type === 'summary') {
      navigateTo(`/pages/shift-summary/index?shiftId=${activity.shiftId}`);
    }
  };

  if (!shift) {
    return (
      <View className={styles.page}>
        <View className={styles.content}>
          <EmptyState icon="⏰" title="班次不存在" description="请返回后重试" />
        </View>
      </View>
    );
  }

  const tabs = [
    { key: 'all', label: '全部', count: stats.total },
    { key: 'pending', label: '待确认', count: stats.pending },
    { key: 'confirmed', label: '已确认', count: stats.confirmed },
    { key: 'returned', label: '已退回', count: stats.returned },
    { key: 'completed', label: '已完成', count: stats.completed }
  ];

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <View className={styles.navBar}>
          <View className={styles.backBtn} onClick={() => navigateBack()}>
            <Text className={styles.backIcon}>←</Text>
          </View>
          <Text className={styles.navTitle}>班次详情</Text>
          <View className={styles.navAction} onClick={handleShiftSummary}>
            <Text>总结</Text>
          </View>
        </View>

        <View className={styles.shiftInfo}>
          <View className={styles.shiftHeader}>
            <Tag text={getPostName(shift.post)} type={shift.post} size="md" />
            <View className={`${styles.shiftStatus} ${styles[shift.status]}`}>
              <View className={styles.shiftStatusDot} />
              <Text>{statusMap[shift.status].text}</Text>
            </View>
          </View>
          <Text className={styles.shiftName}>{shift.name}</Text>
          <Text className={styles.shiftTime}>
            {shift.startTime} - {shift.endTime}
          </Text>
        </View>

        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{stats.total}</Text>
            <Text className={styles.statLabel}>交接总数</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{stats.pending}</Text>
            <Text className={styles.statLabel}>待确认</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{stats.returned}</Text>
            <Text className={styles.statLabel}>已退回</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{stats.progress}%</Text>
            <Text className={styles.statLabel}>完成率</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.memberCard}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardTitle}>👥 班组成员</Text>
            <View className={styles.viewMore} onClick={handleViewMembers}>
              <Text>查看全部</Text>
              <Text className={styles.arrow}>→</Text>
            </View>
          </View>
          
          <View className={styles.memberList}>
            <View className={styles.leaderBlock}>
              <View className={styles.leaderLabel}>班长</View>
              <View className={styles.memberItem}>
                <Image className={styles.memberAvatar} src={shift.leader.avatar} mode="aspectFill" />
                <View className={styles.memberInfo}>
                  <Text className={styles.memberName}>{shift.leader.name}</Text>
                  <Text className={styles.memberRole}>班长</Text>
                </View>
              </View>
            </View>
            
            <View className={styles.membersBlock}>
              <View className={styles.membersLabel}>
                组员（{shift.members.filter(m => m.id !== shift.leader.id).length}人）
              </View>
              <View className={styles.memberAvatars}>
                {shift.members.filter(m => m.id !== shift.leader.id).map(member => (
                  <View key={member.id} className={styles.avatarItem}>
                    <Image className={styles.memberAvatarSmall} src={member.avatar} mode="aspectFill" />
                    <Text className={styles.avatarName}>{member.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View className={styles.timelineCard}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardTitle}>⏱️ 交接动态</Text>
            <Text className={styles.cardSubtitle}>共 {filteredActivities.length} 条</Text>
          </View>

          <ScrollView scrollX className={styles.activityFilterBar}>
            {activityFilterOptions.map(option => (
              <View
                key={option.key}
                className={`${styles.activityFilterChip} ${activityFilter === option.key ? styles.active : ''}`}
                onClick={() => setActivityFilter(option.key)}
              >
                <Text className={styles.filterIcon}>{option.icon}</Text>
                <Text className={styles.filterLabel}>{option.label}</Text>
              </View>
            ))}
          </ScrollView>
          
          {filteredActivities.length > 0 ? (
            <View className={styles.timelineList}>
              {activityGroups
                .slice(0, showAllActivities ? undefined : 8)
                .map((group, groupIndex) => {
                  const isLastGroup = groupIndex === Math.min(activityGroups.length - 1, showAllActivities ? activityGroups.length - 1 : 7);
                  
                  if (group.isReturnChain && group.activities.length > 1) {
                    return (
                      <View 
                        key={group.id} 
                        className={`${styles.timelineGroup} ${isLastGroup ? styles.last : ''}`}
                      >
                        <View className={styles.chainHeader}>
                          <View className={styles.chainBadge}>
                            <Text>🔗 事项流转</Text>
                          </View>
                          <Text className={styles.chainTime}>
                            {formatTime(group.activities[group.activities.length - 1].createdAt)}
                          </Text>
                        </View>
                        <View className={styles.chainList}>
                          {group.activities.map((activity, actIndex) => (
                            <View 
                              key={activity.id}
                              className={`${styles.timelineItem} ${styles.chainItem} ${actIndex === group.activities.length - 1 ? styles.lastChainItem : ''}`}
                              onClick={() => handleActivityClick(activity)}
                            >
                              <View className={styles.timelineDot}>
                                <Text className={styles.timelineIcon}>{getActivityIcon(activity.type)}</Text>
                              </View>
                              <View className={styles.timelineContent}>
                                <View className={styles.timelineHeader}>
                                  <Text className={styles.timelineTitle}>{activity.title}</Text>
                                </View>
                                {activity.description && (
                                  <Text className={styles.timelineDesc}>{activity.description}</Text>
                                )}
                                <View className={styles.timelineFooter}>
                                  <Text className={styles.timelineOperator}>
                                    {activity.operator.name}
                                  </Text>
                                  <Text className={styles.timelineTime}>
                                    {formatTime(activity.createdAt)}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          ))}
                        </View>
                      </View>
                    );
                  }
                  
                  const activity = group.activities[0];
                  return (
                    <View 
                      key={activity.id} 
                      className={`${styles.timelineItem} ${isLastGroup ? styles.last : ''}`}
                      onClick={() => handleActivityClick(activity)}
                    >
                      <View className={styles.timelineDot}>
                        <Text className={styles.timelineIcon}>{getActivityIcon(activity.type)}</Text>
                      </View>
                      <View className={styles.timelineContent}>
                        <View className={styles.timelineHeader}>
                          <Text className={styles.timelineTitle}>{activity.title}</Text>
                          <Text className={styles.timelineTime}>{formatTime(activity.createdAt)}</Text>
                        </View>
                        {activity.description && (
                          <Text className={styles.timelineDesc}>{activity.description}</Text>
                        )}
                        <Text className={styles.timelineOperator}>
                          {activity.operator.name}
                        </Text>
                      </View>
                    </View>
                  );
                })}
            </View>
          ) : (
            <EmptyState 
              icon="📋" 
              title="暂无动态" 
              description="新建交接后将显示动态记录"
            />
          )}

          {filteredActivities.length > 8 && (
            <View 
              className={styles.expandBtn}
              onClick={() => setShowAllActivities(!showAllActivities)}
            >
              <Text>{showAllActivities ? '收起' : `展开全部（${filteredActivities.length}条）`}</Text>
            </View>
          )}
        </View>

        <View className={styles.actionRow}>
          <View className={styles.actionCard} onClick={handleCreateHandover}>
            <Text className={styles.actionIcon}>➕</Text>
            <Text className={styles.actionText}>新建交接</Text>
          </View>
          <View className={styles.actionCard} onClick={handleViewMembers}>
            <Text className={styles.actionIcon}>✅</Text>
            <Text className={styles.actionText}>成员确认</Text>
          </View>
          <View className={styles.actionCard} onClick={handleShiftSummary}>
            <Text className={styles.actionIcon}>📝</Text>
            <Text className={styles.actionText}>班后总结</Text>
          </View>
        </View>

        <View className={styles.tabsSection}>
          <ScrollView scrollX className={styles.tabsBar}>
            {tabs.map(tab => (
              <View
                key={tab.key}
                className={`${styles.tabItem} ${activeTab === tab.key ? styles.active : ''}`}
                onClick={() => setActiveTab(tab.key as any)}
              >
                <Text>{tab.label}</Text>
                <Text className={styles.tabCount}>{tab.count}</Text>
              </View>
            ))}
          </ScrollView>

          <View className={styles.listContent}>
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <HandoverItemCard key={item.id} item={item} />
              ))
            ) : (
              <EmptyState
                icon="📋"
                title="暂无交接事项"
                description={activeTab === 'all' ? '点击上方新建交接待添加' : '该状态下暂无事项'}
              />
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default ShiftDetailPage;
