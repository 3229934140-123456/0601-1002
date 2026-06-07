import {
  TeamMember,
  HandoverItem,
  Shift,
  ReminderItem,
  StatsData,
  HandoverTemplate,
  PostType,
  PriorityLevel,
  HandoverStatus
} from '../types/handover';

const members: TeamMember[] = [
  { id: 'm1', name: '张小明', avatar: 'https://picsum.photos/id/64/200/200', post: 'service', phone: '138****1234' },
  { id: 'm2', name: '李华', avatar: 'https://picsum.photos/id/91/200/200', post: 'service', phone: '138****5678' },
  { id: 'm3', name: '王芳', avatar: 'https://picsum.photos/id/338/200/200', post: 'service', phone: '139****9012' },
  { id: 'm4', name: '赵强', avatar: 'https://picsum.photos/id/177/200/200', post: 'warehouse', phone: '137****3456' },
  { id: 'm5', name: '陈伟', avatar: 'https://picsum.photos/id/1027/200/200', post: 'warehouse', phone: '136****7890' },
  { id: 'm6', name: '刘洋', avatar: 'https://picsum.photos/id/237/200/200', post: 'warehouse', phone: '135****2345' },
  { id: 'm7', name: '周婷', avatar: 'https://picsum.photos/id/659/200/200', post: 'store', phone: '134****6789' },
  { id: 'm8', name: '吴磊', avatar: 'https://picsum.photos/id/718/200/200', post: 'store', phone: '133****0123' },
  { id: 'm9', name: '孙丽', avatar: 'https://picsum.photos/id/783/200/200', post: 'store', phone: '132****4567' },
];

export const mockMembers: TeamMember[] = members;

export const mockShifts: Shift[] = [
  {
    id: 's1',
    name: '早班',
    post: 'service',
    startTime: '08:00',
    endTime: '16:00',
    status: 'ongoing',
    leader: members[0],
    members: [members[0], members[1], members[2]],
    handoverCount: 12,
    completedCount: 8,
    date: '2026-06-08'
  },
  {
    id: 's2',
    name: '中班',
    post: 'service',
    startTime: '14:00',
    endTime: '22:00',
    status: 'upcoming',
    leader: members[1],
    members: [members[1], members[2]],
    handoverCount: 8,
    completedCount: 0,
    date: '2026-06-08'
  },
  {
    id: 's3',
    name: '白班',
    post: 'warehouse',
    startTime: '09:00',
    endTime: '18:00',
    status: 'ongoing',
    leader: members[3],
    members: [members[3], members[4], members[5]],
    handoverCount: 15,
    completedCount: 10,
    date: '2026-06-08'
  },
  {
    id: 's4',
    name: '营业班',
    post: 'store',
    startTime: '10:00',
    endTime: '20:00',
    status: 'ongoing',
    leader: members[6],
    members: [members[6], members[7], members[8]],
    handoverCount: 10,
    completedCount: 6,
    date: '2026-06-08'
  }
];

