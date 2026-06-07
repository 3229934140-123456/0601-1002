import React, { useState, useMemo } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import HandoverItemCard from '../../components/HandoverItem';
import EmptyState from '../../components/EmptyState';
import useHandoverStore from '../../store/useHandoverStore';
import { PostType, HandoverStatus } from '../../types/handover';
import { getPostName } from '../../data/mockData';
import { navigateTo, showToast } from '../../utils';

const HandoverPage: React.FC = () => {
  const { handoverItems } = useHandoverStore();

  const [searchText, setSearchText] = useState('');
  const [activePost, setActivePost] = useState<PostType | 'all'>('all');
  const [activeStatus, setActiveStatus] = useState<HandoverStatus | 'all'>('all');

  usePullDownRefresh(() => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      showToast('刷新成功', 'success');
    }, 1000);
  });

  useDidShow(() => {
    // 页面显示时刷新数据
  });

  const filteredItems = useMemo(() => {
    return handoverItems.filter(item => {
      const matchPost = activePost === 'all' || item.post === activePost;
      const matchStatus = activeStatus === 'all' || item.status === activeStatus;
      const matchSearch = !searchText || 
        item.title.includes(searchText) || 
        item.description.includes(searchText) ||
        (item.customerName && item.customerName.includes(searchText)) ||
        (item.orderNo && item.orderNo.includes(searchText)) ||
        item.tags.some(tag => tag.includes(searchText));
      return matchPost && matchStatus && matchSearch;
    });
  }, [handoverItems, activePost, activeStatus, searchText]);

  const statusList: { key: HandoverStatus | 'all'; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待确认' },
    { key: 'confirmed', label: '已确认' },
    { key: 'returned', label: '已退回' },
    { key: 'completed', label: '已完成' }
  ];

  const postList: { key: PostType | 'all'; label: string }[] = [
    { key: 'all', label: '全部岗位' },
    { key: 'service', label: '客服' },
    { key: 'warehouse', label: '仓储' },
    { key: 'store', label: '门店' }
  ];

  const getStatusCount = (status: HandoverStatus | 'all'): number => {
    if (status === 'all') return handoverItems.length;
    return handoverItems.filter(i => i.status === status).length;
  };

  const handleCreate = () => {
    navigateTo('/pages/create-handover/index');
  };

  return (
    <View className={styles.page}>
      <View className={styles.searchBar}>
        <View className={styles.searchInputWrapper}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索标题、订单号、客户名、标签"
            value={searchText}
            onInput={(e) => setSearchText(e.detail.value)}
            confirmType="search"
          />
        </View>
      </View>

      <ScrollView scrollX className={styles.postTabs}>
        {postList.map(post => (
          <View
            key={post.key}
            className={`${styles.postTab} ${activePost === post.key ? styles.active : ''}`}
            onClick={() => setActivePost(post.key)}
          >
            <Text>{post.label}</Text>
          </View>
        ))}
      </ScrollView>

      <View className={styles.statusTabs}>
        {statusList.map(status => (
          <View
            key={status.key}
            className={`${styles.statusTab} ${activeStatus === status.key ? styles.active : ''}`}
            onClick={() => setActiveStatus(status.key)}
          >
            <Text>
              {status.label}
              <Text className={styles.count}>({getStatusCount(status.key)})</Text>
            </Text>
          </View>
        ))}
      </View>

      <ScrollView scrollY className={styles.listContent}>
        <View className={styles.listHeader}>
          <Text className={styles.listTitle}>交接列表</Text>
          <Text className={styles.listCount}>共 {filteredItems.length} 条</Text>
        </View>

        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <HandoverItemCard key={item.id} item={item} />
          ))
        ) : (
          <EmptyState
            icon="📋"
            title="暂无交接事项"
            description={searchText ? '没有找到匹配的交接内容' : '点击右下角按钮创建第一条交接'}
          />
        )}
      </ScrollView>

      <View className={styles.fab} onClick={handleCreate}>
        <Text className={styles.fabIcon}>➕</Text>
      </View>
    </View>
  );
};

export default HandoverPage;
