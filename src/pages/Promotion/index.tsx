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
  Checkbox,
  Tooltip,
  Divider,
} from 'antd';
import {
  Plus,
  Tag as TagIcon,
  Percent,
  Gift,
  Eye,
  Edit,
  AlertTriangle,
  Ban,
  ShoppingCart,
  Minus,
} from 'lucide-react';
import { promotions as initialPromotions, promotionTypeOptions } from '@/mock/promotion';
import { selectableProducts } from '@/mock/products';
import type { Promotion, PromotionProduct } from '@/types';
import type { SelectableProduct } from '@/mock/products';

const { Option } = Select;
const { RangePicker } = DatePicker;

const PromotionPage: React.FC = () => {
  const [data, setData] = useState<Promotion[]>(initialPromotions);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isProductSelectOpen, setIsProductSelectOpen] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState<Promotion | null>(null);
  const [createForm] = Form.useForm();
  const [promotionType, setPromotionType] = useState<'discount' | 'fullReduce' | 'buyGift'>('discount');
  const [selectedProducts, setSelectedProducts] = useState<PromotionProduct[]>([]);
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>([]);
  const [discountValue, setDiscountValue] = useState<number>(8.5);
  const [fullAmount, setFullAmount] = useState<number>(100);
  const [reduceAmount, setReduceAmount] = useState<number>(20);
  const [buyQuantity, setBuyQuantity] = useState<number>(2);
  const [giftQuantity, setGiftQuantity] = useState<number>(1);

  const statusMap: Record<string, { color: string; text: string }> = {
    draft: { color: 'default', text: '草稿' },
    active: { color: 'green', text: '进行中' },
    ended: { color: 'gray', text: '已结束' },
  };

  const typeIconMap: Record<string, React.ReactNode> = {
    discount: <Percent size={16} />,
    fullReduce: <Minus size={16} />,
    buyGift: <Gift size={16} />,
  };

  const rxProductsInPromotion = (products: PromotionProduct[]) =>
    products.filter((p) => p.isRx);

  const calculatePromotionPrice = (originalPrice: number): number => {
    switch (promotionType) {
      case 'discount':
        return Math.round(originalPrice * (discountValue / 10) * 100) / 100;
      case 'fullReduce':
        return originalPrice >= fullAmount ? Math.max(0, originalPrice - reduceAmount) : originalPrice;
      case 'buyGift':
        return originalPrice;
      default:
        return originalPrice;
    }
  };

  const getPromotionRuleText = (): string => {
    switch (promotionType) {
      case 'discount':
        return `${discountValue}折优惠`;
      case 'fullReduce':
        return `满${fullAmount}减${reduceAmount}`;
      case 'buyGift':
        return `买${buyQuantity}赠${giftQuantity}`;
      default:
        return '';
    }
  };

  const getPromotionRuleForProduct = (promo: Promotion, originalPrice: number): { finalPrice: number; ruleText: string } => {
    switch (promo.type) {
      case 'discount':
        const discount = promo.discountValue || 8.5;
        return {
          finalPrice: Math.round(originalPrice * (discount / 10) * 100) / 100,
          ruleText: `${discount}折`,
        };
      case 'fullReduce':
        const full = promo.fullAmount || 100;
        const reduce = promo.reduceAmount || 20;
        return {
          finalPrice: originalPrice >= full ? Math.max(0, originalPrice - reduce) : originalPrice,
          ruleText: originalPrice >= full ? `满${full}减${reduce}` : '不满足满减条件',
        };
      case 'buyGift':
        return {
          finalPrice: originalPrice,
          ruleText: `买${promo.buyQuantity || 2}赠${promo.giftQuantity || 1}`,
        };
      default:
        return { finalPrice: originalPrice, ruleText: '' };
    }
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
      width: 120,
      render: (_: any, record: Promotion) => (
        <div>
          <Tag>{record.typeName}</Tag>
          <p className="text-xs text-gray-500 mt-1">
            {record.type === 'discount' && `${record.discountValue}折`}
            {record.type === 'fullReduce' && `满${record.fullAmount}减${record.reduceAmount}`}
            {record.type === 'buyGift' && `买${record.buyQuantity}赠${record.giftQuantity}`}
          </p>
        </div>
      ),
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
      width: 120,
      render: (_: any, record: Promotion) => {
        const rxCount = rxProductsInPromotion(record.products).length;
        return (
          <div>
            <Tag color="blue">{record.products.length}种</Tag>
            {rxCount > 0 && (
              <Tooltip title="包含处方药，违反促销规定">
                <Tag color="red" icon={<Ban size={10} />}>
                  {rxCount}种违规
                </Tag>
              </Tooltip>
            )}
          </div>
        );
      },
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
      render: (_: any, record: Promotion) => <span>{record.totalOrders || '-'}</span>,
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
          <Button
            type="link"
            size="small"
            icon={<Eye size={14} />}
            onClick={() => handleViewDetail(record)}
          >
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
    const freshRecord = data.find((p) => p.id === record.id);
    setCurrentPromotion(freshRecord || record);
    setIsDetailOpen(true);
  };

  const handleOpenProductSelect = () => {
    setTempSelectedIds(selectedProducts.map((p) => p.id));
    setIsProductSelectOpen(true);
  };

  const handleConfirmProducts = () => {
    const products = tempSelectedIds
      .map((id) => selectableProducts.find((p) => p.id === id))
      .filter(Boolean)
      .map((p) => ({
        id: p!.id,
        drugName: p!.drugName,
        spec: p!.spec,
        originalPrice: p!.originalPrice,
        promotionPrice: calculatePromotionPrice(p!.originalPrice),
        isRx: p!.isRx,
      }));
    setSelectedProducts(products);
    setIsProductSelectOpen(false);
    message.success(`已选择 ${products.length} 种商品`);
  };

  const handleCreateSubmit = () => {
    createForm.validateFields().then((values) => {
      if (selectedProducts.length === 0) {
        message.error('请至少选择一种参与商品');
        return;
      }

      const rxCount = selectedProducts.filter((p) => p.isRx).length;
      if (rxCount > 0) {
        message.error('处方药不能参与促销活动，请移除后重试');
        return;
      }

      const newPromotion: Promotion = {
        id: `PROM${Date.now().toString().slice(-6)}`,
        name: values.name,
        type: promotionType,
        typeName: promotionTypeOptions.find((t) => t.value === promotionType)?.label || '',
        startTime: values.time[0].format('YYYY-MM-DD'),
        endTime: values.time[1].format('YYYY-MM-DD'),
        products: selectedProducts.map((p) => ({
          ...p,
          promotionPrice: calculatePromotionPrice(p.originalPrice),
        })),
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
      setSelectedProducts([]);
      setDiscountValue(8.5);
      setFullAmount(100);
      setReduceAmount(20);
      setBuyQuantity(2);
      setGiftQuantity(1);
      message.success('活动创建成功');
    });
  };

  return (
    <div className="space-y-6">
      <Card
        className="border-0 shadow-sm"
        title="促销活动管理"
        extra={
          <Button
            type="primary"
            icon={<Plus size={14} />}
            onClick={() => setIsCreateOpen(true)}
          >
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
        onCancel={() => {
          setIsCreateOpen(false);
          setSelectedProducts([]);
          setDiscountValue(8.5);
          setFullAmount(100);
          setReduceAmount(20);
          setBuyQuantity(2);
          setGiftQuantity(1);
        }}
        onOk={handleCreateSubmit}
        width={750}
        okText="创建活动"
        destroyOnClose
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
              onChange={(value) => {
                setPromotionType(value as 'discount' | 'fullReduce' | 'buyGift');
              }}
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
              label="折扣比例(折)"
              name="discountValue"
              rules={[{ required: true, message: '请输入折扣比例' }]}
              initialValue={8.5}
            >
              <InputNumber
                min={1}
                max={9.9}
                step={0.1}
                style={{ width: '100%' }}
                placeholder="例如：8.5 表示85折"
                onChange={(v) => setDiscountValue(v || 8.5)}
              />
            </Form.Item>
          )}

          {promotionType === 'fullReduce' && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="满额(元)"
                  name="fullAmount"
                  rules={[{ required: true, message: '请输入满额' }]}
                  initialValue={100}
                >
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                    prefix="¥"
                    placeholder="满多少元"
                    onChange={(v) => setFullAmount(v || 100)}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="减额(元)"
                  name="reduceAmount"
                  rules={[{ required: true, message: '请输入减额' }]}
                  initialValue={20}
                >
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                    prefix="¥"
                    placeholder="减多少元"
                    onChange={(v) => setReduceAmount(v || 20)}
                  />
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
                  initialValue={2}
                >
                  <InputNumber
                    min={1}
                    style={{ width: '100%' }}
                    placeholder="买几件"
                    onChange={(v) => setBuyQuantity(v || 2)}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="赠送数量"
                  name="giftQuantity"
                  rules={[{ required: true, message: '请输入赠送数量' }]}
                  initialValue={1}
                >
                  <InputNumber
                    min={1}
                    style={{ width: '100%' }}
                    placeholder="送几件"
                    onChange={(v) => setGiftQuantity(v || 1)}
                  />
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
            className="mb-4"
          />

          <div className="mb-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between">
              <span className="text-blue-700 font-medium">
                当前优惠规则：{getPromotionRuleText()}
              </span>
            </div>
          </div>

          <Form.Item label="参与商品">
            <Button type="dashed" block onClick={handleOpenProductSelect}>
              <ShoppingCart size={14} className="mr-2" />
              {selectedProducts.length > 0
                ? `已选择 ${selectedProducts.length} 种商品`
                : '点击选择参与商品'}
            </Button>
          </Form.Item>

          {selectedProducts.length > 0 && (
            <List
              size="small"
              bordered
              dataSource={selectedProducts}
              renderItem={(product) => {
                const promoPrice = calculatePromotionPrice(product.originalPrice);
                const hasDiscount = promoPrice < product.originalPrice;
                return (
                  <List.Item className="px-3 py-2">
                    <div className="flex justify-between w-full items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{product.drugName}</span>
                        <span className="text-gray-500 text-sm">{product.spec}</span>
                        {product.isRx && (
                          <Tag color="red" icon={<Ban size={10} />}>
                            处方药 违规
                          </Tag>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 line-through text-sm">
                          ¥{product.originalPrice}
                        </span>
                        {product.isRx ? (
                          <span className="text-red-500 font-bold">禁止优惠</span>
                        ) : (
                          <div className="text-right">
                            <span className="text-orange-500 font-bold">
                              ¥{promoPrice}
                            </span>
                            {hasDiscount && (
                              <Tag color="orange" className="ml-1">
                                {getPromotionRuleText()}
                              </Tag>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </List.Item>
                );
              }}
            />
          )}
        </Form>
      </Modal>

      <Modal
        title="选择参与商品"
        open={isProductSelectOpen}
        onCancel={() => setIsProductSelectOpen(false)}
        onOk={handleConfirmProducts}
        width={800}
        okText="确认选择"
        destroyOnClose
      >
        <Alert
          message="处方药限制提示"
          description="处方药已被系统禁用，无法参与促销活动"
          type="warning"
          showIcon
          className="mb-4"
        />
        <div className="max-h-96 overflow-y-auto">
          <Checkbox.Group value={tempSelectedIds} onChange={(v) => setTempSelectedIds(v as string[])}>
            <List
              dataSource={selectableProducts}
              renderItem={(product: SelectableProduct) => (
                <List.Item className="px-3 py-2 hover:bg-gray-50">
                  <div className="flex justify-between w-full items-center">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        value={product.id}
                        disabled={product.isRx}
                        checked={tempSelectedIds.includes(product.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTempSelectedIds([...tempSelectedIds, product.id]);
                          } else {
                            setTempSelectedIds(tempSelectedIds.filter((id) => id !== product.id));
                          }
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{product.drugName}</span>
                          <span className="text-gray-500 text-sm">{product.spec}</span>
                          {product.isRx && (
                            <Tag color="red" icon={<Ban size={10} />}>
                              处方药
                            </Tag>
                          )}
                        </div>
                        <span className="text-gray-400 text-xs">{product.category}</span>
                      </div>
                    </div>
                    <span className="text-gray-600">¥{product.originalPrice}</span>
                  </div>
                </List.Item>
              )}
            />
          </Checkbox.Group>
        </div>
      </Modal>

      <Modal
        title="活动详情"
        open={isDetailOpen}
        onCancel={() => setIsDetailOpen(false)}
        width={800}
        footer={null}
        destroyOnClose
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
              <div className="mt-3 flex items-center gap-4">
                {currentPromotion.type === 'discount' && (
                  <Tag color="white" className="bg-white/20 text-white border-0">
                    <Percent size={12} className="inline mr-1" />
                    {currentPromotion.discountValue}折优惠
                  </Tag>
                )}
                {currentPromotion.type === 'fullReduce' && (
                  <Tag color="white" className="bg-white/20 text-white border-0">
                    <Minus size={12} className="inline mr-1" />
                    满{currentPromotion.fullAmount}减{currentPromotion.reduceAmount}
                  </Tag>
                )}
                {currentPromotion.type === 'buyGift' && (
                  <Tag color="white" className="bg-white/20 text-white border-0">
                    <Gift size={12} className="inline mr-1" />
                    买{currentPromotion.buyQuantity}赠{currentPromotion.giftQuantity}
                  </Tag>
                )}
              </div>
            </div>

            {rxProductsInPromotion(currentPromotion.products).length > 0 && (
              <Alert
                message="违规商品警告"
                description={`活动包含 ${rxProductsInPromotion(currentPromotion.products).length} 种处方药，处方药不允许参与促销，请及时移除`}
                type="error"
                showIcon
                icon={<Ban size={16} />}
              />
            )}

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
              <p className="font-medium mb-3">参与商品列表</p>
              {currentPromotion.products.length === 0 ? (
                <div className="text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-lg">
                  暂未添加参与商品
                </div>
              ) : (
                <List
                  bordered
                  dataSource={currentPromotion.products}
                  renderItem={(product) => {
                    const { finalPrice, ruleText } = getPromotionRuleForProduct(
                      currentPromotion,
                      product.originalPrice
                    );
                    return (
                      <List.Item className="px-4 py-3">
                        <div className="flex justify-between w-full items-center">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{product.drugName}</span>
                            <span className="text-gray-500 text-sm">{product.spec}</span>
                            {product.isRx && (
                              <Tag color="red" icon={<Ban size={10} />}>
                                处方药 禁止优惠
                              </Tag>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="text-gray-400 line-through block text-sm">
                                原价 ¥{product.originalPrice}
                              </span>
                              {!product.isRx && (
                                <span className="text-xs text-blue-500">
                                  {ruleText}
                                </span>
                              )}
                            </div>
                            <Divider type="vertical" />
                            <div className="text-right min-w-20">
                              {product.isRx ? (
                                <span className="text-red-500 font-bold">不参与优惠</span>
                              ) : (
                                <span className="text-orange-500 font-bold text-lg">
                                  ¥{finalPrice}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </List.Item>
                    );
                  }}
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
