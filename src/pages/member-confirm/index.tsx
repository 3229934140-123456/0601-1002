import React, { useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import styles from './index.module.scss';
import { mockShifts, getPostName } from '../../data/mockData';
import { TeamMember } from '../../types/handover';
import { showToast, formatTime } from '../../utils';

interface MemberConfirmInfo extends TeamMember {
  confirmed: boolean;
  confirmedAt?: string;
}

const MemberConfirmPage: React.FC = () => {
  const currentShift = mockShifts[0];

  const [members, setMembers] = useState<MemberConfirmInfo[]>(
    currentShift.members.map((m, index) => ({
      ...m,
      confirmed: index < 2,
      confirmedAt: index < 2 ? `2026-06-08 09:${10 + index * 5}:00` : undefined
    }))
  );

  const confirmedCount = members.filter(m => m.confirmed).length;
  const totalCount = members.length;

  const handleSendReminder = () => {
    showToast('已提醒未确认成员', 'success');
  };

  const handleFinishSummary = () => {
    showToast('班后总结功能开发中');
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.content}>
        <View className={styles.summaryCard}>
          <Text className={styles.shiftName}>
            {getPostName(currentShift.post)} · {currentShift.name}
          </Text>
          <Text className={styles.shiftTime}>
            {currentShift.startTime} - {currentShift.endTime}
          </Text>
          
          <View className={styles.statsRow}>
            <View className={styles.statCol}>
              <Text className={styles.statNum}>{totalCount}</Text>
              <Text className={styles.statLabel}>总人数</Text>
            </View>
            <View className={styles.statCol}>
              <Text className={styles.statNum}>{confirmedCount}</Text>
              <Text className={styles.statLabel}>已确认</Text>
            </View>
            <View className={styles.statCol}>
              <Text className={styles.statNum}>{totalCount - confirmedCount}</Text>
              <Text className={styles.statLabel}>未确认</Text>
            </View>
          </View>
        </View>

        <View className={styles.memberList}>
          <View className={styles.listHeader}>
            <Text className={styles.listTitle}>确认状态</Text>
            <Text className={styles.listCount}>
              完成率 {Math.round((confirmedCount / totalCount) * 100)}%
            </Text>
          </View>

          {members.map(member => (
            <View key={member.id} className={styles.memberItem}>
              <Image 
                className={styles.memberAvatar} 
                src={member.avatar} 
                mode="aspectFill" 
              />
              <View className={styles.memberInfo}>
                <Text className={styles.memberName}>{member.name}</Text>
                <Text className={styles.memberRole}>
                  {member.id === currentShift.leader.id ? '班长' : '组员'}
                </Text>
              </View>
              <View>
                <View className={`${styles.confirmStatus} ${member.confirmed ? 'confirmed' : 'pending'}`}>
                  <View className={styles.statusDot} />
                  <Text>{member.confirmed ? '已确认' : '待确认'}</Text>
                </View>
                {member.confirmedAt && (
                  <Text className={styles.confirmTime}>
                    {formatTime(member.confirmedAt)} 确认
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.summaryBtn} onClick={handleFinishSummary}>
          <Text>班后总结</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default MemberConfirmPage;
