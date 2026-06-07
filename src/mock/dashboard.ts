import { SalesData, FlowData, RepurchaseData } from '@/types';

export const dashboardStats = {
  todaySales: 28650,
  todaySalesGrowth: 12.5,
  todayOrders: 186,
  todayOrdersGrowth: 8.3,
  avgOrderValue: 154,
  avgOrderValueGrowth: 3.8,
  todayFlow: 312,
  todayFlowGrowth: 6.7,
  memberRepurchaseRate: 68.5,
  memberRepurchaseGrowth: 2.1,
};

export const salesTrendData: SalesData[] = [
  { date: '06-01', sales: 22300, orders: 142 },
  { date: '06-02', sales: 25600, orders: 168 },
  { date: '06-03', sales: 24100, orders: 155 },
  { date: '06-04', sales: 27800, orders: 178 },
  { date: '06-05', sales: 26500, orders: 172 },
  { date: '06-06', sales: 30200, orders: 195 },
  { date: '06-07', sales: 28650, orders: 186 },
];

export const flowHourData: FlowData[] = [
  { hour: '08:00', count: 18 },
  { hour: '09:00', count: 35 },
  { hour: '10:00', count: 48 },
  { hour: '11:00', count: 42 },
  { hour: '12:00', count: 28 },
  { hour: '13:00', count: 22 },
  { hour: '14:00', count: 36 },
  { hour: '15:00', count: 45 },
  { hour: '16:00', count: 52 },
  { hour: '17:00', count: 48 },
  { hour: '18:00', count: 38 },
  { hour: '19:00', count: 25 },
];

export const repurchaseCategoryData: RepurchaseData[] = [
  { category: '高血压用药', rate: 82.5 },
  { category: '糖尿病用药', rate: 78.3 },
  { category: '心脑血管', rate: 75.6 },
  { category: '维生素保健', rate: 65.2 },
  { category: '感冒发烧', rate: 45.8 },
  { category: '肠胃消化', rate: 52.3 },
  { category: '皮肤用药', rate: 38.7 },
];

export const topSellingDrugs = [
  { rank: 1, name: '硝苯地平控释片', sales: 12580, quantity: 326 },
  { rank: 2, name: '二甲双胍缓释片', sales: 9860, quantity: 285 },
  { rank: 3, name: '阿司匹林肠溶片', sales: 8520, quantity: 412 },
  { rank: 4, name: '氨氯地平片', sales: 7680, quantity: 198 },
  { rank: 5, name: '阿托伐他汀钙片', sales: 6950, quantity: 156 },
];
