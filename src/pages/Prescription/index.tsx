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
  InputNumber,
  Select,
  Row,
  Col,
  message,
  List,
  Alert,
} from 'antd';
import {
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  AlertOctagon,
} from 'lucide-react';
import { prescriptions } from '@/mock/prescription';
import type { Prescription, WarningItem } from '@/types';

const { TextArea } = Input;
const { Option } = Select;

const PrescriptionPage: React.FC = () => {
  const [data, setData] = useState(prescriptions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [currentPrescription, setCurrentPrescription] = useState<Prescription | null>(null);
  const [form] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [drugs, setDrugs] = useState<any[]>([]);

  const statusMap: Record<string, { color: string; text: string }> = {
    pending: { color: 'orange', text: '待审核' },
    approved: { color: 'green', text: '已通过' },
    rejected: { color: 'red', text: '已驳回' },
  };

  const getWarningIcon = (type: WarningItem['type'], level: WarningItem['level']) => {
    if (level === 'error') return <AlertOctagon size={16} className="text-red-500" />;
    return <AlertTriangle size={16} className="text-orange-500" />;
  };

  const columns = [
    {
      title: '处方编号',
      dataIndex: 'id',
      key: 'id',
      width: 140,
    },
    {
      title: '患者姓名',
      dataIndex: 'patientName',
      key: 'patientName',
      width: 100,
    },
    {
      title: '年龄/性别',
      key: 'ageGender',
      width: 100,
      render: (_: any, record: Prescription) => (
        <span>
          {record.patientAge}岁 / {record.patientGender === 'male' ? '男' : '女'}
        </span>
      ),
    },
    {
      title: '诊断',
      dataIndex: 'diagnosis',
      key: 'diagnosis',
      ellipsis: true,
    },
    {
      title: '药品数量',
      key: 'drugCount',
      width: 100,
      render: (_: any, record: Prescription) => (
        <Tag color="blue">{record.drugs.length}种</Tag>
      ),
    },
    {
      title: '预警',
      key: 'warnings',
      width: 80,
      render: (_: any, record: Prescription) => {
        const errorCount = record.warnings.filter((w) => w.level === 'error').length;
        const warningCount = record.warnings.filter((w) => w.level === 'warning').length;
        if (errorCount > 0) {
          return <Tag color="red">{errorCount}项错误</Tag>;
        }
        if (warningCount > 0) {
          return <Tag color="orange">{warningCount}项警告</Tag>;
        }
        return <Tag color="green">正常</Tag>;
      },
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_: any, record: Prescription) => (
        <Tag color={statusMap[record.status].color}>
          {statusMap[record.status].text}
        </Tag>
      ),
    },
    {
      title: '登记时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right' as const,
      render: (_: any, record: Prescription) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<Eye size={14} />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                type="link"
                size="small"
                icon={<CheckCircle size={14} />}
                onClick={() => handleApprove(record)}
                className="text-green-600"
              >
                通过
              </Button>
              <Button
                type="link"
                size="small"
                danger
                icon={<XCircle size={14} />}
                onClick={() => handleReject(record)}
              >
                驳回
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const handleView = (record: Prescription) => {
    setCurrentPrescription(record);
    setIsModalOpen(true);
  };

  const handleApprove = (record: Prescription) => {
    Modal.confirm({
      title: '确认审核通过',
      content: `确定要通过处方 ${record.id} 的审核吗？`,
      onOk: () => {
        setData((prev) =>
          prev.map((p) =>
            p.id === record.id
              ? { ...p, status: 'approved' as const, auditor: '当前药师', auditTime: new Date().toLocaleString() }
              : p
          )
        );
        message.success('审核通过');
      },
    });
  };

  const handleReject = (record: Prescription) => {
    Modal.confirm({
      title: '驳回处方',
      content: (
        <Form>
          <Form.Item label="驳回原因" name="rejectReason">
            <TextArea rows={3} placeholder="请输入驳回原因" />
          </Form.Item>
        </Form>
      ),
      onOk: () => {
        setData((prev) =>
          prev.map((p) =>
            p.id === record.id
              ? { ...p, status: 'rejected' as const, auditor: '当前药师', auditTime: new Date().toLocaleString() }
              : p
          )
        );
        message.success('已驳回');
      },
    });
  };

  const handleAddDrug = () => {
    const newDrug = {
      id: Date.now().toString(),
      drugName: '',
      spec: '',
      dosage: '',
      frequency: '每日1次',
      quantity: 1,
      isRx: true,
    };
    setDrugs([...drugs, newDrug]);
  };

  const handleRegisterSubmit = () => {
    registerForm.validateFields().then((values) => {
      const newPrescription: Prescription = {
        id: `RX${Date.now().toString().slice(-8)}`,
        ...values,
        drugs: drugs.filter((d) => d.drugName),
        doctor: '当前医生',
        createTime: new Date().toLocaleString(),
        status: 'pending',
        warnings: [],
      };
      setData([newPrescription, ...data]);
      setIsRegisterOpen(false);
      registerForm.resetFields();
      setDrugs([]);
      message.success('处方登记成功');
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm" title="处方审核工作台">
        <div className="mb-4 flex justify-between items-center">
          <Space>
            <Select defaultValue="all" style={{ width: 120 }} size="middle">
              <Option value="all">全部状态</Option>
              <Option value="pending">待审核</Option>
              <Option value="approved">已通过</Option>
              <Option value="rejected">已驳回</Option>
            </Select>
            <Input.Search placeholder="搜索患者姓名/处方号" style={{ width: 240 }} />
          </Space>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={() => setIsRegisterOpen(true)}
          >
            登记处方
          </Button>
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
        title="处方详情"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={700}
        footer={null}
      >
        {currentPrescription && (
          <div className="space-y-4">
            {currentPrescription.warnings.length > 0 && (
              <Alert
                message="智能审查预警"
                description={
                  <List
                    size="small"
                    dataSource={currentPrescription.warnings}
                    renderItem={(item) => (
                      <List.Item className="px-0">
                        <div className="flex items-start gap-2">
                          {getWarningIcon(item.type, item.level)}
                          <span className={item.level === 'error' ? 'text-red-600' : 'text-orange-600'}>
                            {item.message}
                          </span>
                        </div>
                      </List.Item>
                    )}
                  />
                }
                type={currentPrescription.warnings.some((w) => w.level === 'error') ? 'error' : 'warning'}
                showIcon
              />
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <Row gutter={16}>
                <Col span={12}>
                  <p className="text-gray-500 text-sm">处方编号</p>
                  <p className="font-medium">{currentPrescription.id}</p>
                </Col>
                <Col span={12}>
                  <p className="text-gray-500 text-sm">登记时间</p>
                  <p className="font-medium">{currentPrescription.createTime}</p>
                </Col>
                <Col span={12}>
                  <p className="text-gray-500 text-sm">患者姓名</p>
                  <p className="font-medium">{currentPrescription.patientName}</p>
                </Col>
                <Col span={12}>
                  <p className="text-gray-500 text-sm">年龄/性别</p>
                  <p className="font-medium">
                    {currentPrescription.patientAge}岁 / {currentPrescription.patientGender === 'male' ? '男' : '女'}
                  </p>
                </Col>
                <Col span={24}>
                  <p className="text-gray-500 text-sm">诊断</p>
                  <p className="font-medium">{currentPrescription.diagnosis}</p>
                </Col>
              </Row>
            </div>

            <div>
              <p className="text-gray-700 font-medium mb-2">药品清单</p>
              <List
                bordered
                dataSource={currentPrescription.drugs}
                renderItem={(drug) => (
                  <List.Item className="flex justify-between">
                    <div>
                      <span className="font-medium">{drug.drugName}</span>
                      <span className="text-gray-500 ml-2">{drug.spec}</span>
                      {drug.isRx && <Tag color="red" className="ml-2">Rx</Tag>}
                    </div>
                    <span className="text-gray-600">
                      {drug.dosage}，{drug.frequency} × {drug.quantity}盒
                    </span>
                  </List.Item>
                )}
              />
            </div>

            <Row gutter={16}>
              <Col span={12}>
                <p className="text-gray-500 text-sm">开方医生</p>
                <p className="font-medium">{currentPrescription.doctor}</p>
              </Col>
              <Col span={12}>
                <p className="text-gray-500 text-sm">状态</p>
                <Tag color={statusMap[currentPrescription.status].color}>
                  {statusMap[currentPrescription.status].text}
                </Tag>
              </Col>
            </Row>

            {currentPrescription.status !== 'pending' && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <Row gutter={16}>
                  <Col span={12}>
                    <p className="text-gray-500 text-sm">审核药师</p>
                    <p className="font-medium">{currentPrescription.auditor}</p>
                  </Col>
                  <Col span={12}>
                    <p className="text-gray-500 text-sm">审核时间</p>
                    <p className="font-medium">{currentPrescription.auditTime}</p>
                  </Col>
                  {currentPrescription.rejectReason && (
                    <Col span={24}>
                      <p className="text-gray-500 text-sm">驳回原因</p>
                      <p className="font-medium text-red-600">{currentPrescription.rejectReason}</p>
                    </Col>
                  )}
                </Row>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title="登记处方"
        open={isRegisterOpen}
        onCancel={() => setIsRegisterOpen(false)}
        onOk={handleRegisterSubmit}
        width={800}
        okText="提交审核"
      >
        <Form form={registerForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="患者姓名"
                name="patientName"
                rules={[{ required: true, message: '请输入患者姓名' }]}
              >
                <Input placeholder="请输入患者姓名" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="年龄"
                name="patientAge"
                rules={[{ required: true, message: '请输入年龄' }]}
              >
                <InputNumber min={0} max={120} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="性别"
                name="patientGender"
                rules={[{ required: true, message: '请选择性别' }]}
              >
                <Select>
                  <Option value="male">男</Option>
                  <Option value="female">女</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="诊断"
            name="diagnosis"
            rules={[{ required: true, message: '请输入诊断' }]}
          >
            <Input placeholder="请输入诊断信息" />
          </Form.Item>

          <div className="mb-2 flex justify-between items-center">
            <span className="font-medium">药品清单</span>
            <Button type="dashed" size="small" onClick={handleAddDrug}>
              + 添加药品
            </Button>
          </div>
          {drugs.length === 0 && (
            <div className="text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-lg mb-4">
              请点击上方按钮添加药品
            </div>
          )}
          {drugs.map((drug, index) => (
            <div key={drug.id} className="p-3 bg-gray-50 rounded-lg mb-2">
              <Row gutter={8} align="middle">
                <Col span={8}>
                  <Input
                    placeholder="药品名称"
                    value={drug.drugName}
                    onChange={(e) => {
                      const newDrugs = [...drugs];
                      newDrugs[index].drugName = e.target.value;
                      setDrugs(newDrugs);
                    }}
                  />
                </Col>
                <Col span={5}>
                  <Input
                    placeholder="规格"
                    value={drug.spec}
                    onChange={(e) => {
                      const newDrugs = [...drugs];
                      newDrugs[index].spec = e.target.value;
                      setDrugs(newDrugs);
                    }}
                  />
                </Col>
                <Col span={4}>
                  <Input
                    placeholder="剂量"
                    value={drug.dosage}
                    onChange={(e) => {
                      const newDrugs = [...drugs];
                      newDrugs[index].dosage = e.target.value;
                      setDrugs(newDrugs);
                    }}
                  />
                </Col>
                <Col span={4}>
                  <InputNumber
                    placeholder="数量"
                    min={1}
                    value={drug.quantity}
                    onChange={(v) => {
                      const newDrugs = [...drugs];
                      newDrugs[index].quantity = v || 1;
                      setDrugs(newDrugs);
                    }}
                    style={{ width: '100%' }}
                  />
                </Col>
                <Col span={3}>
                  <Button
                    type="text"
                    danger
                    size="small"
                    onClick={() => setDrugs(drugs.filter((_, i) => i !== index))}
                  >
                    删除
                  </Button>
                </Col>
              </Row>
            </div>
          ))}
        </Form>
      </Modal>
    </div>
  );
};

export default PrescriptionPage;
