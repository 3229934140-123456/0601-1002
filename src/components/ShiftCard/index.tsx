import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import styles from './index.module.scss';
import { Shift } from '../../types/handover';
import { getPostName } from '../../data/mockData';
import Tag from '../Tag';
import { navigateTo } from '../../utils';

interface ShiftCardProps {
  shift: Shift;
  type?: 'compact' | 'full';
}

const ShiftCard: React.FC<ShiftCardProps> = ({ shift, type = 'full' }) => {
  const statusMap = {
    ongoing: { text: '进行中', type: 'success' as const },
    upcoming: { text: '即将开始', type: 'warning' as const },
    finished: { text: '已结束', type: 'default' as const }
  };

  const progress = shift.handoverCount > 0 
    ? Math.round((shift.completedCount / shift.handoverCount) * 100) 
    : 0;

  const handleClick = () => {
    navigateTo(`/pages/item-detail/index?id=${shift.id}`);
  };

  if (type === 'compact') {
    return (
      <View className={styles.compactCard} onClick={handleClick}>
        <View className={styles.compactHeader}>
          <Tag text={getPostName(shift.post)} type={shift.post} size="sm" />
          <Tag text={statusMap[shift.status].text} type={statusMap[shift.status].type} size="sm" />
        </View>
        <Text className={styles.shiftName}>{shift.name}</Text>
        <Text className={styles.shiftTime}>{shift.startTime} - {shift.endTime}</Text>
        <View className={styles.compactProgress}>
          <View className={styles.progressBar}>
            <View className={styles.progressFill} style={{ width: `${progress}%` }} />
          </View>
          <Text className={styles.progressText}>{shift.completedCount}/{shift.handoverCount}</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.cardHeader}>
        <View className={styles.headerLeft}>
          <Tag text={getPostName(shift.post)} type={shift.post} size="md" />
          <Text className={styles.shiftTitle}>{shift.name}</Text>
        </View>
        <Tag text={statusMap[shift.status].text} type={statusMap[shift.status].type} size="md" />
      </View>

      <View className={styles.timeRow}>
        <View className={styles.timeBlock}>
          <Text className={styles.timeLabel}>上班时间</Text>
          <Text className={styles.timeValue}>{shift.startTime}</Text>
        </View>
        <View className={styles.timeDivider} />
        <View className={styles.timeBlock}>
          <Text className={styles.timeLabel}>下班时间</Text>
          <Text className={styles.timeValue}>{shift.endTime}</Text>
        </View>
        <View className={styles.timeDivider} />
        <View className={styles.timeBlock}>
          <Text className={styles.timeLabel}>班长</Text>
          <View className={styles.leaderInfo}>
            <Image className={styles.leaderAvatar} src={shift.leader.avatar} mode="aspectFill" />
            <Text className={styles.leaderName}>{shift.leader.name}</Text>
          </View>
        </View>
      </View>

      <View className={styles.progressSection}>
        <View className={styles.progressHeader}>
          <Text className={styles.progressLabel}>交接完成率</Text>
          <Text className={styles.progressPercent}>{progress}%</Text>
        </View>
        <View className={styles.progressBar}>
          <View className={styles.progressFill} style={{ width: `${progress}%` }} />
        </View>
        <View className={styles.progressDetail}>
          <Text className={styles.progressDetailText}>
            已完成 {shift.completedCount} 项 / 共 {shift.handoverCount} 项
          </Text>
        </View>
      </View>

      <View className={styles.memberSection}>
        <Text className={styles.memberLabel}>班组成员（{shift.members.length}人）</Text>
        <View className={styles.memberAvatars}>
          {shift.members.slice(0, 5).map((member, index) => (
            <Image 
              key={member.id} 
              className={styles.memberAvatar} 
              src={member.avatar} 
              mode="aspectFill"
              style={{ marginLeft: index > 0 ? '-16rpx' : '0' }}
            />
          ))}
          {shift.members.length > 5 && (
            <View className={styles.memberMore}>
              <Text className={styles.memberMoreText}>+{shift.members.length - 5}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default ShiftCard;
