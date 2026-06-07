import React, { useState, useMemo } from 'react';
import { View, Text, Input, Textarea, Image, ScrollView, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import Tag from '../../components/Tag';
import useHandoverStore from '../../store/useHandoverStore';
import { PostType, PriorityLevel, TeamMember, Attachment } from '../../types/handover';
import { getPriorityName, getPostName } from '../../data/mockData';
import { showToast, showModal, navigateBack } from '../../utils';

const CreateHandoverPage: React.FC = () => {
  const { members, templates, shifts, addHandoverItem } = useHandoverStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('normal');
  const [post, setPost] = useState<PostType>('service');
  const [assignee, setAssignee] = useState<TeamMember | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [orderNo, setOrderNo] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [shiftId, setShiftId] = useState<string>('');
  const [deadline, setDeadline] = useState('');

  const availableMembers = useMemo(() => {
    return members.filter(m => m.post === post);
  }, [members, post]);

  const postTemplates = useMemo(() => {
    return templates.filter(t => t.post === post);
  }, [templates, post]);

  const postShifts = useMemo(() => {
    return shifts.filter(s => s.post === post);
  }, [shifts, post]);

  const handlePostChange = (newPost: PostType) => {
    setPost(newPost);
    setAssignee(null);
    setSelectedTemplate('');
    setShiftId('');
  };

  const handleTemplateSelect = (e) => {
    const idx = parseInt(e.detail.value);
    if (idx < 0 || idx >= postTemplates.length) return;
    
    const template = postTemplates[idx];
    setSelectedTemplate(template.id);
    
    if (template.items.length > 0) {
      const firstItem = template.items[0];
      setTitle(firstItem.title);
      setDescription(firstItem.description);
      setPriority(firstItem.priority);
    }
    
    showToast('模板已应用', 'success');
  };

  const handleAddImage = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 9 - attachments.filter(a => a.type === 'image').length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      });
      
      const newAttachments: Attachment[] = res.tempFiles.map((file, index) => ({
        id: `img_${Date.now()}_${index}`,
        type: 'image' as const,
        url: file.path,
        name: `图片${attachments.length + index + 1}.jpg`,
        size: file.size
      }));
      
      setAttachments(prev => [...prev, ...newAttachments]);
      showToast(`已添加${newAttachments.length}张图片`, 'success');
    } catch (err) {
      console.error('[CreateHandover] 选择图片失败', err);
    }
  };

  const handleAddVoice = () => {
    showToast('语音录制功能演示中');
    const mockVoice: Attachment = {
      id: `voice_${Date.now()}`,
      type: 'voice',
      url: '',
      name: `语音记录${attachments.filter(a => a.type === 'voice').length + 1}.mp3`,
      duration: 30 + Math.floor(Math.random() * 60),
      size: Math.floor(Math.random() * 500 + 100) * 1024
    };
    setAttachments(prev => [...prev, mockVoice]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleAddTag = async () => {
    try {
      const res = await Taro.showModal({
        title: '添加标签',
        editable: true,
        placeholderText: '请输入标签名称',
        confirmText: '添加'
      });
      
      if (res.confirm && res.content && res.content.trim()) {
        const newTag = res.content.trim();
        if (tags.includes(newTag)) {
          showToast('标签已存在');
          return;
        }
        if (tags.length >= 10) {
          showToast('最多添加10个标签');
          return;
        }
        setTags(prev => [...prev, newTag]);
      }
    } catch (err) {
      console.error('[CreateHandover] 添加标签失败', err);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
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
      const currentShift = shifts.find(s => s.post === post && s.status === 'ongoing') 
        || postShifts[0];

      addHandoverItem({
        title: title.trim(),
        description: description.trim(),
        priority,
        post,
        creator: members[0],
        assignee,
        customerName: customerName.trim() || undefined,
        orderNo: orderNo.trim() || undefined,
        attachments,
        tags,
        shiftId: currentShift?.id || '',
        deadline: deadline || undefined
      });

      showToast('提交成功', 'success');
      setTimeout(() => {
        navigateBack();
      }, 1500);
    }
  };

  const handleSaveDraft = () => {
    showToast('草稿已保存', 'success');
  };

  const priorityList: PriorityLevel[] = ['urgent', 'high', 'normal', 'low'];
  const postList: PostType[] = ['service', 'warehouse', 'store'];

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
            {postTemplates.length > 0 ? (
              <Picker
                range={postTemplates.map(t => t.name)}
                value={postTemplates.findIndex(t => t.id === selectedTemplate)}
                onChange={handleTemplateSelect}
              >
                <View className={styles.templateSelect}>
                  <Text style={{ color: selectedTemplate ? '#1D2129' : '#86909C' }}>
                    {postTemplates.find(t => t.id === selectedTemplate)?.name || '选择模板快速填充'}
                  </Text>
                  <Text style={{ color: '#86909C' }}>›</Text>
                </View>
              </Picker>
            ) : (
              <View className={styles.templateSelect}>
                <Text style={{ color: '#86909C' }}>当前岗位暂无模板</Text>
              </View>
            )}
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
                  onClick={() => setAssignee(member)}
                >
                  <Image className={styles.avatar} src={member.avatar} mode="aspectFill" />
                  <Text className={styles.name}>{member.name}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>所属班次</Text>
            {postShifts.length > 0 ? (
              <Picker
                range={postShifts.map(s => s.name)}
                value={postShifts.findIndex(s => s.id === shiftId)}
                onChange={(e) => {
                  const idx = parseInt(e.detail.value);
                  if (postShifts[idx]) {
                    setShiftId(postShifts[idx].id);
                  }
                }}
              >
                <View className={styles.templateSelect}>
                  <Text style={{ color: shiftId ? '#1D2129' : '#86909C' }}>
                    {postShifts.find(s => s.id === shiftId)?.name || '选择班次（选填）'}
                  </Text>
                  <Text style={{ color: '#86909C' }}>›</Text>
                </View>
              </Picker>
            ) : (
              <View className={styles.templateSelect}>
                <Text style={{ color: '#86909C' }}>暂无班次</Text>
              </View>
            )}
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

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>截止时间（选填）</Text>
            <Picker
              mode="date"
              value={deadline}
              onChange={(e) => setDeadline(e.detail.value)}
            >
              <View className={styles.templateSelect}>
                <Text style={{ color: deadline ? '#1D2129' : '#86909C' }}>
                  {deadline || '设置截止时间'}
                </Text>
                <Text style={{ color: '#86909C' }}>›</Text>
              </View>
            </Picker>
          </View>
        </View>

        <View className={styles.formCard}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>
              附件上传
              <Text style={{ fontSize: 22, color: '#86909C', fontWeight: 400, marginLeft: 8 }}>
                （{attachments.length}/9）
              </Text>
            </Text>
            <View className={styles.uploadSection}>
              {attachments.map(att => (
                <View key={att.id} className={styles.uploadItem}>
                  {att.type === 'image' ? (
                    <Image 
                      className={styles.uploadImage} 
                      src={att.url} 
                      mode="aspectFill" 
                    />
                  ) : (
                    <View className={styles.uploadVoice}>
                      <Text className={styles.voiceIcon}>🎵</Text>
                    </View>
                  )}
                  <View 
                    className={styles.deleteBtn}
                    onClick={() => handleRemoveAttachment(att.id)}
                  >
                    <Text>×</Text>
                  </View>
                </View>
              ))}
              {attachments.length < 9 && (
                <>
                  <View className={styles.uploadAddBtn} onClick={handleAddImage}>
                    <Text className={styles.uploadIcon}>🖼️</Text>
                    <Text className={styles.uploadText}>添加图片</Text>
                  </View>
                  <View className={styles.uploadAddBtn} onClick={handleAddVoice}>
                    <Text className={styles.uploadIcon}>🎤</Text>
                    <Text className={styles.uploadText}>录制语音</Text>
                  </View>
                </>
              )}
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
              {tags.length < 10 && (
                <View className={styles.tagAdd} onClick={handleAddTag}>
                  <Text>+ 添加标签</Text>
                </View>
              )}
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
