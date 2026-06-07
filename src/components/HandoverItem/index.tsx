import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import styles from './index.module.scss';
import { HandoverItem } from '../../types/handover';
import { getPriorityName, getPostName } from '../../data/mockData';
import StatusBadge from '../StatusBadge';
import Tag from '../Tag';
import { getRelativeTime, navigateTo } from '../../utils';

interface HandoverItemCardProps {
  item: HandoverItem;
  onClick?: () => void;
}

const HandoverItemCard: React.FC<HandoverItemCardProps> = ({ item, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigateTo(`/pages/item-detail/index?id=${item.id}`);
    }
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.cardHeader}>
        <View className={styles.headerLeft}>
          <Tag text={getPostName(item.post)} type={item.post} size="sm" />
          <Tag text={getPriorityName(item.priority)} type={item.priority} size="sm" />
        </View>
        <StatusBadge status={item.status} />
      </View>

      <Text className={styles.itemTitle}>{item.title}</Text>
      <Text className={styles.itemDesc}>{item.description}</Text>

      {(item.customerName || item.orderNo) && (
        <View className={styles.infoRow}>
          {item.customerName && (
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>客户：</Text>
              <Text className={styles.infoValue}>{item.customerName}</Text>
            </View>
          )}
          {item.orderNo && (
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>订单：</Text>
              <Text className={styles.infoValue}>{item.orderNo}</Text>
            </View>
          )}
        </View>
      )}

      {item.attachments.length > 0 && (
        <View className={styles.attachments}>
          {item.attachments.slice(0, 3).map((att) => (
            att.type === 'image' ? (
              <Image 
                key={att.id} 
                className={styles.attachImg} 
                src={att.url} 
                mode="aspectFill" 
              />
            ) : (
              <View key={att.id} className={styles.attachVoice}>
                <Text className={styles.voiceIcon}>🎵</Text>
              </View>
            )
          ))}
          {item.attachments.length > 3 && (
            <View className={styles.attachMore}>
              <Text className={styles.attachMoreText}>+{item.attachments.length - 3}</Text>
            </View>
          )}
        </View>
      )}

      {item.tags.length > 0 && (
        <View className={styles.tagsRow}>
          {item.tags.slice(0, 3).map((tag) => (
            <Tag key={tag} text={tag} type="default" size="sm" />
          ))}
        </View>
      )}

      <View className={styles.cardFooter}>
        <View className={styles.assignee}>
          <Image className={styles.assigneeAvatar} src={item.assignee.avatar} mode="aspectFill" />
          <Text className={styles.assigneeName}>接手：{item.assignee.name}</Text>
        </View>
        <Text className={styles.createTime}>{getRelativeTime(item.createdAt)}</Text>
      </View>
    </View>
  );
};

export default HandoverItemCard;