export const mockHandoverItems: HandoverItem[] = [
  {
    id: 'h1',
    title: '客户投诉处理-订单退款',
    description: '客户王女士反馈订单OD20260608001商品破损，需要紧急退款处理，已与客户沟通同意退款，待财务确认。',
    priority: 'urgent',
    status: 'pending',
    post: 'service',
    creator: members[0],
    assignee: members[1],
    customerName: '王女士',
    orderNo: 'OD20260608001',
    attachments: [
      { id: 'a1', type: 'image', url: 'https://picsum.photos/id/1/300/300', name: '破损照片1.jpg', size: 1024000 },
      { id: 'a2', type: 'image', url: 'https://picsum.photos/id/2/300/300', name: '破损照片2.jpg', size: 856000 },
      { id: 'a3', type: 'voice', url: '', name: '客户语音说明.mp3', duration: 45, size: 520000 }
    ],
    tags: ['客户投诉', '退款', '紧急'],
    createdAt: '2026-06-08 09:30:00',
    deadline: '2026-06-08 12:00:00',
    shiftId: 's1'
  },
  {
    id: 'h2',
    title: '新到货品入库- SKU核对',
    description: '今日到货一批新品，共5个SKU，需要核对数量并录入系统，预计2小时完成。',
    priority: 'high',
    status: 'pending',
    post: 'warehouse',
    creator: members[3],
    assignee: members[4],
    attachments: [
      { id: 'a4', type: 'image', url: 'https://picsum.photos/id/3/300/300', name: '到货清单.jpg', size: 768000 }
    ],
    tags: ['入库', '新品', '盘点'],
    createdAt: '2026-06-08 10:15:00',
    deadline: '2026-06-08 15:00:00',
    shiftId: 's3'
  },
  {
    id: 'h3',
    title: 'VIP客户到店预约接待',
    description: 'VIP客户张先生今天下午3点到店选购新品，已提前沟通需求，准备好展示样品。',
    priority: 'high',
    status: 'confirmed',
    post: 'store',
    creator: members[6],
    assignee: members[7],
    customerName: '张先生',
    attachments: [],
    tags: ['VIP客户', '新品推荐', '预约'],
    createdAt: '2026-06-08 09:00:00',
    confirmedAt: '2026-06-08 09:45:00',
    shiftId: 's4'
  },
  {
    id: 'h4',
    title: '月度盘点准备工作',
    description: '本月底进行库存盘点，需要提前准备盘点表，核对系统库存与实际库存差异。',
    priority: 'normal',
    status: 'confirmed',
    post: 'warehouse',
    creator: members[3],
    assignee: members[5],
    attachments: [],
    tags: ['盘点', '月度'],
    createdAt: '2026-06-07 16:00:00',
    confirmedAt: '2026-06-07 17:30:00',
    shiftId: 's3'
  },
  {
    id: 'h5',
    title: '快递单号更新反馈',
    description: '订单OD20260607089的快递单号需更新，客户反映查不到物流信息，请联系快递确认。',
    priority: 'normal',
    status: 'returned',
    post: 'service',
    creator: members[1],
    assignee: members[0],
    orderNo: 'OD20260607089',
    attachments: [],
    tags: ['物流', '快递'],
    createdAt: '2026-06-07 14:20:00',
    returnedAt: '2026-06-07 16:00:00',
    returnedReason: '快递单号有误，请核实后重新提交',
    shiftId: 's2'
  },
  {
    id: 'h6',
    title: '清洁用品补货申请',
    description: '门店清洁用品库存不足，需要申请补货：清洁剂5瓶，拖把3把，抹布10条。',
    priority: 'low',
    status: 'completed',
    post: 'store',
    creator: members[8],
    assignee: members[6],
    attachments: [],
    tags: ['补货', '日常'],
    createdAt: '2026-06-06 11:00:00',
    confirmedAt: '2026-06-06 14:00:00',
    shiftId: 's4'
  },
  {
    id: 'h7',
    title: '退换货商品整理',
    description: '今日收到3件退换货商品，需要检查商品状态，登记退换货原因并重新上架或退回仓库。',
    priority: 'normal',
    status: 'pending',
    post: 'store',
    creator: members[7],
    assignee: members[8],
    attachments: [
      { id: 'a5', type: 'image', url: 'https://picsum.photos/id/9/300/300', name: '退换货1.jpg', size: 456000 }
    ],
    tags: ['退换货', '库存'],
    createdAt: '2026-06-08 11:30:00',
    shiftId: 's4'
  },
  {
    id: 'h8',
    title: '客服话术培训资料更新',
    description: '新的客服话术手册已发布，请下载学习并组织小组讨论，本周完成考核。',
    priority: 'low',
    status: 'completed',
    post: 'service',
    creator: members[2],
    assignee: members[0],
    attachments: [],
    tags: ['培训', '话术'],
    createdAt: '2026-06-05 09:00:00',
    confirmedAt: '2026-06-06 17:00:00',
    shiftId: 's1'
  },
  {
    id: 'h9',
    title: '促销活动备货通知',
    description: '下周有618促销活动，需要提前备货热门商品200件，确保活动期间库存充足。',
    priority: 'high',
    status: 'pending',
    post: 'warehouse',
    creator: members[4],
    assignee: members[3],
    attachments: [
      { id: 'a6', type: 'image', url: 'https://picsum.photos/id/119/300/300', name: '备货清单.png', size: 987000 }
    ],
    tags: ['促销', '备货', '618'],
    createdAt: '2026-06-08 08:30:00',
    deadline: '2026-06-10 18:00:00',
    shiftId: 's3'
  },
  {
    id: 'h10',
    title: '会员积分兑换处理',
    description: '会员李先生申请积分兑换礼品，总积分5000分，请核实并安排发货。',
    priority: 'normal',
    status: 'confirmed',
    post: 'service',
    creator: members[0],
    assignee: members[2],
    customerName: '李先生',
    attachments: [],
    tags: ['会员', '积分兑换'],
    createdAt: '2026-06-08 10:45:00',
    confirmedAt: '2026-06-08 11:20:00',
    shiftId: 's1'
  },
  {
    id: 'h11',
    title: '设备故障报修-扫码枪',
    description: '仓库2号扫码枪出现故障，无法正常扫描条码，已联系维修人员，明日上门维修。',
    priority: 'urgent',
    status: 'returned',
    post: 'warehouse',
    creator: members[5],
    assignee: members[3],
    attachments: [],
    tags: ['设备', '维修', '故障'],
    createdAt: '2026-06-08 07:50:00',
    returnedAt: '2026-06-08 09:00:00',
    returnedReason: '请补充设备编号和具体故障描述',
    shiftId: 's3'
  },
  {
    id: 'h12',
    title: '新品陈列调整',
    description: '本周新品到店，需要调整陈列位置，按类别整理展示区，提升视觉效果。',
    priority: 'normal',
    status: 'pending',
    post: 'store',
    creator: members[6],
    assignee: members[7],
    attachments: [
      { id: 'a7', type: 'image', url: 'https://picsum.photos/id/201/300/300', name: '陈列参考.jpg', size: 1234000 }
    ],
    tags: ['陈列', '新品'],
    createdAt: '2026-06-08 10:00:00',
    shiftId: 's4'
  }
];

