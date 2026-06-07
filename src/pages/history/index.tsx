import React, { useState, useMemo } from 'react';
import { View, Text, Input, ScrollView, Picker } from '@tarojs/components';
import styles from './index.module.scss';
import HandoverItemCard from '../../components/HandoverItem';
import EmptyState from '../../components/EmptyState';
import useHandoverStore from '../../store/useHandoverStore';
import { PostType } from '../../types/handover';
import { navigateTo, navigateBack, showToast } from '../../utils';

const HistoryPage: React.FC = () => {
  const { handoverItems } = useHandoverStore();

  const [keyword, setKeyword] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [orderNo, setOrderNo] = useState('');
  const [postFilter, setPostFilter] = useState<PostType | 'all'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredItems = useMemo(() => {
    return handoverItems.filter(item => {
      const matchKeyword = !keyword || 
        item.title.includes(keyword) || 
        item.description.includes(keyword) ||
        item.tags.some(tag => tag.includes(keyword));
      
      const matchCustomer = !customerName || 
        (item.customerName && item.customerName.includes(customerName));
      
      const matchOrder = !orderNo || 
        (item.orderNo && item.orderNo.includes(orderNo));
      
      const matchPost = postFilter === 'all' || item.post === postFilter;

      const itemDate = new Date(item.createdAt).toDateString();
      const matchDate = 
        (!startDate || new Date(item.createdAt) >= new Date(startDate)) &&
        (!endDate || new Date(item.createdAt) <= new Date(endDate + ' 23:59:59'));

      return matchKeyword && matchCustomer && matchOrder && matchPost && matchDate;
    });
  }, [handoverItems, keyword, customerName, orderNo, postFilter, startDate, endDate]);

  const handleReset = () => {
    setKeyword('');
    setCustomerName('');
    setOrderNo('');
    setPostFilter('all');
    setStartDate('');
    setEndDate('');
    showToast('已重置筛选');
  };

  const handleExport = () => {
    navigateTo('/pages/export/index');
  };

  const postOptions = [
    { key: 'all', label: '全部岗位' },
    { key: 'service', label: '客服' },
    { key: 'warehouse', label: '仓储' },
    { key: 'store', label: '门店' }
  ];

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.backBtn} onClick={() => navigateBack()}>
          <Text className={styles.backIcon}>←</Text>
        </View>
        <Text className={styles.headerTitle}>历史交接记录</Text>
        <View className={styles.exportBtn} onClick={handleExport}>
          <Text>导出</Text>
        </View>
      </View>

      <View className={styles.searchSection}>
        <View className={styles.searchBox}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索标题、描述、标签"
            value={keyword}
            onInput={(e) => setKeyword(e.detail.value)}
            confirmType="search"
          />
        </View>
        <View 
          className={`${styles.filterBtn} ${showFilters ? styles.active : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Text className={styles.filterIcon}>⚙️</Text>
          <Text className={styles.filterText}>筛选</Text>
        </View>
      </View>

      {showFilters && (
        <View className={styles.filterPanel}>
          <View className={styles.filterRow}>
            <Text className={styles.filterLabel}>客户名称</Text>
            <Input
              className={styles.filterInput}
              placeholder="请输入客户名称"
              value={customerName}
              onInput={(e) => setCustomerName(e.detail.value)}
            />
          </View>
          <View className={styles.filterRow}>
            <Text className={styles.filterLabel}>订单编号</Text>
            <Input
              className={styles.filterInput}
              placeholder="请输入订单编号"
              value={orderNo}
              onInput={(e) => setOrderNo(e.detail.value)}
            />
          </View>
          <View className={styles.filterRow}>
            <Text className={styles.filterLabel}>所属岗位</Text>
            <View className={styles.filterSelect}>
              {postOptions.map(opt => (
                <View
                  key={opt.key}
                  className={`${styles.postTag} ${postFilter === opt.key ? styles.active : ''}`}
                  onClick={() => setPostFilter(opt.key as PostType | 'all')}
                >
                  <Text>{opt.label}</Text>
                </View>
              ))}
            </View>
          </View>
          <View className={styles.filterRow}>
            <Text className={styles.filterLabel}>开始日期</Text>
            <Picker
              mode="date"
              value={startDate}
              onChange={(e) => setStartDate(e.detail.value)}
            >
              <View className={styles.datePicker}>
                <Text>{startDate || '选择开始日期'}</Text>
              </View>
            </Picker>
          </View>
          <View className={styles.filterRow}>
            <Text className={styles.filterLabel}>结束日期</Text>
            <Picker
              mode="date"
              value={endDate}
              onChange={(e) => setEndDate(e.detail.value)}
            >
              <View className={styles.datePicker}>
                <Text>{endDate || '选择结束日期'}</Text>
              </View>
            </Picker>
          </View>
          <View className={styles.filterActions}>
            <View className={styles.resetBtn} onClick={handleReset}>
              <Text>重置</Text>
            </View>
          </View>
        </View>
      )}

      <View className={styles.resultHeader}>
        <Text className={styles.resultCount}>找到 {filteredItems.length} 条记录</Text>
      </View>

      <ScrollView scrollY className={styles.listContent}>
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <HandoverItemCard key={item.id} item={item} />
          ))
        ) : (
          <EmptyState
            icon="📭"
            title="暂无记录"
            description="没有找到符合条件的交接记录"
          />
        )}
      </ScrollView>
    </View>
  );
};

export default HistoryPage;
