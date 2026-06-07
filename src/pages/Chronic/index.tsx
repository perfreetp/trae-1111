import React, { useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Tabs,
  List,
  Avatar,
  Progress,
  Form,
  Input,
  InputNumber,
  DatePicker,
  message,
  Row,
  Col,
  Select,
} from 'antd';
import {
  Heart,
  Activity,
  CalendarClock,
  Pill,
  Plus,
  User,
  Clock,
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { chronicRecords, diseaseTypeOptions } from '@/mock/chronic';
import type { ChronicRecord } from '@/types';

const { Option } = Select;
const { TextArea } = Input;

const ChronicPage: React.FC = () => {
  const [data, setData] = useState(chronicRecords);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddFollowUpOpen, setIsAddFollowUpOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<ChronicRecord | null>(null);
  const [followUpForm] = Form.useForm();

  const diseaseTypeMap: Record<string, { color: string; text: string }> = {
    hypertension: { color: 'red', text: '高血压' },
    diabetes: { color: 'blue', text: '糖尿病' },
    other: { color: 'purple', text: '其他慢病' },
  };

  const columns = [
    {
      title: '患者信息',
      key: 'patient',
      width: 200,
      render: (_: any, record: ChronicRecord) => (
        <div className="flex items-center gap-3">
          <Avatar size={40} className="bg-blue-500">
            <User size={20} />
          </Avatar>
          <div>
            <p className="font-medium text-gray-800">{record.patientName}</p>
            <p className="text-sm text-gray-500">
              {record.patientAge}岁 / {record.patientGender === 'male' ? '男' : '女'}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: '疾病类型',
      key: 'diseaseType',
      width: 120,
      render: (_: any, record: ChronicRecord) => (
        <Tag color={diseaseTypeMap[record.diseaseType].color}>
          {diseaseTypeMap[record.diseaseType].text}
        </Tag>
      ),
    },
    {
      title: '疾病名称',
      dataIndex: 'diseaseName',
      key: 'diseaseName',
    },
    {
      title: '确诊日期',
      dataIndex: 'diagnosisDate',
      key: 'diagnosisDate',
      width: 120,
    },
    {
      title: '用药依从率',
      key: 'adherence',
      width: 160,
      render: (_: any, record: ChronicRecord) => (
        <Progress
          percent={record.medicationAdherence}
          size="small"
          strokeColor={
            record.medicationAdherence >= 90
              ? '#00B42A'
              : record.medicationAdherence >= 70
              ? '#FF7D00'
              : '#F53F3F'
          }
        />
      ),
    },
    {
      title: '下次随访',
      dataIndex: 'nextFollowUpDate',
      key: 'nextFollowUpDate',
      width: 120,
      render: (date: string) => (
        <span className="flex items-center gap-1 text-blue-600">
          <CalendarClock size={14} />
          {date}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right' as const,
      width: 180,
      render: (_: any, record: ChronicRecord) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleViewDetail(record)}>
            查看档案
          </Button>
          <Button type="link" size="small" onClick={() => handleAddFollowUp(record)}>
            记录随访
          </Button>
        </Space>
      ),
    },
  ];

  const handleViewDetail = (record: ChronicRecord) => {
    setCurrentRecord(record);
    setIsDetailOpen(true);
  };

  const handleAddFollowUp = (record: ChronicRecord) => {
    setCurrentRecord(record);
    setIsAddFollowUpOpen(true);
  };

  const handleFollowUpSubmit = () => {
    followUpForm.validateFields().then((values) => {
      message.success('随访记录已保存');
      setIsAddFollowUpOpen(false);
      followUpForm.resetFields();
    });
  };

  const getBloodPressureChart = (record: ChronicRecord) => {
    const bpData = record.followUpRecords
      .filter((r) => r.bloodPressure)
      .map((r) => {
        const [sys, dia] = r.bloodPressure!.split('/').map(Number);
        return { date: r.date, sys, dia };
      });

    return {
      tooltip: { trigger: 'axis' },
      legend: { data: ['收缩压', '舒张压'], top: 0 },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: bpData.map((d) => d.date),
        axisLabel: { color: '#6b7280' },
      },
      yAxis: {
        type: 'value',
        name: 'mmHg',
        axisLabel: { color: '#6b7280' },
        splitLine: { lineStyle: { color: '#f3f4f6' } },
      },
      series: [
        {
          name: '收缩压',
          type: 'line',
          smooth: true,
          data: bpData.map((d) => d.sys),
          itemStyle: { color: '#F53F3F' },
          lineStyle: { width: 2 },
        },
        {
          name: '舒张压',
          type: 'line',
          smooth: true,
          data: bpData.map((d) => d.dia),
          itemStyle: { color: '#165DFF' },
          lineStyle: { width: 2 },
        },
      ],
    };
  };

  const getBloodSugarChart = (record: ChronicRecord) => {
    const bsData = record.followUpRecords.filter((r) => r.bloodSugar);

    return {
      tooltip: { trigger: 'axis', formatter: '{b}: {c} mmol/L' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: bsData.map((d) => d.date),
        axisLabel: { color: '#6b7280' },
      },
      yAxis: {
        type: 'value',
        name: 'mmol/L',
        axisLabel: { color: '#6b7280' },
        splitLine: { lineStyle: { color: '#f3f4f6' } },
      },
      series: [
        {
          type: 'line',
          smooth: true,
          data: bsData.map((d) => d.bloodSugar),
          itemStyle: { color: '#722ED1' },
          lineStyle: { width: 2 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(114, 46, 209, 0.3)' },
                { offset: 1, color: 'rgba(114, 46, 209, 0.05)' },
              ],
            },
          },
        },
      ],
    };
  };

  return (
    <div className="space-y-6">
      <Card
        className="border-0 shadow-sm"
        title="慢病档案管理"
        extra={
          <Button type="primary" icon={<Plus size={14} />}>
            新建档案
          </Button>
        }
      >
        <div className="mb-4 flex gap-3">
          <Select defaultValue="all" style={{ width: 140 }}>
            <Option value="all">全部类型</Option>
            {diseaseTypeOptions.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
          <Input.Search placeholder="搜索患者姓名" style={{ width: 240 }} />
        </div>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          scroll={{ x: 1000 }}
          pagination={{ pageSize: 8 }}
        />
      </Card>

      <Modal
        title="慢病档案详情"
        open={isDetailOpen}
        onCancel={() => setIsDetailOpen(false)}
        width={900}
        footer={null}
      >
        {currentRecord && (
          <div>
            <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-6 text-white mb-6">
              <Row align="middle">
                <Col span={4}>
                  <Avatar size={64} className="bg-white/20 border-2 border-white/40">
                    <User size={32} />
                  </Avatar>
                </Col>
                <Col span={14}>
                  <h3 className="text-xl font-bold mb-1">{currentRecord.patientName}</h3>
                  <p className="text-white/80">
                    {currentRecord.patientAge}岁 / {currentRecord.patientGender === 'male' ? '男' : '女'} · {currentRecord.phone}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Tag color="white" className="bg-white/20 text-white border-0">
                      {diseaseTypeMap[currentRecord.diseaseType].text}
                    </Tag>
                    <Tag color="white" className="bg-white/20 text-white border-0">
                      确诊于 {currentRecord.diagnosisDate}
                    </Tag>
                  </div>
                </Col>
                <Col span={6} className="text-right">
                  <p className="text-white/70 text-sm">用药依从率</p>
                  <p className="text-2xl font-bold">{currentRecord.medicationAdherence}%</p>
                </Col>
              </Row>
            </div>

            <Tabs
              defaultActiveKey="followup"
              items={[
                {
                  key: 'followup',
                  label: '随访记录',
                  children: (
                    <div className="space-y-4">
                      {currentRecord.diseaseType === 'hypertension' && (
                        <Card title="血压趋势" size="small" className="mb-4">
                          <ReactECharts option={getBloodPressureChart(currentRecord)} style={{ height: 200 }} />
                        </Card>
                      )}
                      {currentRecord.diseaseType === 'diabetes' && (
                        <Card title="血糖趋势" size="small" className="mb-4">
                          <ReactECharts option={getBloodSugarChart(currentRecord)} style={{ height: 200 }} />
                        </Card>
                      )}
                      <List
                        dataSource={currentRecord.followUpRecords}
                        renderItem={(record) => (
                          <List.Item className="px-4 py-3 bg-gray-50 rounded-lg mb-2">
                            <List.Item.Meta
                              avatar={<Activity size={20} className="text-blue-500 mt-1" />}
                              title={
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{record.date}</span>
                                  {record.medicationAdherence ? (
                                    <Tag color="green">依从</Tag>
                                  ) : (
                                    <Tag color="red">漏服</Tag>
                                  )}
                                </div>
                              }
                              description={
                                <div className="space-y-1">
                                  <div className="flex gap-4 text-sm">
                                    {record.bloodPressure && (
                                      <span>
                                        <Heart size={12} className="mr-1 text-red-500" />
                                        血压: {record.bloodPressure} mmHg
                                      </span>
                                    )}
                                    {record.bloodSugar && (
                                      <span>
                                        <Activity size={12} className="mr-1 text-purple-500" />
                                        血糖: {record.bloodSugar} mmol/L
                                      </span>
                                    )}
                                    {record.heartRate && (
                                      <span>
                                        <Clock size={12} className="mr-1 text-blue-500" />
                                        心率: {record.heartRate} 次/分
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-gray-600">{record.notes}</p>
                                </div>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    </div>
                  ),
                },
                {
                  key: 'medication',
                  label: '用药方案',
                  children: (
                    <List
                      dataSource={currentRecord.medications}
                      renderItem={(med) => (
                        <List.Item className="px-4 py-3">
                          <List.Item.Meta
                            avatar={<Pill size={20} className="text-blue-500 mt-1" />}
                            title={<span className="font-medium">{med}</span>}
                          />
                        </List.Item>
                      )}
                    />
                  ),
                },
              ]}
            />
          </div>
        )}
      </Modal>

      <Modal
        title="记录随访"
        open={isAddFollowUpOpen}
        onCancel={() => setIsAddFollowUpOpen(false)}
        onOk={handleFollowUpSubmit}
        width={600}
        okText="保存记录"
      >
        {currentRecord && (
          <div>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="font-medium">{currentRecord.patientName}</p>
              <p className="text-sm text-gray-500">{currentRecord.diseaseName}</p>
            </div>
            <Form form={followUpForm} layout="vertical">
              <Form.Item label="随访日期" name="date" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
              <Row gutter={16}>
                {currentRecord.diseaseType === 'hypertension' && (
                  <>
                    <Col span={12}>
                      <Form.Item label="收缩压(mmHg)" name="systolic">
                        <InputNumber style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="舒张压(mmHg)" name="diastolic">
                        <InputNumber style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  </>
                )}
                {currentRecord.diseaseType === 'diabetes' && (
                  <Col span={12}>
                    <Form.Item label="空腹血糖(mmol/L)" name="bloodSugar">
                      <InputNumber step={0.1} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                )}
                <Col span={12}>
                  <Form.Item label="心率(次/分)" name="heartRate">
                    <InputNumber style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                label="用药依从性"
                name="adherence"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value={true}>按时服药</Option>
                  <Option value={false}>有漏服</Option>
                </Select>
              </Form.Item>
              <Form.Item label="随访备注" name="notes">
                <TextArea rows={3} placeholder="请输入随访备注" />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ChronicPage;
