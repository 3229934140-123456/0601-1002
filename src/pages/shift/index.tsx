import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import ShiftCard from '../../components/ShiftCard';
import { mockShifts, mockMembers, getPostName } from '../../data/mockData';
import { PostType, Shift } from '../../types/handover';
import { navigateTo, switchTab, showToast } from '../../utils';

const ShiftPage: React.FC = () => {
  const [activePost, setActivePost] = useState<PostType>('service');
  const [shifts, setShifts] = useState<Shift[]>(mockShifts);
  const [today, setToday] = useState('');
  const [weekday, setWeekday] = useState('');

  useEffect(() => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    setToday(`${month}月${day}日`);
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    setWeekday(weekdays[now.getDay()]);
  }, []);

  usePullDownRefresh(() => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      showToast('刷新成功', 'success');
    }, 1000);
  });

  const filteredShifts = shifts.filter(s => s.post === activePost);
  const currentShift = filteredShifts.find(s => s.status === 'ongoing');
  const otherShifts = filteredShifts.filter(s => s.status !== 'ongoing');

  const todayAllShifts = shifts;

  const handlePostChange = (post: PostType) => {
    setActivePost(post);
  };

  const handleCreateShift = () => {
    showToast('创建班次功能开发中');
  };

  const handleCreateHandover = () => {
    navigateTo('/pages/create-handover/index');
  };

  const handleViewHistory = () => {
    switchTab('/pages/handover/index');
  };

  const handleExport = () => {
    showToast('导出功能开发中');
  };

  const statsData = {
    total: filteredShifts.reduce((acc, s) => acc + s.handoverCount, 0),
    completed: filteredShifts.reduce((acc, s) => acc + s.completedCount, 0),
    members: filteredShifts.reduce((acc, s) => acc + s.members.length, 0)
  };

  const quickActions = [
    { icon: '➕', text: '创建班次', type: 'blue', action: handleCreateShift },
    { icon: '📝', text: '新建交接', type: 'green', action: handleCreateHandover },
    { icon: '📊', text: '历史记录', type: 'orange', action: handleViewHistory },
    { icon: '📤', text: '导出', type: 'gray', action: handleExport },
  ];

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <View className={styles.headerTop}>
          <View className={styles.dateInfo}>
            <Text className={styles.dateText}>{today}</Text>
            <Text className={styles.weekText}>{weekday} · 团队交接班</Text>
          </View>
          <View className={styles.headerActions}>
            <View className={styles.headerBtn} onClick={handleCreateShift}>
              <Text>➕</Text>
            </View>
          </View>
        </View>

        <View className={styles.postTabs}>
          {(['service', 'warehouse', 'store'] as PostType[]).map(post => (
            <View
              key={post}
              className={`${styles.postTab} ${activePost === post ? styles.active : ''}`}
              onClick={() => handlePostChange(post)}
            >
              <Text>{getPostName(post)}</Text>
            </View>
          ))}
        </View>

        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{statsData.total}</Text>
            <Text className={styles.statLabel}>交接总数</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{statsData.completed}</Text>
            <Text className={styles.statLabel}>已完成</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{statsData.members}</Text>
            <Text className={styles.statLabel}>在岗人数</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        {currentShift && (
          <View className={styles.currentShift}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>当前班次</Text>
            </View>
            <ShiftCard shift={currentShift} type="full" />
          </View>
        )}

        <View className={styles.quickActions}>
          {quickActions.map((action, index) => (
            <View key={index} className={styles.actionItem} onClick={action.action}>
              <View className={`${styles.actionIcon} ${styles[action.type]}`}>
                <Text>{action.icon}</Text>
              </View>
              <Text className={styles.actionText}>{action.text}</Text>
            </View>
          ))}
        </View>

        {otherShifts.length > 0 && (
          <View>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>其他班次</Text>
            </View>
            <ScrollView scrollX className={styles.shiftsScroll}>
              {otherShifts.map(shift => (
                <View key={shift.id} className={styles.shiftCardWrapper}>
                  <ShiftCard shift={shift} type="compact" />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View className={styles.todayList}>
          <View className={styles.listTitle}>
            <Text className={styles.titleText}>今日所有班次</Text>
            <Text className={styles.countText}>共 {todayAllShifts.length} 个</Text>
          </View>
          {todayAllShifts.map(shift => (
            <ShiftCard key={shift.id} shift={shift} type="full" />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default ShiftPage;
