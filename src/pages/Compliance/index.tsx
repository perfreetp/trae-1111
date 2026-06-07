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
  Upload,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Progress,
  Row,
  Col,
  Timeline,
  Image,
} from 'antd';
import {
  Plus,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Upload as UploadIcon,
  FileText,
  Camera,
} from 'lucide-react';
import { complianceChecks, checkItemCategories } from '@/mock/compliance';
import type { ComplianceCheck, CheckItem } from '@/types';

const { Option } = Select;
const { TextArea } = Input;

const CompliancePage: React.FC = () => {
  const [data, setData] = useState(complianceChecks);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [currentCheck, setCurrentCheck] = useState<ComplianceCheck | null>(null);
  const [createForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('items');

  const statusMap: Record<string, { color: string; text: string }> = {
    pending: { color: 'default', text: '待开始' },
    inProgress: { color: 'processing', text: '进行中' },
    completed: { color: 'success', text: '已完成' },
  };

  const itemStatusMap: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
    pass: { color: 'green', text: '通过', icon: <CheckCircle size={16} /> },
    fail: { color: 'red', text: '不通过', icon: <XCircle size={16} /> },
    pending: { color: 'default', text: '待检查', icon: <Clock size={16} /> },
  };

  const columns = [
    {
      title: '检查名称',
      dataIndex: 'checkName',
      key: 'checkName',
      width: 220,
      render: (name: string) => (
        <span className="font-medium">{name}</span>
      ),
    },
    {
      title: '检查日期',
      dataIndex: 'checkDate',
      key: 'checkDate',
      width: 120,
    },
    {
      title: '门店',
      dataIndex: 'store',
      key: 'store',
      width: 100,
    },
    {
      title: '检查人',
      dataIndex: 'checker',
      key: 'checker',
      width: 120,
    },
    {
      title: '检查进度',
      key: 'progress',
      width: 200,
      render: (_: any, record: ComplianceCheck) => {
        const percent = record.totalItems > 0 ? Math.round((record.passItems + record.failItems) / record.totalItems * 100) : 0;
        return (
          <div>
            <Progress
              percent={percent}
              size="small"
              showInfo
              format={() => `${record.passItems + record.failItems}/${record.totalItems}`}
            />
          </div>
        );
      },
    },
    {
      title: '通过率',
      key: 'passRate',
      width: 100,
      render: (_: any, record: ComplianceCheck) => {
        const checked = record.passItems + record.failItems;
        const rate = checked > 0 ? Math.round(record.passItems / checked * 100) : 0;
        return (
          <Tag color={rate >= 90 ? 'green' : rate >= 70 ? 'orange' : 'red'}>
            {rate}%
          </Tag>
        );
      },
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_: any, record: ComplianceCheck) => (
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
      render: (_: any, record: ComplianceCheck) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleViewDetail(record)}>
            查看
          </Button>
          {record.status !== 'completed' && (
            <Button type="link" size="small">
              继续检查
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleViewDetail = (record: ComplianceCheck) => {
    setCurrentCheck(record);
    setIsDetailOpen(true);
  };

  const handleCreateSubmit = () => {
    createForm.validateFields().then((values) => {
      const newCheck: ComplianceCheck = {
        id: `CC${Date.now().toString().slice(-6)}`,
        checkName: values.checkName,
        checkDate: values.checkDate.format('YYYY-MM-DD'),
        store: values.store,
        checker: '当前用户',
        status: 'pending',
        totalItems: 20,
        passItems: 0,
        failItems: 0,
        checkItems: [],
      };
      setData([newCheck, ...data]);
      setIsCreateOpen(false);
      createForm.resetFields();
      message.success('自查任务创建成功');
    });
  };

  const handleExport = () => {
    message.success('质管台账已导出');
  };

  return (
    <div className="space-y-6">
      <Card
        className="border-0 shadow-sm"
        title="合规检查管理"
        extra={
          <Space>
            <Button icon={<Download size={14} />} onClick={handleExport}>
              导出台账
            </Button>
            <Button type="primary" icon={<Plus size={14} />} onClick={() => setIsCreateOpen(true)}>
              发起自查
            </Button>
          </Space>
        }
      >
        <div className="mb-4 flex gap-3">
          <Select defaultValue="all" style={{ width: 140 }}>
            <Option value="all">全部状态</Option>
            <Option value="pending">待开始</Option>
            <Option value="inProgress">进行中</Option>
            <Option value="completed">已完成</Option>
          </Select>
          <Select defaultValue="all" style={{ width: 140 }}>
            <Option value="all">全部门店</Option>
            <Option value="中心店">中心店</Option>
          </Select>
          <Input.Search placeholder="搜索检查名称" style={{ width: 240 }} />
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
        title="发起自查任务"
        open={isCreateOpen}
        onCancel={() => setIsCreateOpen(false)}
        onOk={handleCreateSubmit}
        width={500}
        okText="创建任务"
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            label="检查名称"
            name="checkName"
            rules={[{ required: true, message: '请输入检查名称' }]}
          >
            <Input placeholder="例如：2024年6月门店合规自查" />
          </Form.Item>
          <Form.Item
            label="检查日期"
            name="checkDate"
            rules={[{ required: true, message: '请选择检查日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label="门店"
            name="store"
            rules={[{ required: true, message: '请选择门店' }]}
          >
            <Select>
              <Option value="中心店">中心店</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="检查类别"
            name="categories"
          >
            <Select mode="multiple" placeholder="选择检查类别">
              {checkItemCategories.map((cat) => (
                <Option key={cat} value={cat}>{cat}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="检查详情"
        open={isDetailOpen}
        onCancel={() => setIsDetailOpen(false)}
        width={800}
        footer={null}
      >
        {currentCheck && (
          <div>
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-6 text-white mb-6">
              <Row align="middle">
                <Col span={4}>
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Shield size={28} />
                  </div>
                </Col>
                <Col span={14}>
                  <h3 className="text-xl font-bold mb-1">{currentCheck.checkName}</h3>
                  <p className="text-white/80">
                    {currentCheck.checkDate} · {currentCheck.store} · {currentCheck.checker}
                  </p>
                </Col>
                <Col span={6} className="text-right">
                  <Tag color="white" className="bg-white/20 text-white border-0">
                    {statusMap[currentCheck.status].text}
                  </Tag>
                  <div className="mt-2">
                    <span className="text-white/70 text-sm">通过率 </span>
                    <span className="font-bold text-xl">
                      {currentCheck.passItems + currentCheck.failItems > 0
                        ? Math.round(currentCheck.passItems / (currentCheck.passItems + currentCheck.failItems) * 100)
                        : 0}%
                    </span>
                  </div>
                </Col>
              </Row>
            </div>

            <Row gutter={16} className="mb-4">
              <Col span={8}>
                <Card size="small" className="text-center">
                  <p className="text-gray-500 text-sm">总检查项</p>
                  <p className="text-2xl font-bold text-gray-800">{currentCheck.totalItems}</p>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" className="text-center">
                  <p className="text-gray-500 text-sm">已通过</p>
                  <p className="text-2xl font-bold text-green-500">{currentCheck.passItems}</p>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" className="text-center">
                  <p className="text-gray-500 text-sm">待整改</p>
                  <p className="text-2xl font-bold text-red-500">{currentCheck.failItems}</p>
                </Card>
              </Col>
            </Row>

            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'items',
                  label: '检查项目',
                  children: (
                    <List
                      dataSource={currentCheck.checkItems}
                      renderItem={(item: CheckItem) => (
                        <List.Item className="px-4 py-3 bg-gray-50 rounded-lg mb-2">
                          <List.Item.Meta
                            avatar={
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  item.status === 'pass'
                                    ? 'bg-green-100 text-green-600'
                                    : item.status === 'fail'
                                    ? 'bg-red-100 text-red-600'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {itemStatusMap[item.status].icon}
                              </div>
                            }
                            title={
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{item.name}</span>
                                <Tag color="blue">{item.category}</Tag>
                              </div>
                            }
                            description={
                              <div className="space-y-2">
                                {item.problemDesc && (
                                  <p className="text-red-600">
                                    <span className="font-medium">问题：</span>
                                    {item.problemDesc}
                                  </p>
                                )}
                                {item.rectificationDesc && (
                                  <p className="text-orange-600">
                                    <span className="font-medium">整改：</span>
                                    {item.rectificationDesc}
                                  </p>
                                )}
                                {item.rectificationPhotos && item.rectificationPhotos.length > 0 && (
                                  <div className="flex gap-2 mt-2">
                                    {item.rectificationPhotos.map((photo, idx) => (
                                      <div
                                        key={idx}
                                        className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400"
                                      >
                                        <Camera size={20} />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            }
                          />
                          {item.status === 'fail' && (
                            <Button type="link" size="small">
                              上传整改
                            </Button>
                          )}
                        </List.Item>
                      )}
                    />
                  ),
                },
                {
                  key: 'timeline',
                  label: '整改记录',
                  children: (
                    <Timeline
                      items={[
                        {
                          color: 'green',
                          children: (
                            <div>
                              <p className="font-medium">检查发起</p>
                              <p className="text-gray-500 text-sm">
                                {currentCheck.checkDate} · {currentCheck.checker}
                              </p>
                            </div>
                          ),
                        },
                        ...currentCheck.checkItems
                          .filter((i) => i.status === 'fail')
                          .map((item, idx) => ({
                            color: 'red',
                            children: (
                              <div>
                                <p className="font-medium">发现问题：{item.name}</p>
                                <p className="text-gray-500 text-sm">{item.problemDesc}</p>
                              </div>
                            ),
                          })),
                        ...currentCheck.checkItems
                          .filter((i) => i.rectificationDesc)
                          .map((item, idx) => ({
                            color: 'blue',
                            children: (
                              <div>
                                <p className="font-medium">完成整改：{item.name}</p>
                                <p className="text-gray-500 text-sm">{item.rectificationDesc}</p>
                              </div>
                            ),
                          })),
                      ]}
                    />
                  ),
                },
                {
                  key: 'upload',
                  label: '上传整改照片',
                  children: (
                    <div>
                      <Upload
                        listType="picture-card"
                        multiple
                        beforeUpload={() => false}
                      >
                        <div>
                          <UploadIcon size={24} className="mx-auto mb-2 text-gray-400" />
                          <p className="text-gray-500">点击上传</p>
                        </div>
                      </Upload>
                      <p className="text-gray-400 text-sm mt-2">
                        支持上传整改现场照片，作为整改凭证
                      </p>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CompliancePage;
