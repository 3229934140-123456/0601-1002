import React, { useState } from 'react';
import { View, Text, Input, Textarea, Image, ScrollView } from '@tarojs/components';
import styles from './index.module.scss';
import { mockMembers, mockTemplates, getPriorityName, getPostName } from '../../data/mockData';
import { PostType, PriorityLevel, TeamMember } from '../../types/handover';
import { showToast, showModal, navigateBack } from '../../utils';

const CreateHandoverPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('normal');
  const [post, setPost] = useState<PostType>('service');
  const [assignee, setAssignee] = useState<TeamMember | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [orderNo, setOrderNo] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const priorityList: PriorityLevel[] = ['urgent', 'high', 'normal', 'low'];
  const postList: PostType[] = ['service', 'warehouse', 'store'];
  const availableMembers = mockMembers.filter(m => m.post === post);

  const handlePostChange = (newPost: PostType) => {
    setPost(newPost);
    setAssignee(null);
    setSelectedTemplate('');
  };

  const handleTemplateSelect = () => {
    const templates = mockTemplates.filter(t => t.post === post);
    if (templates.length === 0) {
      showToast('当前岗位暂无模板');
      return;
    }
    const templateNames = templates.map(t => t.name);
    showToast('选择模板功能开发中');
  };

  const handleAssigneeSelect = (member: TeamMember) => {
    setAssignee(member);
  };

  const handleAddTag = () => {
    showToast('添加标签功能开发中');
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleUploadImage = () => {
    showToast('上传图片功能开发中');
  };

  const handleUploadVoice = () => {
    showToast('录制语音功能开发中');
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      showToast('请输入交接标题');
      return;
    }
    if (!description.trim()) {
      showToast('请输入交接描述');
      return;
    }
    if (!assignee) {
      showToast('请选择接手人');
      return;
    }

    const confirm = await showModal({
      title: '提交交接',
      content: '确认提交该交接事项？提交后将通知接手人。',
      confirmText: '提交'
    });

    if (confirm) {
      showToast('提交成功', 'success');
      setTimeout(() => {
        navigateBack();
      }, 1500);
    }
  };

  const handleSaveDraft = () => {
    showToast('已保存草稿', 'success');
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.content}>
        <View className={styles.formCard}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>
              <Text className={styles.required}>*</Text>
              交接标题
            </Text>
            <Input
              className={styles.formInput}
              placeholder="请输入交接事项标题"
              value={title}
              onInput={(e) => setTitle(e.detail.value)}
              maxlength={50}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>
              <Text className={styles.required}>*</Text>
              详细描述
            </Text>
            <Textarea
              className={styles.formTextarea}
              placeholder="请详细描述交接内容，包括背景、需要处理的事项、注意事项等"
              value={description}
              onInput={(e) => setDescription(e.detail.value)}
              maxlength={500}
              autoHeight
            />
          </View>
        </View>

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
              紧急程度
            </Text>
            <View className={styles.priorityGroup}>
              {priorityList.map(p => (
                <View
                  key={p}
                  className={`${styles.priorityBtn} ${styles[p]} ${priority === p ? styles.active : ''}`}
                  onClick={() => setPriority(p)}
                >
                  <Text>{getPriorityName(p)}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className={styles.formCard}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>使用模板</Text>
            <View className={styles.templateSelect} onClick={handleTemplateSelect}>
              <Text style={{ color: selectedTemplate ? '#1D2129' : '#86909C' }}>
                {selectedTemplate || '选择模板快速填充'}
              </Text>
              <Text style={{ color: '#86909C' }}>›</Text>
            </View>
          </View>
        </View>

        <View className={styles.formCard}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>
              <Text className={styles.required}>*</Text>
              指定接手人
            </Text>
            <View className={styles.assigneeSelector}>
              {availableMembers.map(member => (
                <View
                  key={member.id}
                  className={`${styles.assigneeItem} ${assignee?.id === member.id ? styles.active : ''}`}
                  onClick={() => handleAssigneeSelect(member)}
                >
                  <Image className={styles.avatar} src={member.avatar} mode="aspectFill" />
                  <Text className={styles.name}>{member.name}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className={styles.formCard}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>关联信息（选填）</Text>
            <Input
              className={styles.formInput}
              placeholder="客户名称"
              value={customerName}
              onInput={(e) => setCustomerName(e.detail.value)}
              style={{ marginBottom: 16 }}
            />
            <Input
              className={styles.formInput}
              placeholder="订单编号"
              value={orderNo}
              onInput={(e) => setOrderNo(e.detail.value)}
            />
          </View>
        </View>

        <View className={styles.formCard}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>附件上传</Text>
            <View className={styles.uploadSection}>
              <View className={styles.uploadItem} onClick={handleUploadImage}>
                <Text className={styles.icon}>🖼️</Text>
                <Text className={styles.text}>添加图片</Text>
              </View>
              <View className={styles.uploadItem} onClick={handleUploadVoice}>
                <Text className={styles.icon}>🎤</Text>
                <Text className={styles.text}>录制语音</Text>
              </View>
            </View>
          </View>
        </View>

        <View className={styles.formCard}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>问题标签</Text>
            <View className={styles.tagInputWrap}>
              {tags.map(tag => (
                <View key={tag} className={styles.tagItem}>
                  <Text>{tag}</Text>
                  <Text className={styles.close} onClick={() => handleRemoveTag(tag)}>×</Text>
                </View>
              ))}
              <View className={styles.tagAdd} onClick={handleAddTag}>
                <Text>+ 添加标签</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={`${styles.btn} ${styles.outline}`} onClick={handleSaveDraft}>
          <Text>保存草稿</Text>
        </View>
        <View className={`${styles.btn} ${styles.primary}`} onClick={handleSubmit}>
          <Text>提交交接</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default CreateHandoverPage;
