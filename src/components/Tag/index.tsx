import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classNames from 'classnames';
import { PriorityLevel, PostType } from '../../types/handover';

interface TagProps {
  text: string;
  type?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'urgent' | 'high' | 'normal' | 'low' | 'service' | 'warehouse' | 'store';
  size?: 'sm' | 'md';
}

const Tag: React.FC<TagProps> = ({ text, type = 'default', size = 'sm' }) => {
  const tagClass = classNames(
    styles.tag,
    styles[type],
    styles[size]
  );

  return (
    <View className={tagClass}>
      <Text className={styles.tagText}>{text}</Text>
    </View>
  );
};

export default Tag;
