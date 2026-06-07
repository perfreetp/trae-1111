import { Member } from '@/types';

export const members: Member[] = [
  {
    id: 'M001',
    name: '张三',
    phone: '138****1234',
    memberLevel: 'gold',
    totalConsumption: 15680,
    points: 2580,
    registerDate: '2022-03-15',
    purchaseRecords: [
      {
        id: 'p1',
        date: '2024-06-05',
        drugs: ['硝苯地平控释片', '阿司匹林肠溶片'],
        amount: 268.5,
        store: '中心店',
      },
      {
        id: 'p2',
        date: '2024-05-20',
        drugs: ['硝苯地平控释片', '阿托伐他汀钙片'],
        amount: 325.0,
        store: '中心店',
      },
      {
        id: 'p3',
        date: '2024-05-05',
        drugs: ['硝苯地平控释片'],
        amount: 148.0,
        store: '中心店',
      },
      {
        id: 'p4',
        date: '2024-04-18',
        drugs: ['血压计', '硝苯地平控释片'],
        amount: 298.0,
        store: '中心店',
      },
    ],
    medicationReminders: [
      {
        id: 'r1',
        drugName: '硝苯地平控释片',
        time: '08:00',
        frequency: '每日1次',
        enabled: true,
      },
      {
        id: 'r2',
        drugName: '阿司匹林肠溶片',
        time: '08:00',
        frequency: '每日1次',
        enabled: true,
      },
    ],
    tags: ['高血压', '金卡会员', '慢病管理'],
  },
  {
    id: 'M002',
    name: '李四',
    phone: '139****5678',
    memberLevel: 'silver',
    totalConsumption: 8920,
    points: 1240,
    registerDate: '2023-01-20',
    purchaseRecords: [
      {
        id: 'p5',
        date: '2024-06-03',
        drugs: ['二甲双胍缓释片', '格列美脲片'],
        amount: 186.5,
        store: '中心店',
      },
      {
        id: 'p6',
        date: '2024-05-15',
        drugs: ['二甲双胍缓释片', '血糖仪试纸'],
        amount: 245.0,
        store: '中心店',
      },
    ],
    medicationReminders: [
      {
        id: 'r3',
        drugName: '二甲双胍缓释片',
        time: '08:00,20:00',
        frequency: '每日2次',
        enabled: true,
      },
    ],
    tags: ['糖尿病', '银卡会员'],
  },
  {
    id: 'M003',
    name: '王五',
    phone: '137****9012',
    memberLevel: 'platinum',
    totalConsumption: 32560,
    points: 5680,
    registerDate: '2021-08-10',
    purchaseRecords: [
      {
        id: 'p7',
        date: '2024-06-06',
        drugs: ['阿托伐他汀钙片', '氯吡格雷片', '贝那普利片'],
        amount: 458.0,
        store: '中心店',
      },
    ],
    medicationReminders: [
      {
        id: 'r4',
        drugName: '阿托伐他汀钙片',
        time: '21:00',
        frequency: '每晚1次',
        enabled: true,
      },
    ],
    tags: ['冠心病', '高血压', '钻石卡会员', '重点关注'],
  },
];
