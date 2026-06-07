import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import HandoverItemCard from '../../components/HandoverItem';
import EmptyState from '../../components/EmptyState';
import useHandoverStore from '../../store/useHandoverStore';
import { PostType, HandoverStatus, HandoverItem } from '../../types/handover';
import { getPostName } from '../../data/mockData';
import { navigateTo, showToast, showModal } from '../../utils';

const HandoverPage: React.FC = () => {
  const { handoverItems, confirmHandover, completeHandover } = useHandoverStore();

  const [searchText, setSearchText] = useState('');
  const [activePost, setActivePost] = useState<PostType | 'all'>('all');
  const [activeStatus, setActiveStatus] = useState<HandoverStatus | 'all'>('all');
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  usePullDownRefresh(() => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      showToast('刷新成功', 'success');
    }, 1000);
  });

  useDidShow(() => {
    if (batchMode) {
      setSelectedIds([]);
    }
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

  const canBatchConfirm = useMemo(() => {
    return selectedIds.some(id => {
      const item = handoverItems.find(i => i.id === id);
      return item && item.status === 'pending';
    });
  }, [selectedIds, handoverItems]);

  const canBatchComplete = useMemo(() => {
    return selectedIds.some(id => {
      const item = handoverItems.find(i => i.id === id);
      return item && item.status === 'confirmed';
    });
  }, [selectedIds, handoverItems]);

  const selectableItems = useMemo(() => {
    if (activeStatus === 'pending' || activeStatus === 'confirmed') {
      return filteredItems;
    }
    return filteredItems.filter(i => i.status === 'pending' || i.status === 'confirmed');
  }, [filteredItems, activeStatus]);

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

  const handleToggleBatch = () => {
    if (batchMode) {
      setSelectedIds([]);
    }
    setBatchMode(!batchMode);
  };

  const handleToggleSelect = (id: string, item: HandoverItem) => {
    if (item.status !== 'pending' && item.status !== 'confirmed') {
      showToast('该状态不支持批量操作');
      return;
    }
    
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const selectableIds = selectableItems.map(i => i.id);
    if (selectedIds.length === selectableIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(selectableIds);
    }
  };

  const handleBatchConfirm = async () => {
    if (!canBatchConfirm) return;
    
    const confirm = await showModal({
      title: '批量确认',
      content: `确认批量处理 ${selectedIds.filter(id => {
        const item = handoverItems.find(i => i.id === id);
        return item && item.status === 'pending';
      }).length} 条待确认事项？`,
      confirmText: '确认'
    });

    if (confirm) {
      let successCount = 0;
      let failCount = 0;
      
      selectedIds.forEach(id => {
        const item = handoverItems.find(i => i.id === id);
        if (item && item.status === 'pending') {
          confirmHandover(id);
          successCount++;
        } else {
          failCount++;
        }
      });
      
      setSelectedIds([]);
      setBatchMode(false);
      
      if (failCount > 0) {
        showToast(`成功${successCount}条，${failCount}条状态不符`, 'none');
      } else {
        showToast(`已确认${successCount}条`, 'success');
      }
    }
  };

  const handleBatchComplete = async () => {
    if (!canBatchComplete) return;
    
    const confirm = await showModal({
      title: '批量完成',
      content: `确认批量标记 ${selectedIds.filter(id => {
        const item = handoverItems.find(i => i.id === id);
        return item && item.status === 'confirmed';
      }).length} 条事项为已完成？`,
      confirmText: '确认'
    });

    if (confirm) {
      let successCount = 0;
      let failCount = 0;
      
      selectedIds.forEach(id => {
        const item = handoverItems.find(i => i.id === id);
        if (item && item.status === 'confirmed') {
          completeHandover(id);
          successCount++;
        } else {
          failCount++;
        }
      });
      
      setSelectedIds([]);
      setBatchMode(false);
      
      if (failCount > 0) {
        showToast(`成功${successCount}条，${failCount}条状态不符`, 'none');
      } else {
        showToast(`已完成${successCount}条`, 'success');
      }
    }
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
            disabled={batchMode}
          />
        </View>
        <View className={styles.batchBtn} onClick={handleToggleBatch}>
          <Text>{batchMode ? '取消' : '批量'}</Text>
        </View>
      </View>

      <ScrollView scrollX className={styles.postTabs}>
        {postList.map(post => (
          <View
            key={post.key}
            className={`${styles.postTab} ${activePost === post.key ? styles.active : ''}`}
            onClick={() => {
              setActivePost(post.key);
              if (batchMode) setSelectedIds([]);
            }}
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
            onClick={() => {
              setActiveStatus(status.key);
              if (batchMode) setSelectedIds([]);
            }}
          >
            <Text>
              {status.label}
              <Text className={styles.count}>({getStatusCount(status.key)})</Text>
            </Text>
          </View>
        ))}
      </View>

      {batchMode && (
        <View className={styles.batchBar}>
          <View className={styles.batchSelectAll} onClick={handleSelectAll}>
            <View className={`${styles.checkbox} ${selectedIds.length === selectableItems.length && selectableItems.length > 0 ? styles.checked : ''}`}>
              {selectedIds.length === selectableItems.length && selectableItems.length > 0 && (
                <Text className={styles.checkIcon}>✓</Text>
              )}
            </View>
            <Text className={styles.batchSelectText}>
              {selectedIds.length === selectableItems.length && selectableItems.length > 0 ? '取消全选' : '全选'}
            </Text>
          </View>
          <Text className={styles.batchCount}>已选 {selectedIds.length} 项</Text>
        </View>
      )}

      <ScrollView scrollY className={styles.listContent}>
        <View className={styles.listHeader}>
          <Text className={styles.listTitle}>交接列表</Text>
          <Text className={styles.listCount}>共 {filteredItems.length} 条</Text>
        </View>

        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <View key={item.id} className={styles.listItemWrap}>
              {batchMode && (
                <View 
                  className={`${styles.itemCheckbox} ${
                    selectedIds.includes(item.id) ? styles.checked : ''
                  } ${item.status !== 'pending' && item.status !== 'confirmed' ? styles.disabled : ''}`}
                  onClick={() => handleToggleSelect(item.id, item)}
                >
                  {selectedIds.includes(item.id) && (
                    <Text className={styles.checkIcon}>✓</Text>
                  )}
                </View>
              )}
              <View style={{ flex: 1 }}>
                <HandoverItemCard 
                  item={item} 
                  onClick={() => {
                    if (batchMode) {
                      handleToggleSelect(item.id, item);
                    } else {
                      navigateTo(`/pages/item-detail/index?id=${item.id}`);
                    }
                  }}
                />
              </View>
            </View>
          ))
        ) : (
          <EmptyState
            icon="📋"
            title="暂无交接事项"
            description={searchText ? '没有找到匹配的交接内容' : '点击右下角按钮创建第一条交接'}
          />
        )}
      </ScrollView>

      {batchMode && (
        <View className={styles.batchBottomBar}>
          <View 
            className={`${styles.batchActionBtn} ${canBatchConfirm ? styles.primary : ''}`}
            onClick={handleBatchConfirm}
          >
            <Text>批量确认</Text>
          </View>
          <View 
            className={`${styles.batchActionBtn} ${canBatchComplete ? styles.success : ''}`}
            onClick={handleBatchComplete}
          >
            <Text>批量完成</Text>
          </View>
        </View>
      )}

      {!batchMode && (
        <View className={styles.fab} onClick={handleCreate}>
          <Text className={styles.fabIcon}>➕</Text>
        </View>
      )}
    </View>
  );
};

export default HandoverPage;
