import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import useHandoverStore from '../../store/useHandoverStore';
import { getPostName } from '../../data/mockData';
import { TeamMember, HandoverItem } from '../../types/handover';
import { showToast, navigateTo, formatFullDate, showModal } from '../../utils';

const MemberConfirmPage: React.FC = () => {
  const router = useRouter();
  const { 
    shifts,
    handoverItems,
    shiftSummaries,
    shiftConfirmations,
    confirmMember,
    addReminder,
    members
  } = useHandoverStore();

  const [shiftId, setShiftId] = useState('');
  const [currentMemberId, setCurrentMemberId] = useState('');

  useEffect(() => {
    const id = router.params.shiftId;
    if (id) {
      setShiftId(id);
    }
    const memberId = router.params.memberId;
    if (memberId) {
      setCurrentMemberId(memberId);
    } else {
      setCurrentMemberId(members[0]?.id || '');
    }
  }, [router.params.shiftId, router.params.memberId, members]);

  const shift = useMemo(() => shifts.find(s => s.id === shiftId), [shifts, shiftId]);
  const shiftSummary = useMemo(() => shiftSummaries[shiftId], [shiftSummaries, shiftId]);
  const shiftHandoverItems = useMemo(() => handoverItems.filter(item => item.shiftId === shiftId), [handoverItems, shiftId]);
  const confirmations = useMemo(() => shiftConfirmations[shiftId] || {}, [shiftConfirmations, shiftId]);

  const memberConfirmList = useMemo(() => {
    if (!shift) return [];
    
    return shift.members.map(member => {
      const confirmation = confirmations[member.id];
      // 初始模拟几个已确认的
      const mockConfirmed = member.id === shift.members[0]?.id || member.id === shift.members[1]?.id;
      const mockTime = mockConfirmed ? new Date(Date.now() - 3600000).toISOString() : undefined;
      
      return {
        ...member,
        confirmed: confirmation?.confirmed || (mockConfirmed && !confirmation),
        confirmedAt: confirmation?.confirmedAt || mockTime
      };
    });
  }, [shift, confirmations]);

  const confirmedCount = memberConfirmList.filter(m => m.confirmed).length;
  const totalCount = memberConfirmList.length;

  const myItems = useMemo(() => {
    return shiftHandoverItems.filter(item => item.assignee.id === currentMemberId);
  }, [shiftHandoverItems, currentMemberId]);

  const currentMember = members.find(m => m.id === currentMemberId);
  const myConfirmation = memberConfirmList.find(m => m.id === currentMemberId);

  const handleMyConfirm = async () => {
    if (!shift || myConfirmation?.confirmed) return;

    const confirm = await showModal({
      title: '确认收到',
      content: '确认已收到本班组的所有交接事项？',
      confirmText: '确认收到'
    });

    if (confirm) {
      confirmMember(shiftId, currentMemberId);
      showToast('已确认收到', 'success');
    }
  };

  const handleSendReminder = () => {
    if (!shift) return;
    
    const unconfirmedMembers = memberConfirmList.filter(m => !m.confirmed);
    if (unconfirmedMembers.length === 0) {
      showToast('全员已确认');
      return;
    }

    unconfirmedMembers.forEach(member => {
      addReminder({
        type: 'system',
        title: '请确认交接',
        content: `班长提醒你确认${shift.name}的交接事项`,
        itemId: shiftId,
        relatedType: 'shift'
      });
    });

    showToast(`已提醒${unconfirmedMembers.length}位成员`, 'success');
  };

  const handleViewItem = (item: HandoverItem) => {
    navigateTo(`/pages/item-detail/index?id=${item.id}`);
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

        {currentMember && (
          <View className={styles.myConfirmCard}>
            <View className={styles.myConfirmHeader}>
              <Text className={styles.myConfirmTitle}>我的确认</Text>
              <View className={`${styles.myConfirmStatus} ${myConfirmation?.confirmed ? 'confirmed' : 'pending'}`}>
                <Text>{myConfirmation?.confirmed ? '已确认' : '待确认'}</Text>
              </View>
            </View>
            <View className={styles.myConfirmInfo}>
              <Image className={styles.myAvatar} src={currentMember.avatar} mode="aspectFill" />
              <View className={styles.myInfo}>
                <Text className={styles.myName}>{currentMember.name}</Text>
                <Text className={styles.myRole}>
                  {currentMember.id === shift.leader.id ? '班长' : '组员'}
                </Text>
              </View>
              {!myConfirmation?.confirmed && (
                <View className={styles.confirmBtn} onClick={handleMyConfirm}>
                  <Text>确认收到</Text>
                </View>
              )}
              {myConfirmation?.confirmedAt && (
                <Text className={styles.confirmTime}>
                  {formatFullDate(myConfirmation.confirmedAt)}
                </Text>
              )}
            </View>

            {myItems.length > 0 && (
              <View className={styles.myItemsSection}>
                <Text className={styles.myItemsTitle}>
                  我负责的事项（{myItems.length}条）
                </Text>
                <View className={styles.myItemsList}>
                  {myItems.slice(0, 3).map(item => (
                    <View 
                      key={item.id} 
                      className={styles.myItem}
                      onClick={() => handleViewItem(item)}
                    >
                      <Text className={styles.myItemTitle} numberOfLines={1}>{item.title}</Text>
                      <View className={`${styles.myItemStatus} status-${item.status}`}>
                        <Text>
                          {item.status === 'pending' ? '待确认' : 
                           item.status === 'confirmed' ? '处理中' : 
                           item.status === 'returned' ? '已退回' : '已完成'}
                        </Text>
                      </View>
                    </View>
                  ))}
                  {myItems.length > 3 && (
                    <View className={styles.myItemMore}>
                      <Text>还有{myItems.length - 3}条 →</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        )}

        {shiftSummary && (
          <View className={styles.summarySection}>
            <View className={styles.summarySectionHeader}>
              <Text className={styles.summarySectionTitle}>📝 班后总结</Text>
              <View className={styles.editSummaryBtn} onClick={handleSummary}>
                <Text>查看详情</Text>
              </View>
            </View>
            <View className={styles.summaryContent}>
              <Text className={styles.summaryText} numberOfLines={3}>{shiftSummary}</Text>
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
              {confirmedCount < totalCount && currentMember?.id === shift.leader.id && (
                <Text className={styles.remindBtn} onClick={handleSendReminder}>
                  一键提醒
                </Text>
              )}
            </View>
          </View>

          {memberConfirmList.map(member => (
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
