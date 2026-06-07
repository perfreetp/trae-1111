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
  InputNumber,
  Select,
  Row,
  Col,
  message,
  List,
  Alert,
  Checkbox,
  AutoComplete,
} from 'antd';
import {
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  AlertOctagon,
  RefreshCw,
  Pill,
  X,
  Search,
} from 'lucide-react';
import { prescriptions as initialPrescriptions } from '@/mock/prescription';
import { members } from '@/mock/member';
import { drugLibrary, searchDrugs } from '@/mock/drugLibrary';
import type { Prescription, WarningItem, PrescriptionDrug, Member } from '@/types';
import { runFullDrugReview, getRiskLevel, getRiskLevelInfo, type ReviewResult } from '@/utils/drugReview';
import type { DrugLibraryItem } from '@/mock/drugLibrary';

const { TextArea } = Input;
const { Option } = Select;

const allergyOptions = [
  { label: '青霉素过敏', value: '青霉素过敏' },
  { label: '头孢过敏', value: '头孢过敏' },
  { label: '磺胺过敏', value: '磺胺过敏' },
  { label: '大环内酯过敏', value: '大环内酯过敏' },
  { label: '喹诺酮过敏', value: '喹诺酮过敏' },
];

const PrescriptionPage: React.FC = () => {
  const [data, setData] = useState<Prescription[]>(initialPrescriptions);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [currentPrescription, setCurrentPrescription] = useState<Prescription | null>(null);
  const [registerForm] = Form.useForm();
  const [drugs, setDrugs] = useState<PrescriptionDrug[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [previewWarnings, setPreviewWarnings] = useState<ReviewResult[]>([]);

  const statusMap: Record<string, { color: string; text: string }> = {
    pending: { color: 'orange', text: '待审核' },
    approved: { color: 'green', text: '已通过' },
    rejected: { color: 'red', text: '已驳回' },
  };

  const getWarningIcon = (type: WarningItem['type'], level: WarningItem['level']) => {
    if (level === 'error') return <AlertOctagon size={16} className="text-red-500" />;
    return <AlertTriangle size={16} className="text-orange-500" />;
  };

  const selectedMember = useMemo(() => {
    return members.find((m) => m.id === selectedMemberId);
  }, [selectedMemberId]);

  const purchaseHistory = useMemo(() => {
    return selectedMember?.purchaseRecords || [];
  }, [selectedMember]);

  const handleAddDrugFromLibrary = (drugItem: DrugLibraryItem) => {
    const newDrug: PrescriptionDrug = {
      id: Date.now().toString(),
      drugName: drugItem.drugName,
      spec: drugItem.spec,
      dosage: drugItem.commonDosage,
      frequency: drugItem.commonFrequency,
      quantity: 1,
      isRx: drugItem.isRx,
    };
    setDrugs([...drugs, newDrug]);
  };

  const handleRemoveDrug = (drugId: string) => {
    setDrugs(drugs.filter((d) => d.id !== drugId));
  };

  const handleUpdateDrug = (drugId: string, field: keyof PrescriptionDrug, value: any) => {
    setDrugs(drugs.map((d) => (d.id === drugId ? { ...d, [field]: value } : d)));
  };

  const handleRunReview = () => {
    const validDrugs = drugs.filter((d) => d.drugName.trim());
    if (validDrugs.length === 0) {
      message.warning('请先添加药品');
      return;
    }
    const warnings = runFullDrugReview(validDrugs, purchaseHistory, allergies);
    setPreviewWarnings(warnings);
    if (warnings.length === 0) {
      message.success('智能审查通过，未发现用药风险');
    } else {
      const errorCount = warnings.filter((w) => w.level === 'error').length;
      const warningCount = warnings.filter((w) => w.level === 'warning').length;
      message.warning(`发现 ${errorCount} 项严重禁忌，${warningCount} 项提醒`);
    }
  };

  const handleRegisterSubmit = () => {
    registerForm.validateFields().then((values) => {
      const validDrugs = drugs.filter((d) => d.drugName.trim());
      if (validDrugs.length === 0) {
        message.warning('请至少添加一种药品');
        return;
      }

      const warnings = runFullDrugReview(validDrugs, purchaseHistory, allergies);
      const riskLevel = getRiskLevel(warnings);

      const newPrescription: Prescription = {
        id: `RX${Date.now().toString().slice(-6)}`,
        patientName: values.patientName,
        patientAge: values.patientAge,
        patientGender: values.patientGender,
        diagnosis: values.diagnosis,
        drugs: validDrugs,
        doctor: values.doctor,
        createTime: new Date().toISOString().slice(0, 10),
        status: 'pending',
        warnings: warnings as WarningItem[],
        riskLevel,
        memberId: selectedMemberId || undefined,
        allergies: allergies.length > 0 ? allergies : undefined,
      };

      setData([newPrescription, ...data]);
      setIsRegisterOpen(false);
      registerForm.resetFields();
      setDrugs([]);
      setAllergies([]);
      setSelectedMemberId('');
      setPreviewWarnings([]);
      message.success('处方登记成功');
    });
  };

  const handleViewDetail = (record: Prescription) => {
    const freshRecord = data.find((p) => p.id === record.id);
    setCurrentPrescription(freshRecord || record);
    setIsDetailOpen(true);
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
      key: 'age',
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
      width: 150,
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
      title: '风险等级',
      key: 'riskLevel',
      width: 110,
      render: (_: any, record: Prescription) => {
        const level = record.riskLevel || getRiskLevel(record.warnings as ReviewResult[]);
        const info = getRiskLevelInfo(level);
        return <Tag color={info.color}>{info.icon} {info.text}</Tag>;
      },
    },
    {
      title: '预警',
      key: 'warnings',
      width: 100,
      render: (_: any, record: Prescription) => {
        if (record.warnings.length === 0) {
          return <Tag color="green">无</Tag>;
        }
        const errorCount = record.warnings.filter((w) => w.level === 'error').length;
        const warningCount = record.warnings.filter((w) => w.level === 'warning').length;
        return (
          <Space size={4}>
            {errorCount > 0 && <Tag color="red">禁忌{errorCount}</Tag>}
            {warningCount > 0 && <Tag color="orange">提醒{warningCount}</Tag>}
          </Space>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right' as const,
      width: 150,
      render: (_: any, record: Prescription) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<Eye size={14} />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                type="link"
                size="small"
                icon={<CheckCircle size={14} />}
                className="text-green-500"
              >
                通过
              </Button>
              <Button
                type="link"
                size="small"
                icon={<XCircle size={14} />}
                className="text-red-500"
              >
                驳回
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card
        className="border-0 shadow-sm"
        title="处方审核"
        extra={
          <Button
            type="primary"
            icon={<Plus size={14} />}
            onClick={() => setIsRegisterOpen(true)}
          >
            登记处方
          </Button>
        }
      >
        <div className="mb-4 flex gap-3">
          <Select defaultValue="all" style={{ width: 140 }}>
            <Option value="all">全部状态</Option>
            <Option value="pending">待审核</Option>
            <Option value="approved">已通过</Option>
            <Option value="rejected">已驳回</Option>
          </Select>
          <Select defaultValue="all" style={{ width: 140 }}>
            <Option value="all">全部风险</Option>
            <Option value="high">高风险</Option>
            <Option value="medium">中风险</Option>
            <Option value="low">低风险</Option>
          </Select>
          <Input.Search placeholder="搜索患者姓名/处方号" style={{ width: 240 }} />
        </div>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          scroll={{ x: 1100 }}
          pagination={{ pageSize: 8 }}
        />
      </Card>

      <Modal
        title="登记新处方"
        open={isRegisterOpen}
        onCancel={() => {
          setIsRegisterOpen(false);
          setDrugs([]);
          setAllergies([]);
          setSelectedMemberId('');
          setPreviewWarnings([]);
        }}
        onOk={handleRegisterSubmit}
        width={900}
        okText="提交审核"
        destroyOnClose
      >
        <Form form={registerForm} layout="vertical">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="患者姓名"
                name="patientName"
                rules={[{ required: true, message: '请输入患者姓名' }]}
              >
                <Input placeholder="请输入患者姓名" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="年龄"
                name="patientAge"
                rules={[{ required: true, message: '请输入年龄' }]}
              >
                <InputNumber min={0} max={120} style={{ width: '100%' }} placeholder="岁" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="性别"
                name="patientGender"
                rules={[{ required: true, message: '请选择性别' }]}
              >
                <Select placeholder="请选择">
                  <Option value="male">男</Option>
                  <Option value="female">女</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="诊断"
                name="diagnosis"
                rules={[{ required: true, message: '请输入诊断' }]}
              >
                <Input placeholder="如：上呼吸道感染" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="开具医生"
                name="doctor"
                rules={[{ required: true, message: '请输入医生姓名' }]}
              >
                <Input placeholder="请输入医生姓名" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="关联会员（用于获取购药历史）">
            <Select
              allowClear
              placeholder="选择关联会员（可选）"
              value={selectedMemberId}
              onChange={(value) => setSelectedMemberId(value)}
              showSearch
              optionFilterProp="children"
            >
              {members.map((m) => (
                <Option key={m.id} value={m.id}>
                  {m.name} - {m.phone}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="过敏史">
            <Checkbox.Group
              value={allergies}
              onChange={(v) => setAllergies(v as string[])}
            >
              <Space wrap>
                {allergyOptions.map((opt) => (
                  <Checkbox key={opt.value} value={opt.value}>
                    {opt.label}
                  </Checkbox>
                ))}
              </Space>
            </Checkbox.Group>
          </Form.Item>

          <div className="mb-2">
            <div className="flex justify-between items-center mb-2">
              <label className="font-medium text-gray-700">处方药品</label>
              <Space>
                <Button
                  type="primary"
                  size="small"
                  icon={<RefreshCw size={12} />}
                  onClick={handleRunReview}
                >
                  预审查
                </Button>
              </Space>
            </div>

            <div className="mb-3">
              <AutoComplete
                placeholder="搜索药品名称快速添加（支持拼音、通用名）"
                size="large"
                style={{ width: '100%' }}
                onSelect={(_, option) => {
                  if (option.drug) {
                    handleAddDrugFromLibrary(option.drug as DrugLibraryItem);
                  }
                }}
                options={drugLibrary.map((drug) => ({
                  value: drug.drugName,
                  label: (
                    <div className="flex justify-between items-center py-1">
                      <div className="flex items-center gap-2">
                        <Pill size={14} className={drug.isRx ? 'text-red-500' : 'text-green-500'} />
                        <span className="font-medium">{drug.drugName}</span>
                        <span className="text-gray-400 text-sm">{drug.spec}</span>
                      </div>
                      <span className="text-xs">
                        {drug.isRx ? <Tag color="red">Rx</Tag> : <Tag color="green">OTC</Tag>}
                      </span>
                    </div>
                  ),
                  drug: drug,
                }))}
              >
                <Input prefix={<Search size={16} className="text-gray-400" />} />
              </AutoComplete>
            </div>

            {previewWarnings.length > 0 && (
              <Alert
                message="智能审查结果"
                description={
                  <List
                    size="small"
                    dataSource={previewWarnings}
                    renderItem={(item) => (
                      <List.Item className="px-0 py-1">
                        <div className="flex flex-col gap-1 w-full">
                          <div className="flex items-start gap-2">
                            {getWarningIcon(item.type, item.level)}
                            <span className={item.level === 'error' ? 'text-red-600' : 'text-orange-600'}>
                              {item.message}
                            </span>
                          </div>
                          {item.suggestion && (
                            <div className="ml-6 text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              💡 {item.suggestion}
                            </div>
                          )}
                        </div>
                      </List.Item>
                    )}
                  />
                }
                type={previewWarnings.some((w) => w.level === 'error') ? 'error' : 'warning'}
                showIcon
                className="mb-3"
              />
            )}

            {drugs.length === 0 && (
              <div className="text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-lg mb-4">
                请在上方搜索框搜索药品添加
              </div>
            )}
            {drugs.map((drug, index) => (
              <div key={drug.id} className="p-3 bg-gray-50 rounded-lg mb-2">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Pill size={14} className={drug.isRx ? 'text-red-500' : 'text-green-500'} />
                    <span className="font-medium">{drug.drugName}</span>
                    {drug.isRx && <Tag color="red">Rx</Tag>}
                    <span className="text-gray-500 text-sm">{drug.spec}</span>
                  </div>
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<X size={14} />}
                    onClick={() => handleRemoveDrug(drug.id)}
                  />
                </div>
                <Row gutter={8}>
                  <Col span={6}>
                    <Input
                      size="small"
                      placeholder="剂量"
                      value={drug.dosage}
                      onChange={(e) => handleUpdateDrug(drug.id, 'dosage', e.target.value)}
                    />
                  </Col>
                  <Col span={6}>
                    <Input
                      size="small"
                      placeholder="频次"
                      value={drug.frequency}
                      onChange={(e) => handleUpdateDrug(drug.id, 'frequency', e.target.value)}
                    />
                  </Col>
                  <Col span={6}>
                    <InputNumber
                      size="small"
                      min={1}
                      placeholder="数量"
                      value={drug.quantity}
                      onChange={(v) => handleUpdateDrug(drug.id, 'quantity', v)}
                      style={{ width: '100%' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Select
                      size="small"
                      value={drug.isRx ? true : false}
                      onChange={(v) => handleUpdateDrug(drug.id, 'isRx', v)}
                    >
                      <Option value={false}>OTC</Option>
                      <Option value={true}>Rx处方药</Option>
                    </Select>
                  </Col>
                </Row>
              </div>
            ))}
          </div>
        </Form>
      </Modal>

      <Modal
        title="处方详情"
        open={isDetailOpen}
        onCancel={() => setIsDetailOpen(false)}
        width={800}
        footer={null}
        destroyOnClose
      >
        {currentPrescription && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">{currentPrescription.id}</h3>
                  <p className="text-white/80 mt-1">{currentPrescription.createTime}</p>
                </div>
                <div>
                  <Tag color="white" className="bg-white/20 text-white border-0">
                    {statusMap[currentPrescription.status].text}
                  </Tag>
                </div>
              </div>
            </div>

            <Row gutter={16}>
              <Col span={6}>
                <Card size="small">
                  <p className="text-gray-500 text-sm">患者</p>
                  <p className="font-bold text-lg">
                    {currentPrescription.patientName}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {currentPrescription.patientAge}岁 / {currentPrescription.patientGender === 'male' ? '男' : '女'}
                  </p>
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <p className="text-gray-500 text-sm">诊断</p>
                  <p className="font-bold text-lg">{currentPrescription.diagnosis}</p>
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <p className="text-gray-500 text-sm">医生</p>
                  <p className="font-bold text-lg">{currentPrescription.doctor}</p>
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <p className="text-gray-500 text-sm">风险等级</p>
                  <p className="font-bold text-lg">
                    {(() => {
                      const level = currentPrescription.riskLevel || getRiskLevel(currentPrescription.warnings as ReviewResult[]);
                      const info = getRiskLevelInfo(level);
                      return <span className={info.color === 'red' ? 'text-red-500' : info.color === 'orange' ? 'text-orange-500' : info.color === 'yellow' ? 'text-yellow-500' : 'text-green-500'}>{info.icon} {info.text}</span>;
                    })()}
                  </p>
                </Card>
              </Col>
            </Row>

            {currentPrescription.allergies && currentPrescription.allergies.length > 0 && (
              <Alert
                message="患者过敏史"
                description={currentPrescription.allergies.join('、')}
                type="warning"
                showIcon
              />
            )}

            <div>
              <p className="font-medium mb-2">处方药品</p>
              <List
                bordered
                dataSource={currentPrescription.drugs}
                renderItem={(drug) => (
                  <List.Item className="px-4 py-3">
                    <div className="flex justify-between w-full items-center">
                      <div className="flex items-center gap-3">
                        <Pill size={16} className={drug.isRx ? 'text-red-500' : 'text-green-500'} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{drug.drugName}</span>
                            {drug.isRx && <Tag color="red">Rx</Tag>}
                          </div>
                          <span className="text-gray-500 text-sm">{drug.spec}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-800">{drug.dosage} {drug.frequency}</p>
                        <p className="text-gray-500 text-sm">数量: {drug.quantity}</p>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </div>

            {currentPrescription.warnings.length > 0 && (
              <div>
                <p className="font-medium mb-2">智能审查预警</p>
                <Alert
                  message={`发现 ${currentPrescription.warnings.length} 项用药风险`}
                  description={
                    <List
                      size="small"
                      dataSource={currentPrescription.warnings as ReviewResult[]}
                      renderItem={(item) => (
                        <List.Item className="px-0 py-2">
                          <div className="flex flex-col gap-1 w-full">
                            <div className="flex items-start gap-2">
                              {getWarningIcon(item.type, item.level)}
                              <span className={item.level === 'error' ? 'text-red-600 font-medium' : 'text-orange-600'}>
                                {item.message}
                              </span>
                            </div>
                            {item.suggestion && (
                              <div className="ml-6 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded border-l-2 border-blue-400">
                                <span className="font-medium">处理建议：</span>{item.suggestion}
                              </div>
                            )}
                          </div>
                        </List.Item>
                      )}
                    />
                  }
                  type={currentPrescription.warnings.some((w) => w.level === 'error') ? 'error' : 'warning'}
                  showIcon
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PrescriptionPage;
