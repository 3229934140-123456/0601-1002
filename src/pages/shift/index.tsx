import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import ShiftCard from '../../components/ShiftCard';
import useHandoverStore from '../../store/useHandoverStore';
import { PostType } from '../../types/handover';
import { getPostName } from '../../data/mockData';
import { navigateTo, switchTab, showToast } from '../../utils';

const ShiftPage: React.FC = () => {
  const { shifts, handoverItems } = useHandoverStore();
  const [activePost, setActivePost] = useState<PostType>('service');
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

  useDidShow(() => {
    // 页面显示时刷新数据
  });

  const filteredShifts = useMemo(() => {
    return shifts.filter(s => s.post === activePost);
  }, [shifts, activePost]);

  const currentShift = useMemo(() => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    return filteredShifts.find(s => {
      const [startH, startM] = s.startTime.split(':').map(Number);
      const [endH, endM] = s.endTime.split(':').map(Number);
      const startTime = startH * 60 + startM;
      const endTime = endH * 60 + endM;
      return currentTime >= startTime && currentTime < endTime;
    }) || filteredShifts[0];
  }, [filteredShifts]);

  const otherShifts = useMemo(() => {
    return filteredShifts.filter(s => s.id !== currentShift?.id);
  }, [filteredShifts, currentShift]);

  const statsData = useMemo(() => {
    const postItems = handoverItems.filter(item => item.post === activePost);
    const postShifts = shifts.filter(s => s.post === activePost);
    const completedCount = postItems.filter(
      i => i.status === 'confirmed' || i.status === 'completed'
    ).length;
    const totalMembers = postShifts.reduce((acc, s) => acc + s.members.length, 0);
    
    return {
      total: postItems.length,
      completed: completedCount,
      members: totalMembers
    };
  }, [handoverItems, shifts, activePost]);

  const handlePostChange = (post: PostType) => {
    setActivePost(post);
  };

  const handleCreateShift = () => {
    navigateTo('/pages/create-shift/index');
  };

  const handleCreateHandover = () => {
    navigateTo('/pages/create-handover/index');
  };

  const handleViewHistory = () => {
    navigateTo('/pages/history/index');
  };

  const handleExport = () => {
    navigateTo('/pages/export/index');
  };

  const handleShiftSummary = () => {
    if (currentShift) {
      navigateTo(`/pages/shift-summary/index?shiftId=${currentShift.id}`);
    } else {
      showToast('请先选择班次');
    }
  };

  const quickActions = [
    { icon: '➕', text: '创建班次', type: 'blue', action: handleCreateShift },
    { icon: '📝', text: '新建交接', type: 'green', action: handleCreateHandover },
    { icon: '📊', text: '历史记录', type: 'orange', action: handleViewHistory },
    { icon: '📤', text: '导出', type: 'gray', action: handleExport },
    { icon: '📋', text: '班后总结', type: 'purple', action: handleShiftSummary },
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
            <Text className={styles.countText}>共 {filteredShifts.length} 个</Text>
          </View>
          {filteredShifts.length > 0 ? (
            filteredShifts.map(shift => (
              <ShiftCard key={shift.id} shift={shift} type="full" />
            ))
          ) : (
            <View style={{ padding: '80rpx 0', textAlign: 'center' }}>
              <Text style={{ fontSize: 28, color: '#86909C' }}>暂无班次，点击上方创建</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default ShiftPage;
