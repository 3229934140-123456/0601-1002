import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import Tag from '../../components/Tag';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import HandoverItemCard from '../../components/HandoverItem';
import useHandoverStore from '../../store/useHandoverStore';
import { getPostName } from '../../data/mockData';
import { HandoverStatus } from '../../types/handover';
import { navigateTo, navigateBack, showToast } from '../../utils';

const ShiftDetailPage: React.FC = () => {
  const router = useRouter();
  const { shifts, handoverItems } = useHandoverStore();

  const [shiftId, setShiftId] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'confirmed' | 'returned' | 'completed'>('all');

  useDidShow(() => {
    const id = router.params.shiftId;
    if (id) {
      setShiftId(id);
    }
  });

  const shift = useMemo(() => shifts.find(s => s.id === shiftId), [shifts, shiftId]);
  const shiftHandoverItems = useMemo(() => handoverItems.filter(item => item.shiftId === shiftId), [handoverItems, shiftId]);

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
            <StatusBadge status={statusMap[shift.status].type as any} text={statusMap[shift.status].text} />
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
