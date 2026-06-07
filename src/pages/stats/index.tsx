import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import useHandoverStore from '../../store/useHandoverStore';
import { PostType } from '../../types/handover';
import { getPostName } from '../../data/mockData';

const StatsPage: React.FC = () => {
  const { handoverItems, getStats } = useHandoverStore();
  const stats = useMemo(() => getStats(), [handoverItems, getStats]);

  useDidShow(() => {
    // 页面显示时刷新统计
  });

  const getPostIcon = (post: PostType): string => {
    const iconMap = { service: '🎧', warehouse: '📦', store: '🏪' };
    return iconMap[post];
  };

  const maxTrendValue = Math.max(...stats.dailyTrend.map(d => d.count), 1);

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.content}>
        <Text className={styles.sectionTitle}>核心指标</Text>
        
        <View className={styles.statsGrid}>
          <View className={`${styles.statCard} ${styles.featured}`}>
            <Text className={styles.statLabel}>交接总数（本月）</Text>
            <Text className={styles.statNum}>
              {stats.totalHandovers}
              <Text className={styles.unit}>条</Text>
            </Text>
            <Text className={styles.statSub}>实时统计</Text>
          </View>

          <View className={styles.statCard}>
            <Text className={styles.statLabel}>完成率</Text>
            <Text className={styles.statNum}>
              {stats.completedRate}
              <Text className={styles.unit}>%</Text>
            </Text>
            <Text className={styles.statSub}>已确认+已完成</Text>
          </View>

          <View className={styles.statCard}>
            <Text className={styles.statLabel}>准时率</Text>
            <Text className={styles.statNum}>
              {stats.onTimeRate}
              <Text className={styles.unit}>%</Text>
            </Text>
            <Text className={styles.statSub}>未超时占比</Text>
          </View>

          <View className={styles.statCard}>
            <Text className={styles.statLabel}>平均处理时长</Text>
            <Text className={styles.statNum}>
              {stats.avgHandleTime}
              <Text className={styles.unit}>分钟</Text>
            </Text>
            <Text className={styles.statSub}>历史均值</Text>
          </View>
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
