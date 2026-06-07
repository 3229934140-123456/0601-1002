import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Textarea } from '@tarojs/components';
import { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import useHandoverStore from '../../store/useHandoverStore';
import { navigateBack, showToast, showModal } from '../../utils';

const ShiftSummaryPage: React.FC = () => {
  const router = useRouter();
  const { getShiftById, getHandoverItemsByShift, addShiftSummary, getShiftSummary } = useHandoverStore();

  const [shiftId, setShiftId] = useState('');
  const [summary, setSummary] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const shift = getShiftById(shiftId);
  const handoverItems = getHandoverItemsByShift(shiftId);
  const savedSummary = getShiftSummary(shiftId);

  useEffect(() => {
    const id = router.params.shiftId;
    if (id) {
      setShiftId(id);
    }
  }, [router.params.shiftId]);

  useEffect(() => {
    if (savedSummary) {
      setSummary(savedSummary);
      setIsSaved(true);
    }
  }, [savedSummary]);

  const handleSave = async () => {
    if (!summary.trim()) {
      showToast('请填写班后总结内容');
      return;
    }

    if (isSaved) {
      const confirm = await showModal({
        title: '确认更新',
        content: '检测到已保存过总结，确认要更新吗？',
        confirmText: '更新'
      });
      if (!confirm) return;
    }

    addShiftSummary(shiftId, summary.trim());
    setIsSaved(true);
    showToast('保存成功', 'success');
  };

  const handleSubmit = async () => {
    if (!summary.trim()) {
      showToast('请填写班后总结内容');
      return;
    }

    const confirm = await showModal({
      title: '确认提交',
      content: '提交后将发送给所有班组成员，确认提交吗？',
      confirmText: '提交'
    });

    if (confirm) {
      addShiftSummary(shiftId, summary.trim());
      setIsSaved(true);
      showToast('提交成功', 'success');
      setTimeout(() => navigateBack(), 1500);
    }
  };

  const completedCount = handoverItems.filter(
    i => i.status === 'completed' || i.status === 'confirmed'
  ).length;

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.backBtn} onClick={() => navigateBack()}>
          <Text className={styles.backIcon}>←</Text>
        </View>
        <Text className={styles.headerTitle}>班后总结</Text>
        <View className={styles.placeholder}></View>
      </View>

      <ScrollView scrollY className={styles.content}>
        {shift && (
          <View className={styles.shiftInfo}>
            <Text className={styles.shiftName}>{shift.name}</Text>
            <Text className={styles.shiftTime}>
              {shift.startTime} - {shift.endTime}
            </Text>
            <View className={styles.shiftStats}>
              <View className={styles.statItem}>
                <Text className={styles.statNum}>{handoverItems.length}</Text>
                <Text className={styles.statLabel}>交接总数</Text>
              </View>
              <View className={styles.statItem}>
                <Text className={styles.statNum}>{completedCount}</Text>
                <Text className={styles.statLabel}>已完成</Text>
              </View>
              <View className={styles.statItem}>
                <Text className={styles.statNum}>
                  {handoverItems.length - completedCount}
                </Text>
                <Text className={styles.statLabel}>未完成</Text>
              </View>
            </View>
          </View>
        )}

        <View className={styles.summarySection}>
          <Text className={styles.sectionTitle}>
            总结内容
            {isSaved && <Text className={styles.savedTag}>已保存</Text>}
          </Text>
          
          <Textarea
            className={styles.summaryTextarea}
            placeholder="请填写本班组工作总结，包括完成情况、未完成事项、注意事项、下一班次重点关注等..."
            value={summary}
            onInput={(e) => {
              setSummary(e.detail.value);
              setIsSaved(false);
            }}
            maxlength={2000}
            autoHeight
            showConfirmBar={false}
          />
          
          <Text className={styles.wordCount}>{summary.length}/2000</Text>
        </View>

        <View className={styles.tipsSection}>
          <Text className={styles.tipsTitle}>📝 填写提示</Text>
          <View className={styles.tipsList}>
            <Text className={styles.tipsItem}>1. 已完成工作的总结和亮点</Text>
            <Text className={styles.tipsItem}>2. 未完成事项及原因说明</Text>
            <Text className={styles.tipsItem}>3. 需要下一班次重点关注的事项</Text>
            <Text className={styles.tipsItem}>4. 工作中遇到的问题和建议</Text>
          </View>
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <View className={styles.saveBtn} onClick={handleSave}>
          <Text>保存草稿</Text>
        </View>
        <View className={styles.submitBtn} onClick={handleSubmit}>
          <Text>提交总结</Text>
        </View>
      </View>
    </View>
  );
};

export default ShiftSummaryPage;
