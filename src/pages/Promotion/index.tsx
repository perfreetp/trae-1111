import React, { useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  message,
  Row,
  Col,
  List,
  Alert,
  Switch,
} from 'antd';
import {
  Plus,
  Tag as TagIcon,
  Percent,
  Gift,
  Eye,
  Edit,
  AlertTriangle,
} from 'lucide-react';
import { promotions, promotionTypeOptions } from '@/mock/promotion';
import type { Promotion } from '@/types';

const { Option } = Select;
const { RangePicker } = DatePicker;

const PromotionPage: React.FC = () => {
  const [data, setData] = useState(promotions);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState<Promotion | null>(null);
  const [createForm] = Form.useForm();
  const [promotionType, setPromotionType] = useState<'discount' | 'fullReduce' | 'buyGift'>('discount');

  const statusMap: Record<string, { color: string; text: string }> = {
    draft: { color: 'default', text: '草稿' },
    active: { color: 'green', text: '进行中' },
    ended: { color: 'gray', text: '已结束' },
  };

  const typeIconMap: Record<string, React.ReactNode> = {
    discount: <Percent size={16} />,
    fullReduce: <TagIcon size={16} />,
    buyGift: <Gift size={16} />,
  };

  const columns = [
    {
      title: '活动名称',
      dataIndex: 'name',
      key: 'name',
      width: 220,
      render: (name: string, record: Promotion) => (
        <div className="flex items-center gap-2">
          <span className="text-blue-500">{typeIconMap[record.type]}</span>
          <span className="font-medium">{name}</span>
        </div>
      ),
    },
    {
      title: '活动类型',
      key: 'type',
      width: 100,
      render: (_: any, record: Promotion) => <Tag>{record.typeName}</Tag>,
    },
    {
      title: '活动时间',
      key: 'time',
      width: 220,
      render: (_: any, record: Promotion) => (
        <span className="text-gray-600 text-sm">
          {record.startTime} ~ {record.endTime}
        </span>
      ),
    },
    {
      title: '参与商品',
      key: 'products',
      width: 100,
      render: (_: any, record: Promotion) => (
        <Tag color="blue">{record.products.length}种</Tag>
      ),
    },
    {
      title: '销售额',
      key: 'sales',
      width: 120,
      render: (_: any, record: Promotion) => (
        <span className="font-medium">
          {record.totalSales ? `¥${record.totalSales.toLocaleString()}` : '-'}
        </span>
      ),
    },
    {
      title: '订单数',
      key: 'orders',
      width: 100,
      render: (_: any, record: Promotion) => (
        <span>{record.totalOrders || '-'}</span>
      ),
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_: any, record: Promotion) => (
        <Tag color={statusMap[record.status].color}>
          {statusMap[record.status].text}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right' as const,
      width: 180,
      render: (_: any, record: Promotion) => (
        <Space size="small">
          <Button type="link" size="small" icon={<Eye size={14} />} onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          <Button type="link" size="small" icon={<Edit size={14} />}>
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  const handleViewDetail = (record: Promotion) => {
    setCurrentPromotion(record);
    setIsDetailOpen(true);
  };

  const handleCreateSubmit = () => {
    createForm.validateFields().then((values) => {
      const newPromotion: Promotion = {
        id: `PROM${Date.now().toString().slice(-6)}`,
        name: values.name,
        type: promotionType,
        typeName: promotionTypeOptions.find((t) => t.value === promotionType)?.label || '',
        startTime: values.time[0].format('YYYY-MM-DD'),
        endTime: values.time[1].format('YYYY-MM-DD'),
        products: [],
        status: 'draft',
        ...(promotionType === 'discount' && { discountValue: values.discountValue }),
        ...(promotionType === 'fullReduce' && {
          fullAmount: values.fullAmount,
          reduceAmount: values.reduceAmount,
        }),
        ...(promotionType === 'buyGift' && {
          buyQuantity: values.buyQuantity,
          giftQuantity: values.giftQuantity,
        }),
      };
      setData([newPromotion, ...data]);
      setIsCreateOpen(false);
      createForm.resetFields();
      message.success('活动创建成功');
    });
  };

  return (
    <div className="space-y-6">
      <Card
        className="border-0 shadow-sm"
        title="促销活动管理"
        extra={
          <Button type="primary" icon={<Plus size={14} />} onClick={() => setIsCreateOpen(true)}>
            创建活动
          </Button>
        }
      >
        <div className="mb-4 flex gap-3">
          <Select defaultValue="all" style={{ width: 140 }}>
            <Option value="all">全部状态</Option>
            <Option value="draft">草稿</Option>
            <Option value="active">进行中</Option>
            <Option value="ended">已结束</Option>
          </Select>
          <Select defaultValue="all" style={{ width: 140 }}>
            <Option value="all">全部类型</Option>
            {promotionTypeOptions.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
          <Input.Search placeholder="搜索活动名称" style={{ width: 240 }} />
        </div>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 8 }}
        />
      </Card>

      <Modal
        title="创建促销活动"
        open={isCreateOpen}
        onCancel={() => setIsCreateOpen(false)}
        onOk={handleCreateSubmit}
        width={600}
        okText="创建活动"
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            label="活动名称"
            name="name"
            rules={[{ required: true, message: '请输入活动名称' }]}
          >
            <Input placeholder="请输入活动名称" />
          </Form.Item>
          <Form.Item
            label="活动类型"
            name="type"
            rules={[{ required: true, message: '请选择活动类型' }]}
          >
            <Select
              onChange={(value) => setPromotionType(value as 'discount' | 'fullReduce' | 'buyGift')}
              defaultValue="discount"
            >
              {promotionTypeOptions.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {promotionType === 'discount' && (
            <Form.Item
              label="折扣比例(%)"
              name="discountValue"
              rules={[{ required: true, message: '请输入折扣比例' }]}
            >
              <InputNumber min={1} max={9.9} step={0.1} style={{ width: '100%' }} placeholder="例如：8.5 表示85折" />
            </Form.Item>
          )}

          {promotionType === 'fullReduce' && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="满额"
                  name="fullAmount"
                  rules={[{ required: true, message: '请输入满额' }]}
                >
                  <InputNumber min={0} style={{ width: '100%' }} prefix="¥" placeholder="满多少元" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="减额"
                  name="reduceAmount"
                  rules={[{ required: true, message: '请输入减额' }]}
                >
                  <InputNumber min={0} style={{ width: '100%' }} prefix="¥" placeholder="减多少元" />
                </Form.Item>
              </Col>
            </Row>
          )}

          {promotionType === 'buyGift' && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="购买数量"
                  name="buyQuantity"
                  rules={[{ required: true, message: '请输入购买数量' }]}
                >
                  <InputNumber min={1} style={{ width: '100%' }} placeholder="买几件" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="赠送数量"
                  name="giftQuantity"
                  rules={[{ required: true, message: '请输入赠送数量' }]}
                >
                  <InputNumber min={1} style={{ width: '100%' }} placeholder="送几件" />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Form.Item
            label="活动时间"
            name="time"
            rules={[{ required: true, message: '请选择活动时间' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Alert
            message="处方药促销限制"
            description="根据药品管理法规，处方药不允许直接参与打折促销活动，系统将自动排除处方药。"
            type="warning"
            showIcon
            icon={<AlertTriangle size={16} />}
          />
        </Form>
      </Modal>

      <Modal
        title="活动详情"
        open={isDetailOpen}
        onCancel={() => setIsDetailOpen(false)}
        width={700}
        footer={null}
      >
        {currentPromotion && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <TagIcon size={24} />
                <h3 className="text-xl font-bold">{currentPromotion.name}</h3>
                <Tag color="white" className="bg-white/20 text-white border-0">
                  {currentPromotion.typeName}
                </Tag>
              </div>
              <p className="text-white/80">
                活动时间：{currentPromotion.startTime} ~ {currentPromotion.endTime}
              </p>
            </div>

            <Row gutter={16}>
              <Col span={8}>
                <Card size="small" className="text-center">
                  <p className="text-gray-500 text-sm">活动销售额</p>
                  <p className="text-2xl font-bold text-orange-500">
                    ¥{currentPromotion.totalSales?.toLocaleString() || 0}
                  </p>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" className="text-center">
                  <p className="text-gray-500 text-sm">活动订单数</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {currentPromotion.totalOrders || 0}
                  </p>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" className="text-center">
                  <p className="text-gray-500 text-sm">参与商品</p>
                  <p className="text-2xl font-bold text-green-500">
                    {currentPromotion.products.length}种
                  </p>
                </Card>
              </Col>
            </Row>

            <div>
              <p className="font-medium mb-2">参与商品列表</p>
              {currentPromotion.products.length === 0 ? (
                <div className="text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-lg">
                  暂未添加参与商品
                </div>
              ) : (
                <List
                  bordered
                  dataSource={currentPromotion.products}
                  renderItem={(product) => (
                    <List.Item className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{product.drugName}</span>
                        <span className="text-gray-500 text-sm">{product.spec}</span>
                        {product.isRx && <Tag color="red">Rx 处方药</Tag>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 line-through">
                          ¥{product.originalPrice}
                        </span>
                        <span className="text-orange-500 font-bold">
                          ¥{product.promotionPrice}
                        </span>
                      </div>
                    </List.Item>
                  )}
                />
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PromotionPage;
