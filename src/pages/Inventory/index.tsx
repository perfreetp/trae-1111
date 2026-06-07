import React, { useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Progress,
  Select,
  Input,
  InputNumber,
  Modal,
  Form,
  Radio,
  message,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  AlertTriangle,
  Package,
  CalendarClock,
  FileText,
  Download,
  Thermometer,
} from 'lucide-react';
import { inventoryItems, coldChainRecords } from '@/mock/inventory';
import type { InventoryItem } from '@/types';

const { Option } = Select;

const InventoryPage: React.FC = () => {
  const [data, setData] = useState(inventoryItems);
  const [isHandleModalOpen, setIsHandleModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
  const [handleForm] = Form.useForm();

  const statusMap: Record<string, { color: string; text: string }> = {
    normal: { color: 'green', text: '正常' },
    warning: { color: 'orange', text: '预警' },
    urgent: { color: 'red', text: '紧急' },
  };

  const getExpireProgress = (days: number) => {
    if (days <= 10) return 95;
    if (days <= 30) return 80;
    if (days <= 90) return 60;
    return 30;
  };

  const urgentCount = data.filter((i) => i.status === 'urgent').length;
  const warningCount = data.filter((i) => i.status === 'warning').length;
  const normalCount = data.filter((i) => i.status === 'normal').length;

  const columns = [
    {
      title: '药品名称',
      dataIndex: 'drugName',
      key: 'drugName',
      width: 180,
    },
    {
      title: '规格',
      dataIndex: 'spec',
      key: 'spec',
      width: 140,
    },
    {
      title: '批号',
      dataIndex: 'batchNo',
      key: 'batchNo',
      width: 120,
    },
    {
      title: '库存',
      key: 'stock',
      width: 100,
      render: (_: any, record: InventoryItem) => (
        <span className="font-medium">
          {record.stock} {record.unit}
        </span>
      ),
    },
    {
      title: '有效期',
      key: 'expire',
      width: 180,
      render: (_: any, record: InventoryItem) => (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarClock size={14} className="text-gray-400" />
            <span>{record.expireDate}</span>
          </div>
          <Progress
            percent={getExpireProgress(record.daysToExpire)}
            showInfo={false}
            size="small"
            strokeColor={
              record.status === 'urgent'
                ? '#F53F3F'
                : record.status === 'warning'
                ? '#FF7D00'
                : '#00B42A'
            }
          />
        </div>
      ),
    },
    {
      title: '距效期',
      key: 'daysToExpire',
      width: 100,
      render: (_: any, record: InventoryItem) => {
        const color =
          record.status === 'urgent'
            ? 'text-red-500 font-bold'
            : record.status === 'warning'
            ? 'text-orange-500 font-medium'
            : 'text-gray-600';
        return <span className={color}>{record.daysToExpire}天</span>;
      },
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_: any, record: InventoryItem) => (
        <Tag color={statusMap[record.status].color} icon={<AlertTriangle size={12} />}>
          {statusMap[record.status].text}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right' as const,
      width: 120,
      render: (_: any, record: InventoryItem) => (
        <Button
          type="link"
          size="small"
          disabled={record.status === 'normal'}
          onClick={() => handleProcess(record)}
        >
          处理
        </Button>
      ),
    },
  ];

  const handleProcess = (record: InventoryItem) => {
    setCurrentItem(record);
    setIsHandleModalOpen(true);
  };

  const handleProcessSubmit = () => {
    handleForm.validateFields().then((values) => {
      message.success('处理单已生成');
      setIsHandleModalOpen(false);
      handleForm.resetFields();
    });
  };

  const handleExport = () => {
    message.success('近效期处理清单已导出');
  };

  return (
    <div className="space-y-6">
      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Card className="border-0 shadow-sm">
            <Statistic
              title="紧急效期(≤10天)"
              value={urgentCount}
              prefix={<Package size={20} className="text-red-500" />}
              valueStyle={{ color: '#F53F3F' }}
              suffix="种"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="border-0 shadow-sm">
            <Statistic
              title="预警效期(≤30天)"
              value={warningCount}
              prefix={<AlertTriangle size={20} className="text-orange-500" />}
              valueStyle={{ color: '#FF7D00' }}
              suffix="种"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="border-0 shadow-sm">
            <Statistic
              title="正常库存"
              value={normalCount}
              prefix={<Package size={20} className="text-green-500" />}
              valueStyle={{ color: '#00B42A' }}
              suffix="种"
            />
          </Card>
        </Col>
      </Row>

      <Card
        className="border-0 shadow-sm"
        title="效期预警清单"
        extra={
          <Space>
            <Button icon={<FileText size={14} />} onClick={handleExport}>
              生成处理清单
            </Button>
            <Button type="primary" icon={<Download size={14} />} onClick={handleExport}>
              导出Excel
            </Button>
          </Space>
        }
      >
        <div className="mb-4 flex gap-3">
          <Select defaultValue="all" style={{ width: 140 }}>
            <Option value="all">全部状态</Option>
            <Option value="urgent">紧急</Option>
            <Option value="warning">预警</Option>
            <Option value="normal">正常</Option>
          </Select>
          <Input.Search placeholder="搜索药品名称" style={{ width: 240 }} />
        </div>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          scroll={{ x: 1000 }}
          pagination={{ pageSize: 8 }}
        />
      </Card>

      <Card className="border-0 shadow-sm" title="冷链温度记录">
        <Table
          columns={[
            {
              title: '药品名称',
              dataIndex: 'drugName',
              key: 'drugName',
            },
            {
              title: '记录温度',
              key: 'temperature',
              render: (_: any, record: any) => (
                <span
                  className={`font-medium ${
                    record.status === 'warning' ? 'text-orange-500' : 'text-green-600'
                  }`}
                >
                  <Thermometer size={14} className="mr-1" />
                  {record.temperature}℃
                </span>
              ),
            },
            {
              title: '记录时间',
              dataIndex: 'recordTime',
              key: 'recordTime',
            },
            {
              title: '状态',
              key: 'status',
              render: (_: any, record: any) => (
                <Tag color={record.status === 'normal' ? 'green' : 'orange'}>
                  {record.status === 'normal' ? '正常' : '异常'}
                </Tag>
              ),
            },
          ]}
          dataSource={coldChainRecords}
          rowKey="id"
          pagination={false}
        />
      </Card>

      <Modal
        title="近效期药品处理"
        open={isHandleModalOpen}
        onCancel={() => setIsHandleModalOpen(false)}
        onOk={handleProcessSubmit}
        okText="生成处理单"
      >
        {currentItem && (
          <div>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <Row gutter={16}>
                <Col span={12}>
                  <p className="text-gray-500 text-sm">药品名称</p>
                  <p className="font-medium">{currentItem.drugName}</p>
                </Col>
                <Col span={12}>
                  <p className="text-gray-500 text-sm">规格/批号</p>
                  <p className="font-medium">
                    {currentItem.spec} / {currentItem.batchNo}
                  </p>
                </Col>
                <Col span={12}>
                  <p className="text-gray-500 text-sm">库存数量</p>
                  <p className="font-medium">
                    {currentItem.stock} {currentItem.unit}
                  </p>
                </Col>
                <Col span={12}>
                  <p className="text-gray-500 text-sm">距效期</p>
                  <p className="font-medium text-red-500">{currentItem.daysToExpire}天</p>
                </Col>
              </Row>
            </div>
            <Form form={handleForm} layout="vertical">
              <Form.Item
                label="处理方式"
                name="handleType"
                rules={[{ required: true, message: '请选择处理方式' }]}
              >
                <Radio.Group>
                  <Radio value="promotion">促销销售</Radio>
                  <Radio value="return">退回供应商</Radio>
                  <Radio value="destroy">报损销毁</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="处理数量" name="quantity">
                <InputNumber min={1} max={currentItem.stock} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item label="备注说明" name="remark">
                <Input.TextArea rows={3} placeholder="请输入备注说明" />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InventoryPage;
