import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import useHandoverStore from '../../store/useHandoverStore';
import { PostType, Shift } from '../../types/handover';
import { getPostName } from '../../data/mockData';
import { navigateTo } from '../../utils';

const StatsPage: React.FC = () => {
  const { handoverItems, shifts, getStats } = useHandoverStore();
  const stats = useMemo(() => getStats(), [handoverItems, getStats]);
  
  const [filterPost, setFilterPost] = useState<PostType | 'all'>('all');
  const [filterShift, setFilterShift] = useState<string>('all');

  useDidShow(() => {
    // 页面显示时刷新统计
  });

  const filteredShifts = useMemo(() => {
    if (filterPost === 'all') return shifts;
    return shifts.filter(s => s.post === filterPost);
  }, [shifts, filterPost]);

  const filteredHandoverItems = useMemo(() => {
    let items = handoverItems;
    if (filterPost !== 'all') {
      items = items.filter(i => i.post === filterPost);
    }
    if (filterShift !== 'all') {
      items = items.filter(i => i.shiftId === filterShift);
    }
    return items;
  }, [handoverItems, filterPost, filterShift]);

  const filteredStats = useMemo(() => {
    const items = filteredHandoverItems;
    const total = items.length;
    const pending = items.filter(i => i.status === 'pending').length;
    const confirmed = items.filter(i => i.status === 'confirmed').length;
    const returned = items.filter(i => i.status === 'returned').length;
    const completed = items.filter(i => i.status === 'completed').length;
    const finished = confirmed + completed;
    const completedRate = total > 0 ? Math.round((finished / total) * 1000) / 10 : 0;
    const returnRate = total > 0 ? Math.round((returned / total) * 1000) / 10 : 0;
    
    const overdueItems = items.filter(i => {
      if (!i.deadline) return false;
      if (i.status === 'completed') return false;
      return new Date(i.deadline).getTime() < Date.now();
    });
    const overdueRate = total > 0 ? Math.round((overdueItems.length / total) * 1000) / 10 : 0;
    
    return { total, pending, confirmed, returned, completed, completedRate, returnRate, overdueRate, overdueCount: overdueItems.length };
  }, [filteredHandoverItems]);

  const shiftStats = useMemo(() => {
    const targetShifts = filterShift === 'all' ? filteredShifts : filteredShifts.filter(s => s.id === filterShift);
    return targetShifts.map(shift => {
      const shiftItems = filteredHandoverItems.filter(i => i.shiftId === shift.id);
      const total = shiftItems.length;
      const pending = shiftItems.filter(i => i.status === 'pending').length;
      const confirmed = shiftItems.filter(i => i.status === 'confirmed').length;
      const returned = shiftItems.filter(i => i.status === 'returned').length;
      const completed = shiftItems.filter(i => i.status === 'completed').length;
      const finished = confirmed + completed;
      const completedRate = total > 0 ? Math.round((finished / total) * 1000) / 10 : 0;
      const returnRate = total > 0 ? Math.round((returned / total) * 1000) / 10 : 0;
      
      const overdueItems = shiftItems.filter(i => {
        if (!i.deadline) return false;
        if (i.status === 'completed') return false;
        return new Date(i.deadline).getTime() < Date.now();
      });
      const hasOverdueRisk = overdueItems.length > 0;
      
      return {
        shift,
        total,
        pending,
        confirmed,
        returned,
        completed,
        completedRate,
        returnRate,
        hasOverdueRisk,
        overdueCount: overdueItems.length
      };
    }).sort((a, b) => b.total - a.total);
  }, [filteredShifts, filteredHandoverItems, filterShift]);

  const getPostIcon = (post: PostType): string => {
    const iconMap = { service: '🎧', warehouse: '📦', store: '🏪' };
    return iconMap[post];
  };

  const posts: (PostType | 'all')[] = ['all', 'service', 'warehouse', 'store'];
  const getPostLabel = (post: PostType | 'all'): string => {
    if (post === 'all') return '全部岗位';
    return getPostName(post);
  };

  const handleShiftClick = (shift: Shift) => {
    navigateTo(`/pages/shift-detail/index?shiftId=${shift.id}`);
  };

  const maxTrendValue = Math.max(...stats.dailyTrend.map(d => d.count), 1);

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.content}>
        <View className={styles.filterSection}>
          <View className={styles.filterRow}>
            <Text className={styles.filterLabel}>岗位</Text>
            <ScrollView scrollX className={styles.filterOptions}>
              {posts.map(post => (
                <View
                  key={post}
                  className={`${styles.filterChip} ${filterPost === post ? styles.active : ''}`}
                  onClick={() => {
                    setFilterPost(post);
                    setFilterShift('all');
                  }}
                >
                  <Text>{getPostLabel(post)}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
          
          {filterPost !== 'all' && filteredShifts.length > 0 && (
            <View className={styles.filterRow}>
              <Text className={styles.filterLabel}>班次</Text>
              <ScrollView scrollX className={styles.filterOptions}>
                <View
                  className={`${styles.filterChip} ${filterShift === 'all' ? styles.active : ''}`}
                  onClick={() => setFilterShift('all')}
                >
                  <Text>全部班次</Text>
                </View>
                {filteredShifts.map(shift => (
                  <View
                    key={shift.id}
                    className={`${styles.filterChip} ${filterShift === shift.id ? styles.active : ''}`}
                    onClick={() => setFilterShift(shift.id)}
                  >
                    <Text>{shift.name}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        <Text className={styles.sectionTitle}>筛选结果</Text>
        
        <View className={styles.statsGrid}>
          <View className={`${styles.statCard} ${styles.featured}`}>
            <Text className={styles.statLabel}>交接总数</Text>
            <Text className={styles.statNum}>
              {filteredStats.total}
              <Text className={styles.unit}>条</Text>
            </Text>
            <Text className={styles.statSub}>
              {filterPost === 'all' ? '全部岗位' : getPostName(filterPost)}
            </Text>
          </View>

          <View className={styles.statCard}>
            <Text className={styles.statLabel}>完成率</Text>
            <Text className={styles.statNum}>
              {filteredStats.completedRate}
              <Text className={styles.unit}>%</Text>
            </Text>
            <Text className={styles.statSub}>已确认+已完成</Text>
          </View>

          <View className={styles.statCard}>
            <Text className={styles.statLabel}>退回率</Text>
            <Text className={`${styles.statNum} ${styles.warning}`}>
              {filteredStats.returnRate}
              <Text className={styles.unit}>%</Text>
            </Text>
            <Text className={styles.statSub}>{filteredStats.returned}条退回</Text>
          </View>

          <View className={styles.statCard}>
            <Text className={styles.statLabel}>超时风险</Text>
            <Text className={`${styles.statNum} ${styles.danger}`}>
              {filteredStats.overdueCount}
              <Text className={styles.unit}>条</Text>
            </Text>
            <Text className={styles.statSub}>
              {filteredStats.overdueRate > 0 ? `占比${filteredStats.overdueRate}%` : '暂无超时'}
            </Text>
          </View>
        </View>

        <View className={styles.statusDistribution}>
          <View className={styles.distributionHeader}>
            <Text className={styles.sectionTitle}>状态分布</Text>
          </View>
          <View className={styles.distributionBar}>
            {filteredStats.total > 0 ? (
              <>
                <View 
                  className={`${styles.distributionSegment} ${styles.pending}`}
                  style={{ width: `${(filteredStats.pending / filteredStats.total) * 100}%` }}
                />
                <View 
                  className={`${styles.distributionSegment} ${styles.confirmed}`}
                  style={{ width: `${(filteredStats.confirmed / filteredStats.total) * 100}%` }}
                />
                <View 
                  className={`${styles.distributionSegment} ${styles.returned}`}
                  style={{ width: `${(filteredStats.returned / filteredStats.total) * 100}%` }}
                />
                <View 
                  className={`${styles.distributionSegment} ${styles.completed}`}
                  style={{ width: `${(filteredStats.completed / filteredStats.total) * 100}%` }}
                />
              </>
            ) : null}
          </View>
          <View className={styles.distributionLegend}>
            <View className={styles.legendItem}>
              <View className={`${styles.legendDot} ${styles.pending}`} />
              <Text className={styles.legendText}>待确认 {filteredStats.pending}</Text>
            </View>
            <View className={styles.legendItem}>
              <View className={`${styles.legendDot} ${styles.confirmed}`} />
              <Text className={styles.legendText}>已确认 {filteredStats.confirmed}</Text>
            </View>
            <View className={styles.legendItem}>
              <View className={`${styles.legendDot} ${styles.returned}`} />
              <Text className={styles.legendText}>已退回 {filteredStats.returned}</Text>
            </View>
            <View className={styles.legendItem}>
              <View className={`${styles.legendDot} ${styles.completed}`} />
              <Text className={styles.legendText}>已完成 {filteredStats.completed}</Text>
            </View>
          </View>
        </View>

        <Text className={styles.sectionTitle}>班次统计</Text>
        <View className={styles.shiftStatsList}>
          {shiftStats.length > 0 ? (
            shiftStats.map(item => (
              <View 
                key={item.shift.id} 
                className={styles.shiftStatCard}
                onClick={() => handleShiftClick(item.shift)}
              >
                <View className={styles.shiftStatHeader}>
                  <View className={styles.shiftStatInfo}>
                    <Text className={styles.shiftStatName}>{item.shift.name}</Text>
                    <Text className={styles.shiftStatTime}>
                      {item.shift.startTime} - {item.shift.endTime}
                    </Text>
                  </View>
                  <View className={styles.shiftStatBadge}>
                    <Text className={styles.shiftStatCount}>{item.total}条</Text>
                    {item.hasOverdueRisk && (
                      <View className={styles.overdueBadge}>
                        <Text>⚠️ 超时</Text>
                      </View>
                    )}
                  </View>
                </View>
                
                <View className={styles.shiftStatNumbers}>
                  <View className={styles.shiftStatItem}>
                    <Text className={styles.shiftStatNum}>{item.pending}</Text>
                    <Text className={styles.shiftStatLabel}>待确认</Text>
                  </View>
                  <View className={styles.shiftStatItem}>
                    <Text className={styles.shiftStatNum}>{item.confirmed}</Text>
                    <Text className={styles.shiftStatLabel}>已确认</Text>
                  </View>
                  <View className={styles.shiftStatItem}>
                    <Text className={`${styles.shiftStatNum} ${styles.warning}`}>{item.returned}</Text>
                    <Text className={styles.shiftStatLabel}>已退回</Text>
                  </View>
                  <View className={styles.shiftStatItem}>
                    <Text className={`${styles.shiftStatNum} ${styles.success}`}>{item.completed}</Text>
                    <Text className={styles.shiftStatLabel}>已完成</Text>
                  </View>
                </View>

                <View className={styles.shiftStatFooter}>
                  <View className={styles.rateItem}>
                    <Text className={styles.rateLabel}>完成率</Text>
                    <Text className={styles.rateValue}>{item.completedRate}%</Text>
                  </View>
                  <View className={styles.rateItem}>
                    <Text className={styles.rateLabel}>退回率</Text>
                    <Text className={`${styles.rateValue} ${styles.warning}`}>{item.returnRate}%</Text>
                  </View>
                  <View className={styles.viewDetail}>
                    <Text>查看详情 →</Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View className={styles.emptyShift}>
              <Text>暂无班次数据</Text>
            </View>
          )}
        </View>

        <Text className={styles.sectionTitle}>各岗位统计</Text>
        <View className={styles.postStats}>
          {stats.postStats.map(item => (
            <View key={item.post} className={styles.postStatItem}>
              <View className={`${styles.postIcon} ${styles[item.post]}`}>
                <Text>{getPostIcon(item.post)}</Text>
              </View>
              <View className={styles.postInfo}>
                <Text className={styles.postName}>{getPostName(item.post)}</Text>
                <Text className={styles.postDesc}>交接 {item.count} 条</Text>
              </View>
              <View className={styles.postRate}>
                <Text className={styles.rateNum}>{item.completedRate}%</Text>
                <Text className={styles.rateLabel}>完成率</Text>
              </View>
            </View>
          ))}
        </View>

        <Text className={styles.sectionTitle}>高频问题标签</Text>
        <View className={styles.tagsSection}>
          <View className={styles.tagCloud}>
            {stats.topTags.length > 0 ? (
              stats.topTags.map((tag, index) => (
                <View
                  key={tag.tag}
                  className={`${styles.tagItem} ${index < 3 ? styles.hot : ''}`}
                >
                  <Text>{tag.tag}</Text>
                  <Text className={styles.tagCount}>{tag.count}</Text>
                </View>
              ))
            ) : (
              <View className={styles.emptyTags}>
                <Text className={styles.emptyText}>暂无标签数据</Text>
              </View>
            )}
          </View>
        </View>

        <Text className={styles.sectionTitle}>近7天趋势</Text>
        <View className={styles.trendSection}>
          <View className={styles.trendHeader}>
            <Text className={styles.trendTitle}>每日交接数量</Text>
          </View>
          <View className={styles.trendChart}>
            {stats.dailyTrend.map((item, index) => {
              const heightPercent = maxTrendValue > 0 
                ? (item.count / maxTrendValue) * 100 
                : 0;
              return (
                <View key={item.date} className={styles.chartBarWrap}>
                  <Text className={styles.chartValue}>{item.count}</Text>
                  <View 
                    className={styles.chartBar}
                    style={{ height: `${Math.max(heightPercent, 5)}%` }}
                  />
                  <Text className={styles.chartLabel}>{item.date}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default StatsPage;
