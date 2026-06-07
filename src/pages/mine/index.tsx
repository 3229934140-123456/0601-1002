import React from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import styles from './index.module.scss';
import { mockMembers } from '../../data/mockData';
import { getPostName } from '../../data/mockData';
import { showToast, showModal, navigateTo } from '../../utils';

const MinePage: React.FC = () => {
  const currentUser = mockMembers[0];

  const menuGroups = [
    [
      { icon: '📋', title: '历史交接记录', desc: '查看我参与的所有交接', type: 'blue', action: () => showToast('历史记录开发中') },
      { icon: '📤', title: '导出交接单', desc: '按时间范围导出PDF/Excel', type: 'green', action: () => showToast('导出功能开发中') },
      { icon: '🏷️', title: '标签管理', desc: '管理自定义问题标签', type: 'orange', action: () => showToast('标签管理开发中') },
    ],
    [
      { icon: '🔔', title: '消息通知设置', desc: '超时提醒、确认提醒等', type: 'purple', action: () => showToast('通知设置开发中') },
      { icon: '👥', title: '团队成员', desc: '查看团队成员列表', type: 'blue', action: () => showToast('成员列表开发中') },
      { icon: '❓', title: '帮助与反馈', desc: '使用帮助、意见反馈', type: 'gray', action: () => showToast('帮助中心开发中') },
      { icon: 'ℹ️', title: '关于我们', desc: '版本 v1.0.0', type: 'gray', action: () => showToast('团队交接班 v1.0.0') },
    ]
  ];

  const handleLogout = async () => {
    const confirm = await showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      confirmText: '退出'
    });
    if (confirm) {
      showToast('已退出登录', 'success');
    }
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <View className={styles.userInfo}>
          <Image className={styles.avatar} src={currentUser.avatar} mode="aspectFill" />
          <View className={styles.userDetail}>
            <Text className={styles.userName}>{currentUser.name}</Text>
            <Text className={styles.userPost}>{getPostName(currentUser.post)}组</Text>
          </View>
        </View>

        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>28</Text>
            <Text className={styles.statLabel}>发起交接</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>35</Text>
            <Text className={styles.statLabel}>确认交接</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>92%</Text>
            <Text className={styles.statLabel}>完成率</Text>
          </View>
        </View>
      </View>

      {menuGroups.map((group, gIndex) => (
        <React.Fragment key={gIndex}>
          {gIndex > 0 && <View className={styles.sectionGap} />}
          <View className={styles.menuList}>
            {group.map((item, index) => (
              <View
                key={index}
                className={styles.menuItem}
                onClick={item.action}
              >
                <View className={`${styles.menuIcon} ${styles[item.type]}`}>
                  <Text>{item.icon}</Text>
                </View>
                <View className={styles.menuContent}>
                  <Text className={styles.menuTitle}>{item.title}</Text>
                  <Text className={styles.menuDesc}>{item.desc}</Text>
                </View>
                <Text className={styles.menuArrow}>›</Text>
              </View>
            ))}
          </View>
        </React.Fragment>
      ))}

      <View className={styles.logoutBtn} onClick={handleLogout}>
        <Text>退出登录</Text>
      </View>
    </ScrollView>
  );
};

export default MinePage;
