export default defineAppConfig({
  pages: [
    'pages/shift/index',
    'pages/handover/index',
    'pages/reminder/index',
    'pages/stats/index',
    'pages/mine/index',
    'pages/item-detail/index',
    'pages/member-confirm/index',
    'pages/create-handover/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#2B6AFF',
    navigationBarTitleText: '团队交接班',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#2B6AFF',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/shift/index',
        text: '今日班次'
      },
      {
        pagePath: 'pages/handover/index',
        text: '交接清单'
      },
      {
        pagePath: 'pages/reminder/index',
        text: '提醒中心'
      },
      {
        pagePath: 'pages/stats/index',
        text: '统计'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
