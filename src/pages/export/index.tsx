import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import useHandoverStore from '../../store/useHandoverStore';
import { PostType, HandoverStatus } from '../../types/handover';
import { navigateBack, showToast, formatFullDate } from '../../utils';

const ExportPage: React.FC = () => {
  const { handoverItems, shifts } = useHandoverStore();

  const [postFilter, setPostFilter] = useState<PostType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<HandoverStatus | 'all'>('all');
  const [shiftId, setShiftId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const filteredItems = useMemo(() => {
    return handoverItems.filter(item => {
      const matchPost = postFilter === 'all' || item.post === postFilter;
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchShift = !shiftId || item.shiftId === shiftId;
      
      const matchDate = 
        (!startDate || new Date(item.createdAt) >= new Date(startDate)) &&
        (!endDate || new Date(item.createdAt) <= new Date(endDate + ' 23:59:59'));

      return matchPost && matchStatus && matchShift && matchDate;
    });
  }, [handoverItems, postFilter, statusFilter, shiftId, startDate, endDate]);

  const handleExport = async () => {
    if (filteredItems.length === 0) {
      showToast('没有可导出的交接记录');
      return;
    }

    setIsExporting(true);
    showToast('正在生成...', 'loading');

    // 模拟导出过程
    setTimeout(() => {
      setIsExporting(false);
      Taro.hideToast();
      
      // 生成预览内容（实际项目中可生成 Excel/PDF）
      const exportDate = new Date().toLocaleDateString();
      showToast(`导出成功！共${filteredItems.length}条`, 'success');
      
      // 模拟下载预览
      console.log(`【交接单导出】\n导出时间：${exportDate}\n共 ${filteredItems.length} 条记录`);
      filteredItems.forEach(item => {
        console.log(`- ${item.title} [${item.status}] - ${formatFullDate(item.createdAt)}`);
      });
    }, 1500);
  };

  const postOptions = [
    { key: 'all', label: '全部岗位' },
    { key: 'service', label: '客服' },
    { key: 'warehouse', label: '仓储' },
    { key: 'store', label: '门店' }
  ];

  const statusOptions: { key: HandoverStatus | 'all'; label: string }[] = [
    { key: 'all', label: '全部状态' },
    { key: 'pending', label: '待确认' },
    { key: 'confirmed', label: '已确认' },
    { key: 'returned', label: '已退回' },
    { key: 'completed', label: '已完成' }
  ];

  const getStatusName = (status: HandoverStatus): string => {
    const map = {
      pending: '待确认',
      confirmed: '已确认',
      returned: '已退回',
      completed: '已完成'
    };
    return map[status];
  };

  const getPostName = (post: PostType): string => {
    const map = {
      service: '客服',
      warehouse: '仓储',
      store: '门店'
    };
    return map[post];
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.backBtn} onClick={() => navigateBack()}>
          <Text className={styles.backIcon}>←</Text>
        </View>
        <Text className={styles.headerTitle}>导出交接单</Text>
        <View className={styles.placeholder}></View>
      </View>

      <ScrollView scrollY className={styles.content}>
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>筛选条件</Text>
          
          <View className={styles.filterRow}>
            <Text className={styles.filterLabel}>所属岗位</Text>
            <View className={styles.filterChips}>
              {postOptions.map(opt => (
                <View
                  key={opt.key}
                  className={`${styles.chip} ${postFilter === opt.key ? styles.active : ''}`}
                  onClick={() => setPostFilter(opt.key as PostType | 'all')}
                >
                  <Text>{opt.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.filterRow}>
            <Text className={styles.filterLabel}>交接状态</Text>
            <View className={styles.filterChips}>
              {statusOptions.map(opt => (
                <View
                  key={opt.key}
                  className={`${styles.chip} ${statusFilter === opt.key ? styles.active : ''}`}
                  onClick={() => setStatusFilter(opt.key as HandoverStatus | 'all')}
                >
                  <Text>{opt.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.filterRow}>
            <Text className={styles.filterLabel}>关联班次</Text>
            <Picker
              mode="selector"
              range={['全部班次', ...shifts.map(s => s.name)]}
              value={shiftId ? shifts.findIndex(s => s.id === shiftId) + 1 : 0}
              onChange={(e) => {
                const idx = parseInt(e.detail.value);
                setShiftId(idx === 0 ? '' : shifts[idx - 1].id);
              }}
            >
              <View className={styles.picker}>
                <Text>{shiftId ? shifts.find(s => s.id === shiftId)?.name : '全部班次'}</Text>
              </View>
            </Picker>
          </View>

          <View className={styles.dateRow}>
            <View className={styles.dateItem}>
              <Text className={styles.filterLabel}>开始日期</Text>
              <Picker
                mode="date"
                value={startDate}
                onChange={(e) => setStartDate(e.detail.value)}
              >
                <View className={styles.datePicker}>
                  <Text>{startDate || '请选择'}</Text>
                </View>
              </Picker>
            </View>
            <View className={styles.dateItem}>
              <Text className={styles.filterLabel}>结束日期</Text>
              <Picker
                mode="date"
                value={endDate}
                onChange={(e) => setEndDate(e.detail.value)}
              >
                <View className={styles.datePicker}>
                  <Text>{endDate || '请选择'}</Text>
                </View>
              </Picker>
            </View>
          </View>
        </View>

        <View className={styles.previewSection}>
          <View className={styles.previewHeader}>
            <Text className={styles.previewTitle}>导出预览</Text>
            <Text className={styles.previewCount}>共 {filteredItems.length} 条</Text>
          </View>

          <View className={styles.previewCard}>
            <Text className={styles.previewDocTitle}>交接事项汇总单</Text>
            <Text className={styles.previewDate}>导出时间：{formatFullDate(new Date())}</Text>
            
            <View className={styles.previewStats}>
              <View className={styles.statItem}>
                <Text className={styles.statNum}>{filteredItems.length}</Text>
                <Text className={styles.statLabel}>交接总数</Text>
              </View>
              <View className={styles.statItem}>
                <Text className={styles.statNum}>
                  {filteredItems.filter(i => i.status === 'completed').length}
                </Text>
                <Text className={styles.statLabel}>已完成</Text>
              </View>
              <View className={styles.statItem}>
                <Text className={styles.statNum}>
                  {filteredItems.filter(i => i.status === 'pending' || i.status === 'returned').length}
                </Text>
                <Text className={styles.statLabel}>待处理</Text>
              </View>
            </View>

            <View className={styles.previewList}>
              {filteredItems.slice(0, 5).map((item, idx) => (
                <View key={item.id} className={styles.previewItem}>
                  <Text className={styles.previewIdx}>{idx + 1}.</Text>
                  <View className={styles.previewItemContent}>
                    <Text className={styles.previewItemTitle}>{item.title}</Text>
                    <View className={styles.previewItemMeta}>
                      <Text className={styles.previewMetaText}>
                        {getPostName(item.post)} · {getStatusName(item.status)}
                      </Text>
                      <Text className={styles.previewMetaDate}>
                        {formatFullDate(item.createdAt)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
              {filteredItems.length > 5 && (
                <Text className={styles.previewMore}>
                  还有 {filteredItems.length - 5} 条未显示...
                </Text>
              )}
              {filteredItems.length === 0 && (
                <Text className={styles.previewEmpty}>暂无数据</Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <View className={styles.exportBtn} onClick={handleExport}>
          <Text>{isExporting ? '生成中...' : '导出交接单'}</Text>
        </View>
      </View>
    </View>
  );
};

export default ExportPage;
