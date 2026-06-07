import React, { useState, useMemo } from 'react';
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
  InputNumber,
  message,
  Row,
  Col,
  Progress,
  List,
  Descriptions,
  TablePaginationConfig,
  Alert,
} from 'antd';
import {
  AlertTriangle,
  Package,
  Thermometer,
  FileText,
  Download,
  Check,
  CheckCircle,
  Clock,
  Eye,
  X,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { inventoryItems as initialInventory, nearExpiryItems } from '@/mock/inventory';
import type { InventoryItem, ProcessRecord } from '@/types';

const { Option } = Select;
const { TextArea } = Input;

interface ProcessListItem {
  id: string;
  drugName: string;
  batchNo: string;
  expiryDate: string;
  currentQuantity: number;
  processMethod: string;
  processQuantity: number;
  notes: string;
  status: 'pending' | 'processed';
}

const InventoryPage: React.FC = () => {
  const [data, setData] = useState<InventoryItem[]>(initialInventory);
  const [processList, setProcessList] = useState<ProcessListItem[]>([]);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isProcessListOpen, setIsProcessListOpen] = useState(false);
  const [processForm] = Form.useForm();
  const [pagination, setPagination] = useState<TablePaginationConfig>({ current: 1, pageSize: 8 });
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [processMethodFilter, setProcessMethodFilter] = useState<string>('all');
  const [processStatusFilter, setProcessStatusFilter] = useState<string>('all');

  const levelMap: Record<string, { color: string; text: string }> = {
    normal: { color: 'green', text: '正常' },
    warning: { color: 'orange', text: '近效期' },
    urgent: { color: 'red', text: '临效期' },
    out_of_stock: { color: 'default', text: '已出清' },
  };

  const filteredProcessList = useMemo(() => {
    let result = [...processList];
    if (processMethodFilter !== 'all') {
      result = result.filter((p) => p.processMethod === processMethodFilter);
    }
    if (processStatusFilter !== 'all') {
      result = result.filter((p) => p.status === processStatusFilter);
    }
    return result;
  }, [processList, processMethodFilter, processStatusFilter]);

  const handleGenerateProcess = () => {
    const processedIds = processList
      .filter((p) => p.status === 'processed')
      .map((p) => p.id);
    const pendingIds = processList
      .filter((p) => p.status === 'pending')
      .map((p) => p.id);

    const pendingItems = nearExpiryItems.filter((item) => {
      if (item.quantity <= 0 || item.stock <= 0) return false;
      if (processedIds.includes(item.id)) return false;
      if (pendingIds.includes(item.id)) return false;
      return true;
    });

    if (pendingItems.length === 0) {
      if (nearExpiryItems.length === 0) {
        message.warning('当前没有近效期药品需要处理');
      } else {
        message.warning('所有近效期药品已在处理清单中或已处理完成');
      }
      return;
    }

    const newProcessItems: ProcessListItem[] = pendingItems.map((item) => ({
      id: item.id,
      drugName: item.drugName,
      batchNo: item.batchNo,
      expiryDate: item.expiryDate,
      currentQuantity: item.quantity,
      processMethod: 'return_supplier',
      processQuantity: item.quantity,
      notes: '',
      status: 'pending',
    }));

    setProcessList([...newProcessItems, ...processList]);
    setIsGenerateOpen(false);
    setIsProcessListOpen(true);
    message.success(`已生成 ${newProcessItems.length} 条近效期处理记录`);
  };

  const handleExportProcessList = () => {
    const listToExport = filteredProcessList;
    if (listToExport.length === 0) {
      message.error('暂无处理清单可导出');
      return;
    }

    const methodMap: Record<string, string> = {
      return_supplier: '退回供应商',
      destroy: '销毁处理',
      discount_sale: '折价销售',
      internal_use: '内部使用',
    };

    const header = ['药品名称', '批号', '有效期', '当前库存', '处理方式', '处理数量', '备注', '状态'];
    const rows = listToExport.map((item) => [
      item.drugName,
      item.batchNo,
      item.expiryDate,
      item.currentQuantity,
      methodMap[item.processMethod] || item.processMethod,
      item.processQuantity,
      item.notes,
      item.status === 'pending' ? '待处理' : '已处理',
    ]);

    const csvContent = [header, ...rows].map((row) => row.join(',')).join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `近效期处理清单_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    message.success(`已导出 ${listToExport.length} 条记录`);
  };

  const handleConfirmProcess = (itemId: string) => {
    const processItem = processList.find((p) => p.id === itemId);
    if (!processItem) return;

    setProcessList((prev) =>
      prev.map((p) => (p.id === itemId ? { ...p, status: 'processed' as const } : p))
    );

    setData((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newQuantity = Math.max(0, item.quantity - processItem.processQuantity);
          const processRecord: ProcessRecord = {
            id: Date.now().toString(),
            date: new Date().toISOString().slice(0, 10),
            type: processItem.processMethod as any,
            quantity: processItem.processQuantity,
            notes: processItem.notes,
          };
          return {
            ...item,
            quantity: newQuantity,
            stock: newQuantity,
            status: newQuantity === 0 ? 'out_of_stock' : item.status,
            processRecords: [...(item.processRecords || []), processRecord],
          };
        }
        return item;
      })
    );

    message.success('处理完成，库存已更新');
  };

  const handleUpdateProcessItem = (itemId: string, field: string, value: any) => {
    setProcessList((prev) =>
      prev.map((p) => (p.id === itemId ? { ...p, [field]: value } : p))
    );
  };

  const inventoryColumns = [
    {
      title: '药品名称',
      dataIndex: 'drugName',
      key: 'drugName',
      width: 180,
      render: (name: string, record: InventoryItem) => (
        <div className="flex items-center gap-2">
          <Package size={16} className="text-blue-500" />
          <span className="font-medium">{name}</span>
          {record.isRx && <Tag color="red">Rx</Tag>}
        </div>
      ),
    },
    {
      title: '规格',
      dataIndex: 'spec',
      key: 'spec',
      width: 120,
    },
    {
      title: '批号',
      dataIndex: 'batchNo',
      key: 'batchNo',
      width: 120,
    },
    {
      title: '有效期',
      key: 'expiry',
      width: 140,
      render: (_: any, record: InventoryItem) => (
        <div>
          <p className="text-gray-800">{record.expiryDate}</p>
          {record.daysToExpiry !== undefined && record.daysToExpiry <= 180 && (
            <p className="text-xs text-orange-500">
              剩余 {record.daysToExpiry} 天
            </p>
          )}
        </div>
      ),
    },
    {
      title: '库存数量',
      key: 'quantity',
      width: 120,
      render: (_: any, record: InventoryItem) => (
        <div>
          <span className="font-medium">{record.quantity}</span>
          <span className="text-gray-500 text-sm"> {record.unit}</span>
        </div>
      ),
    },
    {
      title: '库存状态',
      key: 'status',
      width: 100,
      render: (_: any, record: InventoryItem) => (
        <Tag color={levelMap[record.status]?.color || 'default'}>
          {levelMap[record.status]?.text || '未知'}
        </Tag>
      ),
    },
    {
      title: '处理记录',
      key: 'processCount',
      width: 100,
      render: (_: any, record: InventoryItem) => {
        const count = record.processRecords?.length || 0;
        return count > 0 ? <Tag color="blue">{count}次</Tag> : <span className="text-gray-400">-</span>;
      },
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right' as const,
      width: 120,
      render: (_: any, record: InventoryItem) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<Eye size={14} />}
            onClick={() => {
              setSelectedItem(record);
              setIsDetailOpen(true);
            }}
          >
            详情
          </Button>
        </Space>
      ),
    },
  ];

  const pendingCount = processList.filter((p) => p.status === 'pending').length;

  return (
    <div className="space-y-6">
      <Row gutter={16}>
        <Col span={6}>
          <Card className="border-0 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">近效期预警</p>
                <p className="text-2xl font-bold text-orange-500">{nearExpiryItems.filter(i => i.quantity > 0).length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle size={24} className="text-orange-500" />
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="border-0 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">待处理清单</p>
                <p className="text-2xl font-bold text-red-500">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Clock size={24} className="text-red-500" />
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="border-0 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">总库存品种</p>
                <p className="text-2xl font-bold text-blue-500">{data.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package size={24} className="text-blue-500" />
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="border-0 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">冷链在途</p>
                <p className="text-2xl font-bold text-green-500">3</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Thermometer size={24} className="text-green-500" />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        className="border-0 shadow-sm"
        title="库存效期管理"
        extra={
          <Space>
            <Button
              icon={<FileText size={14} />}
              onClick={() => setIsProcessListOpen(true)}
              type={pendingCount > 0 ? 'primary' : 'default'}
            >
              处理清单 {pendingCount > 0 && `(${pendingCount})`}
            </Button>
            <Button
              type="primary"
              icon={<AlertTriangle size={14} />}
              onClick={() => setIsGenerateOpen(true)}
            >
              生成近效期处理单
            </Button>
          </Space>
        }
      >
        <div className="mb-4 flex gap-3">
          <Select defaultValue="all" style={{ width: 140 }}>
            <Option value="all">全部状态</Option>
            <Option value="normal">正常</Option>
            <Option value="warning">近效期</Option>
            <Option value="urgent">临效期</Option>
            <Option value="out_of_stock">已出清</Option>
          </Select>
          <Input.Search placeholder="搜索药品名称" style={{ width: 240 }} />
        </div>
        <Table
          columns={inventoryColumns}
          dataSource={data}
          rowKey="id"
          scroll={{ x: 1100 }}
          pagination={pagination}
          onChange={(p) => setPagination(p)}
        />
      </Card>

      <Modal
        title="生成近效期处理单"
        open={isGenerateOpen}
        onCancel={() => setIsGenerateOpen(false)}
        onOk={handleGenerateProcess}
        okText="生成处理清单"
        width={600}
      >
        <div className="space-y-4">
          <Alert
            message="即将生成近效期处理清单"
            description={`系统将自动筛选出 ${nearExpiryItems.filter(i => i.quantity > 0).length} 种近效期且未处理的药品。已处理或库存为0的药品将自动排除。`}
            type="info"
            showIcon
          />
          {nearExpiryItems.filter(i => i.quantity > 0).length > 0 && (
            <List
              size="small"
              bordered
              header={
                <div className="flex justify-between font-medium text-sm text-gray-600 px-2">
                  <span>药品名称</span>
                  <span>批号</span>
                  <span>有效期</span>
                  <span>数量</span>
                </div>
              }
              dataSource={nearExpiryItems.filter(i => i.quantity > 0)}
              renderItem={(item) => (
                <List.Item className="px-2">
                  <div className="flex justify-between w-full text-sm">
                    <span>{item.drugName}</span>
                    <span className="text-gray-500">{item.batchNo}</span>
                    <span className="text-orange-500">{item.expiryDate}</span>
                    <span>{item.quantity} {item.unit}</span>
                  </div>
                </List.Item>
              )}
            />
          )}
        </div>
      </Modal>

      <Modal
        title="近效期处理清单"
        open={isProcessListOpen}
        onCancel={() => setIsProcessListOpen(false)}
        width={1100}
        footer={
          <div className="flex justify-between">
            <Button icon={<Download size={14} />} onClick={handleExportProcessList}>
              导出当前筛选 ({filteredProcessList.length})
            </Button>
            <Button onClick={() => setIsProcessListOpen(false)}>关闭</Button>
          </div>
        }
        destroyOnClose
      >
        {processList.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">暂无处理清单</p>
            <p className="text-gray-400 text-sm mt-1">点击"生成近效期处理单"创建处理清单</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-400" />
                <span className="text-gray-600 text-sm">筛选：</span>
                <Select
                  value={processMethodFilter}
                  onChange={setProcessMethodFilter}
                  style={{ width: 120 }}
                  size="small"
                >
                  <Option value="all">全部方式</Option>
                  <Option value="return_supplier">退回供应商</Option>
                  <Option value="destroy">销毁处理</Option>
                  <Option value="discount_sale">折价销售</Option>
                  <Option value="internal_use">内部使用</Option>
                </Select>
                <Select
                  value={processStatusFilter}
                  onChange={setProcessStatusFilter}
                  style={{ width: 120 }}
                  size="small"
                >
                  <Option value="all">全部状态</Option>
                  <Option value="pending">待处理</Option>
                  <Option value="processed">已处理</Option>
                </Select>
              </div>
              <div>
                <Tag color="orange">待处理: {processList.filter(p => p.status === 'pending').length}</Tag>
                <Tag color="green">已处理: {processList.filter(p => p.status === 'processed').length}</Tag>
              </div>
            </div>
            <Table
              rowKey="id"
              dataSource={filteredProcessList}
              pagination={false}
              size="small"
              columns={[
                {
                  title: '药品名称',
                  dataIndex: 'drugName',
                  width: 150,
                },
                {
                  title: '批号',
                  dataIndex: 'batchNo',
                  width: 100,
                },
                {
                  title: '有效期',
                  dataIndex: 'expiryDate',
                  width: 100,
                  render: (date) => <span className="text-orange-500">{date}</span>,
                },
                {
                  title: '当前库存',
                  dataIndex: 'currentQuantity',
                  width: 80,
                },
                {
                  title: '处理方式',
                  dataIndex: 'processMethod',
                  width: 130,
                  render: (value, record) =>
                    record.status === 'processed' ? (
                      value === 'return_supplier' ? '退回供应商' :
                      value === 'destroy' ? '销毁处理' :
                      value === 'discount_sale' ? '折价销售' : '内部使用'
                    ) : (
                      <Select
                        value={value}
                        size="small"
                        style={{ width: '100%' }}
                        onChange={(v) => handleUpdateProcessItem(record.id, 'processMethod', v)}
                      >
                        <Option value="return_supplier">退回供应商</Option>
                        <Option value="destroy">销毁处理</Option>
                        <Option value="discount_sale">折价销售</Option>
                        <Option value="internal_use">内部使用</Option>
                      </Select>
                    ),
                },
                {
                  title: '处理数量',
                  dataIndex: 'processQuantity',
                  width: 100,
                  render: (value, record) =>
                    record.status === 'processed' ? (
                      value
                    ) : (
                      <InputNumber
                        value={value}
                        size="small"
                        min={1}
                        max={record.currentQuantity}
                        style={{ width: '100%' }}
                        onChange={(v) => handleUpdateProcessItem(record.id, 'processQuantity', v)}
                      />
                    ),
                },
                {
                  title: '备注',
                  dataIndex: 'notes',
                  width: 150,
                  render: (value, record) =>
                    record.status === 'processed' ? (
                      value || '-'
                    ) : (
                      <Input
                        value={value}
                        size="small"
                        placeholder="输入备注"
                        onChange={(e) => handleUpdateProcessItem(record.id, 'notes', e.target.value)}
                      />
                    ),
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  width: 80,
                  render: (status) => (
                    <Tag color={status === 'pending' ? 'orange' : 'green'}>
                      {status === 'pending' ? '待处理' : '已处理'}
                    </Tag>
                  ),
                },
                {
                  title: '操作',
                  key: 'action',
                  width: 100,
                  render: (_, record) =>
                    record.status === 'pending' ? (
                      <Button
                        type="primary"
                        size="small"
                        icon={<Check size={14} />}
                        onClick={() => handleConfirmProcess(record.id)}
                      >
                        确认处理
                      </Button>
                    ) : (
                      <span className="text-green-500">
                        <Check size={14} className="inline mr-1" />
                        已完成
                      </span>
                    ),
                },
              ]}
            />
          </div>
        )}
      </Modal>

      <Modal
        title="库存详情"
        open={isDetailOpen}
        onCancel={() => setIsDetailOpen(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        {selectedItem && (
          <div className="space-y-4">
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="药品名称">{selectedItem.drugName}</Descriptions.Item>
              <Descriptions.Item label="规格">{selectedItem.spec}</Descriptions.Item>
              <Descriptions.Item label="批号">{selectedItem.batchNo}</Descriptions.Item>
              <Descriptions.Item label="有效期">{selectedItem.expiryDate}</Descriptions.Item>
              <Descriptions.Item label="当前库存">
                {selectedItem.quantity} {selectedItem.unit}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={levelMap[selectedItem.status]?.color}>
                  {levelMap[selectedItem.status]?.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="供应商">{selectedItem.supplier || '-'}</Descriptions.Item>
              <Descriptions.Item label="入库日期">{selectedItem.stockInDate || '-'}</Descriptions.Item>
            </Descriptions>

            {selectedItem.processRecords && selectedItem.processRecords.length > 0 ? (
              <div>
                <p className="font-medium mb-2">
                  处理记录 <Tag color="blue">{selectedItem.processRecords.length}次</Tag>
                </p>
                <List
                  size="small"
                  bordered
                  dataSource={selectedItem.processRecords}
                  renderItem={(record: ProcessRecord) => {
                    const typeMap: Record<string, string> = {
                      return_supplier: '退回供应商',
                      destroy: '销毁处理',
                      discount_sale: '折价销售',
                      internal_use: '内部使用',
                    };
                    return (
                      <List.Item>
                        <div className="flex justify-between w-full items-center">
                          <div className="flex items-center gap-3">
                            <CheckCircle size={16} className="text-green-500" />
                            <span className="text-gray-500 text-sm">{record.date}</span>
                            <Tag color="blue">{typeMap[record.type] || record.type}</Tag>
                            <span className="text-red-500 font-medium">-{record.quantity}</span>
                          </div>
                          <span className="text-gray-400 text-sm">{record.notes || '无备注'}</span>
                        </div>
                      </List.Item>
                    );
                  }}
                />
              </div>
            ) : (
              <Alert message="暂无处理记录" type="info" showIcon />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InventoryPage;
