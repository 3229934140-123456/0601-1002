import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Input, Image, ScrollView, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import useHandoverStore from '../../store/useHandoverStore';
import { PostType, TeamMember } from '../../types/handover';
import { getPostName } from '../../data/mockData';
import { showToast, navigateBack, showModal } from '../../utils';

const CreateShiftPage: React.FC = () => {
  const { members, addShift, shifts } = useHandoverStore();

  const [name, setName] = useState('');
  const [post, setPost] = useState<PostType>('service');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('16:00');
  const [leaderId, setLeaderId] = useState<string>('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const postMembers = useMemo(() => {
    return members.filter(m => m.post === post);
  }, [members, post]);

  useEffect(() => {
    if (postMembers.length > 0 && !leaderId) {
      setLeaderId(postMembers[0].id);
    }
  }, [post, postMembers, leaderId]);

  const handlePostChange = (newPost: PostType) => {
    setPost(newPost);
    setLeaderId('');
    setSelectedMemberIds([]);
  };

  const toggleMember = (memberId: string) => {
    setSelectedMemberIds(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  const handleSelectLeader = (memberId: string) => {
    setLeaderId(memberId);
    if (!selectedMemberIds.includes(memberId)) {
      setSelectedMemberIds(prev => [...prev, memberId]);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      showToast('请输入班次名称');
      return;
    }
    if (!leaderId) {
      showToast('请选择班长');
      return;
    }
    if (selectedMemberIds.length === 0) {
      showToast('请至少选择一名成员');
      return;
    }

    const leader = postMembers.find(m => m.id === leaderId);
    const selectedMembers = postMembers.filter(m => selectedMemberIds.includes(m.id));

    if (!leader || selectedMembers.length === 0) {
      showToast('请完善班次信息');
      return;
    }

    const confirm = await showModal({
      title: '创建班次',
      content: `确认创建「${name}」班次？`,
      confirmText: '创建'
    });

    if (confirm) {
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      addShift({
        name: name.trim(),
        post,
        startTime,
        endTime,
        leader,
        members: selectedMembers,
        date: dateStr
      });

      showToast('创建成功', 'success');
      setTimeout(() => {
        navigateBack();
      }, 1500);
    }
  };

  const postList: PostType[] = ['service', 'warehouse', 'store'];

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.content}>
        <View className={styles.formCard}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>
              <Text className={styles.required}>*</Text>
              所属岗位
            </Text>
            <View className={styles.postGroup}>
              {postList.map(p => (
                <View
                  key={p}
                  className={`${styles.postBtn} ${post === p ? styles.active : ''}`}
                  onClick={() => handlePostChange(p)}
                >
                  <Text>{getPostName(p)}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>
              <Text className={styles.required}>*</Text>
              班次名称
            </Text>
            <Input
              className={styles.formInput}
              placeholder="请输入班次名称，如：早班、中班、白班"
              value={name}
              onInput={(e) => setName(e.detail.value)}
              maxlength={20}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>
              <Text className={styles.required}>*</Text>
              上下班时间
            </Text>
            <View className={styles.timeRow}>
              <View className={styles.timeItem}>
                <Picker
                  mode="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.detail.value)}
                >
                  <View className={styles.timeInput}>
                    <Text>上班：{startTime}</Text>
                  </View>
                </Picker>
              </View>
              <View className={styles.timeItem}>
                <Picker
                  mode="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.detail.value)}
                >
                  <View className={styles.timeInput}>
                    <Text>下班：{endTime}</Text>
                  </View>
                </Picker>
              </View>
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>
              <Text className={styles.required}>*</Text>
              班长
            </Text>
            <Picker
              range={postMembers.map(m => m.name)}
              value={postMembers.findIndex(m => m.id === leaderId)}
              onChange={(e) => {
                const idx = parseInt(e.detail.value);
                if (postMembers[idx]) {
                  handleSelectLeader(postMembers[idx].id);
                }
              }}
            >
              <View className={styles.leaderSelect}>
                <Text style={{ color: leaderId ? '#1D2129' : '#86909C' }}>
                  {postMembers.find(m => m.id === leaderId)?.name || '请选择班长'}
                </Text>
                <Text style={{ color: '#86909C' }}>›</Text>
              </View>
            </Picker>
          </View>
        </View>

        <Text className={styles.sectionTitle}>
          选择班组成员（{selectedMemberIds.length}人）
        </Text>

        <View className={styles.memberList}>
          {postMembers.map(member => (
            <View
              key={member.id}
              className={styles.memberItem}
              onClick={() => toggleMember(member.id)}
            >
              <Image
                className={styles.memberAvatar}
                src={member.avatar}
                mode="aspectFill"
              />
              <View className={styles.memberInfo}>
                <Text className={styles.memberName}>{member.name}</Text>
                <Text className={styles.memberRole}>
                  {member.id === leaderId ? '班长' : '组员'}
                  {member.id === leaderId && ' · 默认包含'}
                </Text>
              </View>
              <View
                className={`${styles.checkbox} ${selectedMemberIds.includes(member.id) ? styles.checked : ''}`}
              >
                {selectedMemberIds.includes(member.id) && <Text>✓</Text>}
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={`${styles.btn} ${styles.outline}`} onClick={() => navigateBack()}>
          <Text>取消</Text>
        </View>
        <View className={`${styles.btn} ${styles.primary}`} onClick={handleSubmit}>
          <Text>创建班次</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default CreateShiftPage;
