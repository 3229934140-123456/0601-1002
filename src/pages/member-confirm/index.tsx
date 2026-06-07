import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import useHandoverStore from '../../store/useHandoverStore';
import { getPostName } from '../../data/mockData';
import { TeamMember } from '../../types/handover';
import { showToast, navigateTo, formatTime, formatFullDate } from '../../utils';

interface MemberConfirmInfo extends TeamMember {
  confirmed: boolean;
  confirmedAt?: string;
}

const MemberConfirmPage: React.FC = () => {
  const router = useRouter();
  const { getShiftById, getShiftSummary } = useHandoverStore();

  const [shiftId, setShiftId] = useState('');

  const shift = getShiftById(shiftId);
  const shiftSummary = getShiftSummary(shiftId);

  const [members, setMembers] = useState<MemberConfirmInfo[]>([]);

  useEffect(() => {
    const id = router.params.shiftId;
    if (id) {
      setShiftId(id);
    }
  }, [router.params.shiftId]);

  useEffect(() => {
    if (shift) {
      setMembers(
        shift.members.map((m, index) => ({
          ...m,
          confirmed: index < 2,
          confirmedAt: index < 2 ? `2026-06-08 09:${10 + index * 5}:00` : undefined
        }))
      );
    }
  }, [shift]);

  const confirmedCount = members.filter(m => m.confirmed).length;
  const totalCount = members.length;

  const handleSendReminder = () => {
    showToast('已提醒未确认成员', 'success');
  };

  const handleSummary = () => {
    if (shift) {
      navigateTo(`/pages/shift-summary/index?shiftId=${shift.id}`);
    }
  };

  if (!shift) {
    return (
      <View className={styles.page}>
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.content}>
        <View className={styles.summaryCard}>
          <Text className={styles.shiftName}>
            {getPostName(shift.post)} · {shift.name}
          </Text>
          <Text className={styles.shiftTime}>
            {shift.startTime} - {shift.endTime}
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

        {shiftSummary && (
          <View className={styles.summarySection}>
            <View className={styles.summarySectionHeader}>
              <Text className={styles.summarySectionTitle}>📝 班后总结</Text>
              <View className={styles.editSummaryBtn} onClick={handleSummary}>
                <Text>查看/编辑</Text>
              </View>
            </View>
            <View className={styles.summaryContent}>
              <Text className={styles.summaryText}>{shiftSummary}</Text>
            </View>
          </View>
        )}

        <View className={styles.memberList}>
          <View className={styles.listHeader}>
            <Text className={styles.listTitle}>确认状态</Text>
            <View className={styles.listActions}>
              <Text className={styles.listCount}>
                完成率 {Math.round((confirmedCount / totalCount) * 100)}%
              </Text>
              {confirmedCount < totalCount && (
                <Text className={styles.remindBtn} onClick={handleSendReminder}>
                  一键提醒
                </Text>
              )}
            </View>
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
                  {member.id === shift.leader.id ? '班长' : '组员'}
                </Text>
              </View>
              <View>
                <View className={`${styles.confirmStatus} ${member.confirmed ? 'confirmed' : 'pending'}`}>
                  <View className={styles.statusDot} />
                  <Text>{member.confirmed ? '已确认' : '待确认'}</Text>
                </View>
                {member.confirmedAt && (
                  <Text className={styles.confirmTime}>
                    {formatFullDate(member.confirmedAt)}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.summaryBtn} onClick={handleSummary}>
          <Text>{shiftSummary ? '编辑总结' : '班后总结'}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default MemberConfirmPage;
