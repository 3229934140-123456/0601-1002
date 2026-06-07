import Taro from '@tarojs/taro';

export const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}`;
};

export const formatFullDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
};

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
};

export const showToast = (title: string, icon: 'success' | 'error' | 'none' = 'none'): void => {
  Taro.showToast({
    title,
    icon,
    duration: 2000
  });
};

export const showLoading = (title: string = '加载中...'): void => {
  Taro.showLoading({
    title,
    mask: true
  });
};

export const hideLoading = (): void => {
  Taro.hideLoading();
};

export const showModal = (options: {
  title: string;
  content: string;
  showCancel?: boolean;
  confirmText?: string;
  cancelText?: string;
}): Promise<boolean> => {
  return new Promise((resolve) => {
    Taro.showModal({
      title: options.title,
      content: options.content,
      showCancel: options.showCancel ?? true,
      confirmText: options.confirmText || '确定',
      cancelText: options.cancelText || '取消',
      success: (res) => {
        resolve(res.confirm);
      },
      fail: () => {
        resolve(false);
      }
    });
  });
};

export const navigateTo = (url: string): void => {
  Taro.navigateTo({ url });
};

export const navigateBack = (delta: number = 1): void => {
  Taro.navigateBack({ delta });
};

export const switchTab = (url: string): void => {
  Taro.switchTab({ url });
};

export const getRelativeTime = (dateStr: string): string => {
  const now = new Date().getTime();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  if (diff < 86400000 * 7) return `${Math.floor(diff / 86400000)}天前`;
  
  return formatDate(dateStr);
};

export const isOverdue = (deadline?: string): boolean => {
  if (!deadline) return false;
  return new Date(deadline).getTime() < new Date().getTime();
};

export const getRemainingTime = (deadline?: string): string => {
  if (!deadline) return '';
  const now = new Date().getTime();
  const deadlineTime = new Date(deadline).getTime();
  const diff = deadlineTime - now;
  
  if (diff <= 0) return '已超时';
  
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}天${hours % 24}小时`;
  if (hours > 0) return `${hours}小时${minutes}分钟`;
  return `${minutes}分钟`;
};
