import React from 'react';
import { Row, Col, Card, Table, Tag } from 'antd';
import ReactECharts from 'echarts-for-react';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Repeat,
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import {
  dashboardStats,
  salesTrendData,
  flowHourData,
  repurchaseCategoryData,
  topSellingDrugs,
} from '@/mock/dashboard';

const Dashboard: React.FC = () => {
  const salesTrendOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      textStyle: { color: '#374151' },
    },
    legend: {
      data: ['销售额', '订单数'],
      top: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: salesTrendData.map((d) => d.date),
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280' },
    },
    yAxis: [
      {
        type: 'value',
        name: '销售额(元)',
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisLabel: { color: '#6b7280' },
        splitLine: { lineStyle: { color: '#f3f4f6' } },
      },
      {
        type: 'value',
        name: '订单数',
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisLabel: { color: '#6b7280' },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '销售额',
        type: 'line',
        smooth: true,
        data: salesTrendData.map((d) => d.sales),
        itemStyle: { color: '#165DFF' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(22, 93, 255, 0.3)' },
              { offset: 1, color: 'rgba(22, 93, 255, 0.05)' },
            ],
          },
        },
      },
      {
        name: '订单数',
        type: 'bar',
        yAxisIndex: 1,
        data: salesTrendData.map((d) => d.orders),
        itemStyle: { color: '#00B42A', borderRadius: [4, 4, 0, 0] },
        barWidth: 20,
      },
    ],
  };

  const flowHourOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      textStyle: { color: '#374151' },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: flowHourData.map((d) => d.hour),
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      name: '客流数',
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280' },
      splitLine: { lineStyle: { color: '#f3f4f6' } },
    },
    series: [
      {
        type: 'bar',
        data: flowHourData.map((d) => d.count),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#165DFF' },
              { offset: 1, color: '#4080FF' },
            ],
          },
          borderRadius: [6, 6, 0, 0],
        },
        barWidth: 28,
      },
    ],
  };

  const repurchaseOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      textStyle: { color: '#374151' },
      formatter: '{b}: {c}%',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      max: 100,
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280', formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#f3f4f6' } },
    },
    yAxis: {
      type: 'category',
      data: repurchaseCategoryData.map((d) => d.category).reverse(),
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280' },
    },
    series: [
      {
        type: 'bar',
        data: repurchaseCategoryData.map((d) => d.rate).reverse(),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#722ED1' },
              { offset: 1, color: '#B37FEB' },
            ],
          },
          borderRadius: [0, 6, 6, 0],
        },
        barWidth: 20,
        label: {
          show: true,
          position: 'right',
          formatter: '{c}%',
          color: '#6b7280',
          fontSize: 12,
        },
      },
    ],
  };

  const topSellingColumns = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 60,
      render: (rank: number) => (
        <Tag
          color={rank <= 3 ? 'blue' : 'default'}
          className="font-medium"
        >
          {rank}
        </Tag>
      ),
    },
    {
      title: '药品名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '销售额(元)',
      dataIndex: 'sales',
      key: 'sales',
      render: (sales: number) => <span className="font-medium">¥{sales.toLocaleString()}</span>,
    },
    {
      title: '销量',
      dataIndex: 'quantity',
      key: 'quantity',
    },
  ];

  return (
    <div className="space-y-6">
      <Row gutter={16}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="今日销售额"
            value={dashboardStats.todaySales.toLocaleString()}
            prefix="¥"
            growth={dashboardStats.todaySalesGrowth}
            icon={<DollarSign size={24} />}
            color="blue"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="今日订单数"
            value={dashboardStats.todayOrders}
            growth={dashboardStats.todayOrdersGrowth}
            icon={<ShoppingCart size={24} />}
            color="green"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="今日客流量"
            value={dashboardStats.todayFlow}
            growth={dashboardStats.todayFlowGrowth}
            icon={<Users size={24} />}
            color="orange"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="会员复购率"
            value={dashboardStats.memberRepurchaseRate}
            suffix="%"
            growth={dashboardStats.memberRepurchaseGrowth}
            icon={<Repeat size={24} />}
            color="purple"
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card title="销售趋势" className="border-0 shadow-sm">
            <ReactECharts option={salesTrendOption} style={{ height: 320 }} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="药品销量排行" className="border-0 shadow-sm h-full">
            <Table
              columns={topSellingColumns}
              dataSource={topSellingDrugs}
              rowKey="rank"
              pagination={false}
              size="middle"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card title="时段客流分布" className="border-0 shadow-sm">
            <ReactECharts option={flowHourOption} style={{ height: 280 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="品类复购率" className="border-0 shadow-sm">
            <ReactECharts option={repurchaseOption} style={{ height: 280 }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
