import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, Textarea } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import Tag from '../../components/Tag';
import StatusBadge from '../../components/StatusBadge';
import useHandoverStore from '../../store/useHandoverStore';
import { getPostName, getPriorityName } from '../../data/mockData';
import { 
  navigateTo, 
  navigateBack, 
  showToast, 
  showModal, 
  formatFullDate,
  formatDuration,
  formatFileSize,
  isOverdue,
  getRemainingTime
} from '../../utils';

const ItemDetailPage: React.FC = () => {
  const router = useRouter();
  const { 
    getHandoverItemById, 
    confirmHandover, 
    returnHandover, 
    resendHandover,
    completeHandover,
    markReminderRead
  } = useHandoverStore();

  const [itemId, setItemId] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [showReturnInput, setShowReturnInput] = useState(false);

  const item = getHandoverItemById(itemId);

  useEffect(() => {
    const id = router.params.id;
    if (id) {
      setItemId(id);
      // 标记相关提醒为已读
      // markReminderRead(id); // 简单处理，这里不追踪具体提醒id
    } else {
      showToast('事项不存在');
      setTimeout(() => navigateBack(), 1000);
    }
  }, [router.params.id]);

  useDidShow(() => {
    // 页面显示时刷新
  });

  const handleConfirm = async () => {
    if (!item) return;
    
    const confirm = await showModal({
      title: '确认交接',
      content: '确认已了解该交接事项，将开始跟进处理。',
      confirmText: '确认'
    });
    
    if (confirm) {
      confirmHandover(item.id);
      showToast('确认成功', 'success');
    }
  };

  const handleReturnToggle = () => {
    setShowReturnInput(!showReturnInput);
    setReturnReason('');
  };

  const handleReturnSubmit = async () => {
    if (!item) return;
    if (!returnReason.trim()) {
      showToast('请填写退回原因');
      return;
    }

    const confirm = await showModal({
      title: '确认退回',
      content: '退回后需要创建人补充信息后重新提交，确认退回吗？',
      confirmText: '退回'
    });

    if (confirm) {
      returnHandover(item.id, returnReason.trim());
      setShowReturnInput(false);
      setReturnReason('');
      showToast('已退回', 'success');
    }
  };

  const handleResend = () => {
    if (!item) return;
    resendHandover(item.id);
    showToast('已重新提交', 'success');
  };

  const handleComplete = async () => {
    if (!item) return;
    
    const confirm = await showModal({
      title: '完成交接',
      content: '确认该事项已全部处理完成？',
      confirmText: '已完成'
    });

    if (confirm) {
      completeHandover(item.id);
      showToast('已标记完成', 'success');
    }
  };

  const handleViewMembers = () => {
    if (item) {
      navigateTo(`/pages/member-confirm/index?shiftId=${item.shiftId}`);
    }
  };

  const handleEdit = () => {
    showToast('编辑功能开发中');
  };

  if (!item) {
    return (
      <View className={styles.page}>
        <View className={styles.content}>
          <Text>加载中...</Text>
        </View>
      </View>
    );
  }

  const overdue = isOverdue(item.deadline);
  const remainingTime = getRemainingTime(item.deadline);

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.content}>
        <View className={styles.baseCard}>
          <View className={styles.titleRow}>
            <Text className={styles.itemTitle}>{item.title}</Text>
            <StatusBadge status={item.status} />
          </View>

          <View className={styles.tagsRow}>
            <Tag text={getPostName(item.post)} type={item.post} />
            <Tag text={getPriorityName(item.priority)} type={item.priority} />
          </View>

          <Text className={styles.descText}>{item.description}</Text>
        </View>

        {item.returnedReason && (
          <View className={styles.returnedBox}>
            <Text className={styles.returnedTitle}>📋 退回原因</Text>
            <Text className={styles.returnedReason}>{item.returnedReason}</Text>
            {item.returnedAt && (
              <Text className={styles.returnedTime}>
                退回时间：{formatFullDate(item.returnedAt)}
              </Text>
            )}
          </View>
        )}

        {showReturnInput && item.status === 'pending' && (
          <View className={styles.returnInputBox}>
            <Text className={styles.returnInputTitle}>填写退回原因</Text>
            <Textarea
              className={styles.returnTextarea}
              placeholder="请详细说明退回原因，方便创建人补充信息"
              value={returnReason}
              onInput={(e) => setReturnReason(e.detail.value)}
              maxlength={200}
              autoHeight
            />
            <View className={styles.returnActions}>
              <View className={styles.returnCancel} onClick={handleReturnToggle}>
                <Text>取消</Text>
              </View>
              <View className={styles.returnSubmit} onClick={handleReturnSubmit}>
                <Text>确认退回</Text>
              </View>
            </View>
          </View>
        )}

        {(item.customerName || item.orderNo) && (
          <View className={styles.baseCard}>
            <Text className={styles.sectionTitle}>📌 关联信息</Text>
            <View className={styles.infoGrid}>
              {item.customerName && (
                <View className={styles.infoItem}>
                  <Text className={styles.infoLabel}>客户名称</Text>
                  <Text className={styles.infoValue}>{item.customerName}</Text>
                </View>
              )}
              {item.orderNo && (
                <View className={styles.infoItem}>
                  <Text className={styles.infoLabel}>订单编号</Text>
                  <Text className={styles.infoValue}>{item.orderNo}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {item.attachments.length > 0 && (
          <View className={styles.baseCard}>
            <Text className={styles.sectionTitle}>
              📎 附件记录 
              <Text style={{ fontSize: 22, color: '#86909C', fontWeight: 400, marginLeft: 8 }}>
                ({item.attachments.length}个)
              </Text>
            </Text>
            <View className={styles.attachmentsGrid}>
              {item.attachments.map(att => (
                <View key={att.id} className={styles.attachItem}>
                  {att.type === 'image' ? (
                    <Image 
                      className={styles.attachImage} 
                      src={att.url} 
                      mode="aspectFill"
                      onClick={() => {
                        Taro.previewImage({
                          urls: item.attachments.filter(a => a.type === 'image').map(a => a.url),
                          current: att.url
                        });
                      }}
                    />
                  ) : (
                    <View 
                      className={styles.attachVoice}
                      onClick={() => showToast('语音播放功能开发中')}
                    >
                      <Text className={styles.voiceIcon}>🎵</Text>
                      <Text className={styles.voiceName}>{att.name}</Text>
                      <Text className={styles.voiceDuration}>
                        {att.duration ? formatDuration(att.duration) : ''}
                      </Text>
                    </View>
                  )}
                  {att.size && (
                    <Text className={styles.attachSize}>{formatFileSize(att.size)}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        <View className={styles.baseCard}>
          <Text className={styles.sectionTitle}>👥 人员信息</Text>
          <View className={styles.personRow}>
            <Image className={styles.personAvatar} src={item.creator.avatar} mode="aspectFill" />
            <View className={styles.personInfo}>
              <Text className={styles.personName}>{item.creator.name}</Text>
              <Text className={styles.personRole}>{getPostName(item.creator.post)}组</Text>
            </View>
            <Text className={styles.personLabel}>创建人</Text>
          </View>
          <View className={styles.personRow}>
            <Image className={styles.personAvatar} src={item.assignee.avatar} mode="aspectFill" />
            <View className={styles.personInfo}>
              <Text className={styles.personName}>{item.assignee.name}</Text>
              <Text className={styles.personRole}>{getPostName(item.assignee.post)}组</Text>
            </View>
            <Text className={styles.personLabel}>接手人</Text>
          </View>
        </View>

        <View className={styles.baseCard}>
          <Text className={styles.sectionTitle}>⏰ 时间信息</Text>
          <View className={styles.timeInfo}>
            <View className={styles.timeItem}>
              <Text className={styles.timeLabel}>创建时间</Text>
              <Text className={styles.timeValue}>{formatFullDate(item.createdAt)}</Text>
            </View>
            {item.deadline && (
              <View className={styles.timeItem}>
                <Text className={styles.timeLabel}>截止时间</Text>
                <Text className={`${styles.timeValue} ${overdue ? styles.overdue : ''}`}>
                  {formatFullDate(item.deadline)}
                  {overdue ? '（已超时）' : `（剩余${remainingTime}）`}
                </Text>
              </View>
            )}
            {item.confirmedAt && (
              <View className={styles.timeItem}>
                <Text className={styles.timeLabel}>确认时间</Text>
                <Text className={styles.timeValue}>{formatFullDate(item.confirmedAt)}</Text>
              </View>
            )}
            {item.returnedAt && (
              <View className={styles.timeItem}>
                <Text className={styles.timeLabel}>退回时间</Text>
                <Text className={styles.timeValue}>{formatFullDate(item.returnedAt)}</Text>
              </View>
            )}
          </View>
        </View>

        {item.tags.length > 0 && (
          <View className={styles.baseCard}>
            <Text className={styles.sectionTitle}>🏷️ 问题标签</Text>
            <View className={styles.tagsRow}>
              {item.tags.map(tag => (
                <Tag key={tag} text={tag} type="default" size="md" />
              ))}
            </View>
          </View>
        )}
      </View>

      <View className={styles.bottomBar}>
        {item.status === 'pending' && (
          <>
            <View className={`${styles.btn} ${styles.danger}`} onClick={handleReturnToggle}>
              <Text>{showReturnInput ? '取消退回' : '退回补充'}</Text>
            </View>
            <View className={`${styles.btn} ${styles.primary}`} onClick={handleConfirm}>
              <Text>确认交接</Text>
            </View>
          </>
        )}
        {item.status === 'confirmed' && (
          <>
            <View className={`${styles.btn} ${styles.outline}`} onClick={handleViewMembers}>
              <Text>成员确认</Text>
            </View>
            <View className={`${styles.btn} ${styles.primary}`} onClick={handleComplete}>
              <Text>标记完成</Text>
            </View>
          </>
        )}
        {item.status === 'returned' && (
          <>
            <View className={`${styles.btn} ${styles.outline}`} onClick={handleEdit}>
              <Text>编辑详情</Text>
            </View>
            <View className={`${styles.btn} ${styles.primary}`} onClick={handleResend}>
              <Text>补充重发</Text>
            </View>
          </>
        )}
        {item.status === 'completed' && (
          <>
            <View className={`${styles.btn} ${styles.outline}`} onClick={handleViewMembers}>
              <Text>成员确认</Text>
            </View>
            <View className={`${styles.btn} ${styles.primary}`} onClick={() => navigateBack()}>
              <Text>返回</Text>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default ItemDetailPage;
