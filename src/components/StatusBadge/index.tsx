import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import { HandoverStatus } from '../../types/handover';
import { getStatusName } from '../../data/mockData';

interface StatusBadgeProps {
  status: HandoverStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <View className={`${styles.statusBadge} ${styles[status]}`}>
      <View className={styles.dot} />
      <Text className={styles.statusText}>{getStatusName(status)}</Text>
    </View>
  );
};

export default StatusBadge;