export const mockReminders: ReminderItem[] = [
  {
    id: 'r1',
    type: 'timeout',
    title: '交接事项已超时',
    content: '客户投诉处理-订单退款 已超时30分钟，请尽快处理',
    itemId: 'h1',
    createdAt: '2026-06-08 12:30:00',
    read: false
  },
  {
    id: 'r2',
    type: 'timeout',
    title: '交接事项即将超时',
    content: '促销活动备货通知 还有2天截止，请注意跟进',
    itemId: 'h9',
    createdAt: '2026-06-08 11:00:00',
    read: false
  },
  {
    id: 'r3',
    type: 'pending',
    title: '新的交接待确认',
    content: '你有3条新的交接事项待确认',
    itemId: 'h2',
    createdAt: '2026-06-08 10:20:00',
    read: true
  },
  {
    id: 'r4',
    type: 'returned',
    title: '交接被退回',
    content: '设备故障报修-扫码枪 被退回，请补充信息后重新提交',
    itemId: 'h11',
    createdAt: '2026-06-08 09:00:00',
    read: true
  },
  {
    id: 'r5',
    type: 'system',
    title: '班次即将切换',
    content: '中班将于14:00开始，请提前做好交接班准备',
    itemId: '',
    createdAt: '2026-06-08 13:30:00',
    read: false
  }
];

export const mockStats: StatsData = {
  totalHandovers: 156,
  completedRate: 89.2,
  onTimeRate: 92.5,
  avgHandleTime: 45,
  postStats: [
    { post: 'service', count: 68, completedRate: 91.2 },
    { post: 'warehouse', count: 52, completedRate: 86.5 },
    { post: 'store', count: 36, completedRate: 88.9 }
  ],
  topTags: [
    { tag: '客户投诉', count: 28 },
    { tag: '入库', count: 22 },
    { tag: '库存', count: 18 },
    { tag: '会员', count: 15 },
    { tag: '促销', count: 12 },
    { tag: '培训', count: 10 },
    { tag: '退换货', count: 9 },
    { tag: '设备', count: 7 }
  ],
  dailyTrend: [
    { date: '06-02', count: 18 },
    { date: '06-03', count: 22 },
    { date: '06-04', count: 25 },
    { date: '06-05', count: 20 },
    { date: '06-06', count: 28 },
    { date: '06-07', count: 32 },
    { date: '06-08', count: 11 }
  ]
};

export const mockTemplates: HandoverTemplate[] = [
  {
    id: 't1',
    name: '客服白班交接模板',
    post: 'service',
    items: [
      { title: '未处理客户投诉', description: '整理当前未处理的客户投诉清单', priority: 'urgent' },
      { title: '待跟进订单', description: '需要持续跟进的订单状态', priority: 'high' },
      { title: 'VIP客户事项', description: 'VIP客户的特殊需求和服务', priority: 'high' },
      { title: '系统异常反馈', description: '系统使用中发现的问题', priority: 'normal' }
    ]
  },
  {
    id: 't2',
    name: '仓库白班交接模板',
    post: 'warehouse',
    items: [
      { title: '到货入库', description: '今日到货及入库情况', priority: 'high' },
      { title: '出库发货', description: '待发货订单及发货进度', priority: 'high' },
      { title: '库存盘点', description: '库存差异及盘点事项', priority: 'normal' },
      { title: '设备状态', description: '设备运行及维护情况', priority: 'normal' }
    ]
  },
  {
    id: 't3',
    name: '门店营业交接模板',
    post: 'store',
    items: [
      { title: '销售情况', description: '当日销售数据及重点订单', priority: 'high' },
      { title: '客户预约', description: 'VIP客户预约及特殊需求', priority: 'high' },
      { title: '商品陈列', description: '陈列调整及新品展示', priority: 'normal' },
      { title: '设备设施', description: '店内设备运行状态', priority: 'low' }
    ]
  }
];

export const getPostName = (post: PostType): string => {
  const map = { service: '客服', warehouse: '仓储', store: '门店' };
  return map[post];
};

export const getPriorityName = (priority: PriorityLevel): string => {
  const map = { urgent: '紧急', high: '高', normal: '普通', low: '低' };
  return map[priority];
};

export const getStatusName = (status: HandoverStatus): string => {
  const map = { pending: '待确认', confirmed: '已确认', returned: '已退回', completed: '已完成' };
  return map[status];
};
