import React, { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Input,
  Space,
  Modal,
  Form,
  Row,
  Col,
  Avatar,
  Tabs,
  List,
  Switch,
  TimePicker,
  Select,
  message,
  AutoComplete,
  Descriptions,
  Badge,
  Popconfirm,
} from 'antd';
import {
  Search,
  Phone,
  Calendar,
  Clock,
  Bell,
  User,
  ShoppingBag,
  Plus,
  Pill,
  AlertTriangle,
  Activity,
  Pause,
  Play,
  Trash2,
  X,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { members as initialMembers } from '@/mock/member';
import { prescriptions } from '@/mock/prescription';
import { chronicRecords } from '@/mock/chronic';
import { drugLibrary } from '@/mock/drugLibrary';
import type { Member, MedicationReminder, Prescription } from '@/types';
import { getRiskLevel, getRiskLevelInfo, type ReviewResult } from '@/utils/drugReview';
import dayjs from 'dayjs';

const { Option } = Select;

const MemberPage: React.FC = () => {
  const [data, setData] = useState<Member[]>(initialMembers);
  const [searchText, setSearchText] = useState('');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [reminderForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('overview');

  const levelMap: Record<string, { color: string; text: string }> = {
    normal: { color: 'default', text: '普通会员' },
    silver: { color: 'geekblue', text: '银卡会员' },
    gold: { color: 'gold', text: '金卡会员' },
    platinum: { color: 'purple', text: '钻石卡' },
  };

  const memberPrescriptions = useMemo(() => {
    if (!currentMember) return [];
    return prescriptions.filter((p) => p.patientName === currentMember.name);
  }, [currentMember]);

  const memberChronicRecords = useMemo(() => {
    if (!currentMember) return [];
    return chronicRecords.filter((r) => r.patientName === currentMember.name);
  }, [currentMember]);

  const recentPrescriptionRisk = useMemo(() => {
    if (memberPrescriptions.length === 0) return null;
    const latest = memberPrescriptions[0];
    return getRiskLevel(latest.warnings as ReviewResult[]);
  }, [memberPrescriptions]);

  const availableDrugsForReminder = useMemo(() => {
    const drugs = new Set<string>();
    
    if (currentMember) {
      currentMember.purchaseRecords.forEach((record) => {
        record.drugs.forEach((d) => drugs.add(d));
      });
    }
    
    memberPrescriptions.forEach((p) => {
      p.drugs.forEach((d) => drugs.add(d.drugName));
    });
    
    drugLibrary.forEach((d) => drugs.add(d.drugName));
    
    return Array.from(drugs).slice(0, 50);
  }, [currentMember, memberPrescriptions]);

  const filteredData = data.filter(
    (m) =>
      m.name.includes(searchText) ||
      m.phone.includes(searchText) ||
      m.id.includes(searchText)
  );

  const columns = [
    {
      title: '会员ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '会员信息',
      key: 'info',
      width: 200,
      render: (_: any, record: Member) => (
        <div className="flex items-center gap-3">
          <Avatar size={40} className="bg-blue-500">
            <User size={20} />
          </Avatar>
          <div>
            <p className="font-medium text-gray-800">{record.name}</p>
            <p className="text-sm text-gray-500">{record.phone}</p>
          </div>
        </div>
      ),
    },
    {
      title: '会员等级',
      key: 'level',
      width: 120,
      render: (_: any, record: Member) => (
        <Tag color={levelMap[record.memberLevel].color}>
          {levelMap[record.memberLevel].text}
        </Tag>
      ),
    },
    {
      title: '健康标签',
      key: 'healthTags',
      width: 180,
      render: (_: any, record: Member) => {
        const hasHypertension = record.tags.some((t) => t.includes('高血压') || t.includes('血压'));
        const hasDiabetes = record.tags.some((t) => t.includes('糖尿病') || t.includes('血糖'));
        const hasAllergy = record.tags.some((t) => t.includes('过敏'));
        return (
          <Space wrap>
            {hasHypertension && <Tag color="red">高血压</Tag>}
            {hasDiabetes && <Tag color="orange">糖尿病</Tag>}
            {hasAllergy && <Tag color="purple">过敏史</Tag>}
          </Space>
        );
      },
    },
    {
      title: '累计消费',
      dataIndex: 'totalConsumption',
      key: 'totalConsumption',
      width: 120,
      render: (val: number) => <span className="font-medium">¥{val.toLocaleString()}</span>,
    },
    {
      title: '用药提醒',
      key: 'reminders',
      width: 100,
      render: (_: any, record: Member) => {
        const activeCount = record.medicationReminders.filter((r) => r.enabled).length;
        return (
          <span>
            <Badge count={activeCount} showZero>
              <Bell size={18} className="text-blue-500" />
            </Badge>
          </span>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right' as const,
      width: 120,
      render: (_: any, record: Member) => (
        <Button type="link" onClick={() => handleViewDetail(record)}>
          查看详情
        </Button>
      ),
    },
  ];

  const handleViewDetail = (record: Member) => {
    const freshMember = data.find((m) => m.id === record.id);
    setCurrentMember(freshMember || record);
    setActiveTab('overview');
    setIsDetailOpen(true);
  };

  const handleAddReminder = () => {
    reminderForm.validateFields().then((values) => {
      if (!currentMember) return;

      const times = values.time as dayjs.Dayjs[];
      const timeStr = times ? times.map((t) => t.format('HH:mm')).join(',') : '';

      const newReminder: MedicationReminder = {
        id: Date.now().toString(),
        drugName: values.drugName,
        time: timeStr,
        frequency: values.frequency,
        enabled: true,
      };

      const updatedMember = {
        ...currentMember,
        medicationReminders: [...currentMember.medicationReminders, newReminder],
      };

      setData((prev) => prev.map((m) => (m.id === currentMember.id ? updatedMember : m)));
      setCurrentMember(updatedMember);
      reminderForm.resetFields();
      message.success('用药提醒已添加');
    });
  };

  const handleToggleReminder = (reminderId: string) => {
    if (!currentMember) return;

    const updatedReminders = currentMember.medicationReminders.map((r) =>
      r.id === reminderId ? { ...r, enabled: !r.enabled } : r
    );

    const updatedMember = {
      ...currentMember,
      medicationReminders: updatedReminders,
    };

    setData((prev) => prev.map((m) => (m.id === currentMember.id ? updatedMember : m)));
    setCurrentMember(updatedMember);
    const reminder = updatedReminders.find((r) => r.id === reminderId);
    message.success(reminder?.enabled ? '提醒已恢复' : '提醒已暂停');
  };

  const handleDeleteReminder = (reminderId: string) => {
    if (!currentMember) return;

    const updatedReminders = currentMember.medicationReminders.filter((r) => r.id !== reminderId);

    const updatedMember = {
      ...currentMember,
      medicationReminders: updatedReminders,
    };

    setData((prev) => prev.map((m) => (m.id === currentMember.id ? updatedMember : m)));
    setCurrentMember(updatedMember);
    message.success('提醒已删除');
  };

  const handleSelectDrugForReminder = (drugName: string) => {
    reminderForm.setFieldsValue({ drugName });
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm" title="会员服务">
        <div className="mb-4 flex justify-between items-center">
          <Space>
            <Input
              prefix={<Search size={16} className="text-gray-400" />}
              placeholder="搜索会员姓名/手机号/会员ID"
              style={{ width: 320 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
            <Select defaultValue="all" style={{ width: 140 }}>
              <Option value="all">全部等级</Option>
              <Option value="normal">普通会员</Option>
              <Option value="silver">银卡会员</Option>
              <Option value="gold">金卡会员</Option>
              <Option value="platinum">钻石卡</Option>
            </Select>
          </Space>
        </div>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          scroll={{ x: 1100 }}
          pagination={{ pageSize: 8 }}
        />
      </Card>

      <Modal
        title="会员详情"
        open={isDetailOpen}
        onCancel={() => setIsDetailOpen(false)}
        width={900}
        footer={null}
        destroyOnClose
      >
        {currentMember && (
          <div>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white mb-6">
              <Row align="middle">
                <Col span={4}>
                  <Avatar size={64} className="bg-white/20 border-2 border-white/40">
                    <User size={32} />
                  </Avatar>
                </Col>
                <Col span={12}>
                  <h3 className="text-xl font-bold mb-1">{currentMember.name}</h3>
                  <div className="flex items-center gap-4 text-white/80 text-sm">
                    <span className="flex items-center gap-1">
                      <Phone size={14} />
                      {currentMember.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      注册于 {currentMember.registerDate}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {currentMember.tags.map((tag) => (
                      <Tag key={tag} className="bg-white/20 text-white border-0">
                        {tag}
                      </Tag>
                    ))}
                  </div>
                </Col>
                <Col span={8} className="text-right">
                  <Tag color="gold" className="text-sm">
                    {levelMap[currentMember.memberLevel].text}
                  </Tag>
                  <div className="mt-2">
                    <p className="text-white/70 text-sm">累计消费</p>
                    <p className="text-2xl font-bold">¥{currentMember.totalConsumption.toLocaleString()}</p>
                  </div>
                </Col>
              </Row>
            </div>

            <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
              {
                key: 'overview',
                label: (
                  <span>
                    <Activity size={14} className="inline mr-1" />
                    健康概览
                  </span>
                ),
                children: (
                  <div className="space-y-4">
                    <Row gutter={16}>
                      <Col span={8}>
                        <Card size="small">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle size={16} className="text-orange-500" />
                            <span className="text-gray-500 text-sm">最近处方风险</span>
                          </div>
                          {recentPrescriptionRisk ? (
                            <div>
                              <Tag color={getRiskLevelInfo(recentPrescriptionRisk).color}>
                                {getRiskLevelInfo(recentPrescriptionRisk).icon} {getRiskLevelInfo(recentPrescriptionRisk).text}
                              </Tag>
                              <p className="text-xs text-gray-400 mt-1">
                                共 {memberPrescriptions.length} 条处方记录
                              </p>
                            </div>
                          ) : (
                            <p className="text-gray-400 text-sm">暂无处方记录</p>
                          )}
                        </Card>
                      </Col>
                      <Col span={8}>
                        <Card size="small">
                          <div className="flex items-center gap-2 mb-2">
                            <Activity size={16} className="text-purple-500" />
                            <span className="text-gray-500 text-sm">慢病管理</span>
                          </div>
                          {memberChronicRecords.length > 0 ? (
                            <div>
                              {memberChronicRecords.map((r) => (
                                <Tag key={r.id} color="purple">{r.diseaseName}</Tag>
                              ))}
                              <p className="text-xs text-gray-400 mt-1">
                                依从率 {memberChronicRecords[0]?.medicationAdherence || 0}%
                              </p>
                            </div>
                          ) : (
                            <p className="text-gray-400 text-sm">暂无慢病档案</p>
                          )}
                        </Card>
                      </Col>
                      <Col span={8}>
                        <Card size="small">
                          <div className="flex items-center gap-2 mb-2">
                            <Bell size={16} className="text-blue-500" />
                            <span className="text-gray-500 text-sm">用药提醒</span>
                          </div>
                          <div>
                            <p className="text-xl font-bold text-blue-500">
                              {currentMember.medicationReminders.filter((r) => r.enabled).length}
                              <span className="text-sm text-gray-400 font-normal"> / {currentMember.medicationReminders.length} 进行中</span>
                            </p>
                          </div>
                        </Card>
                      </Col>
                    </Row>

                    {memberPrescriptions.length > 0 && (
                      <div>
                        <p className="font-medium mb-2">最近处方</p>
                        <List
                          size="small"
                          bordered
                          dataSource={memberPrescriptions.slice(0, 3)}
                          renderItem={(p: Prescription) => {
                            const risk = getRiskLevel(p.warnings as ReviewResult[]);
                            const info = getRiskLevelInfo(risk);
                            return (
                              <List.Item>
                                <div className="flex justify-between w-full items-center">
                                  <div className="flex items-center gap-3">
                                    <FileText size={16} className="text-blue-500" />
                                    <div>
                                      <p className="font-medium">{p.id} - {p.diagnosis}</p>
                                      <p className="text-gray-400 text-xs">{p.createTime} · {p.drugs.length}种药品</p>
                                    </div>
                                  </div>
                                  <Tag color={info.color}>{info.icon} {info.text}</Tag>
                                </div>
                              </List.Item>
                            );
                          }}
                        />
                      </div>
                    )}

                    <div>
                      <p className="font-medium mb-2">用药提醒汇总</p>
                      {currentMember.medicationReminders.length === 0 ? (
                        <div className="text-center py-6 text-gray-400 border border-dashed border-gray-200 rounded-lg">
                          暂无用药提醒，请在"用药提醒"标签页添加
                        </div>
                      ) : (
                        <Space wrap>
                          {currentMember.medicationReminders.map((r) => (
                            <Tag key={r.id} color={r.enabled ? 'blue' : 'default'}>
                              {r.drugName} - {r.frequency}
                            </Tag>
                          ))}
                        </Space>
                      )}
                    </div>
                  </div>
                ),
              },
              {
                key: 'records',
                label: (
                  <span>
                    <ShoppingBag size={14} className="inline mr-1" />
                    购药记录
                  </span>
                ),
                children: (
                  <List
                    dataSource={currentMember.purchaseRecords}
                    renderItem={(record) => (
                      <List.Item className="px-4 py-3 hover:bg-gray-50 rounded-lg">
                        <List.Item.Meta
                          avatar={<ShoppingBag size={20} className="text-blue-500 mt-1" />}
                          title={
                            <div className="flex justify-between">
                              <span className="font-medium">{record.date}</span>
                              <span className="text-orange-500 font-bold">¥{record.amount}</span>
                            </div>
                          }
                          description={
                            <div>
                              <p className="text-gray-600">{record.drugs.join('、')}</p>
                              <p className="text-gray-400 text-sm mt-1">{record.store}</p>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ),
              },
              {
                key: 'reminders',
                label: (
                  <span>
                    <Bell size={14} className="inline mr-1" />
                    用药提醒
                    <Badge count={currentMember.medicationReminders.filter((r) => r.enabled).length} className="ml-1" />
                  </span>
                ),
                children: (
                  <div>
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium mb-3">
                        <Plus size={16} className="inline mr-1" />
                        添加新提醒
                      </p>
                      <Form layout="inline" form={reminderForm} preserve={false}>
                        <Form.Item
                          name="drugName"
                          rules={[{ required: true, message: '请输入药品名称' }]}
                        >
                          <AutoComplete
                            placeholder="搜索或选择药品"
                            style={{ width: 200 }}
                            options={availableDrugsForReminder.map((drug) => ({
                              value: drug,
                              label: (
                                <div className="flex items-center gap-2 py-1">
                                  <Pill size={12} className="text-blue-500" />
                                  <span>{drug}</span>
                                </div>
                              ),
                            }))}
                            onSelect={handleSelectDrugForReminder}
                          >
                            <Input placeholder="药品名称" />
                          </AutoComplete>
                        </Form.Item>
                        <Form.Item
                          name="time"
                          rules={[{ required: true, message: '请选择时间' }]}
                        >
                          <TimePicker.RangePicker format="HH:mm" />
                        </Form.Item>
                        <Form.Item
                          name="frequency"
                          rules={[{ required: true, message: '请选择频次' }]}
                          initialValue="每日1次"
                        >
                          <Select placeholder="频次" style={{ width: 120 }}>
                            <Option value="每日1次">每日1次</Option>
                            <Option value="每日2次">每日2次</Option>
                            <Option value="每日3次">每日3次</Option>
                            <Option value="饭前">饭前</Option>
                            <Option value="饭后">饭后</Option>
                          </Select>
                        </Form.Item>
                        <Form.Item>
                          <Button type="primary" onClick={handleAddReminder}>
                            添加
                          </Button>
                        </Form.Item>
                      </Form>
                      <p className="text-xs text-gray-400 mt-2">
                        💡 可从购药记录和处方药品中快速选择
                      </p>
                    </div>

                    {currentMember.medicationReminders.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        暂无用药提醒，点击上方添加
                      </div>
                    ) : (
                      <List
                        dataSource={currentMember.medicationReminders}
                        renderItem={(reminder) => (
                          <List.Item
                            className={`px-4 py-3 rounded-lg mb-2 ${reminder.enabled ? 'bg-blue-50' : 'bg-gray-50 opacity-60'}`}
                          >
                            <List.Item.Meta
                              avatar={
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${reminder.enabled ? 'bg-blue-500' : 'bg-gray-400'}`}>
                                  <Bell size={18} className="text-white" />
                                </div>
                              }
                              title={
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{reminder.drugName}</span>
                                  <Tag color={reminder.enabled ? 'blue' : 'default'}>
                                    {reminder.frequency}
                                  </Tag>
                                  {!reminder.enabled && (
                                    <Tag color="default" icon={<Pause size={10} />}>已暂停</Tag>
                                  )}
                                </div>
                              }
                              description={
                                <span className="flex items-center gap-1 text-gray-500">
                                  <Clock size={14} />
                                  {reminder.time || '未设置时间'}
                                </span>
                              }
                            />
                            <Space>
                              <Button
                                type="text"
                                size="small"
                                icon={reminder.enabled ? <Pause size={14} /> : <Play size={14} />}
                                onClick={() => handleToggleReminder(reminder.id)}
                              >
                                {reminder.enabled ? '暂停' : '恢复'}
                              </Button>
                              <Popconfirm
                                title="确认删除此提醒？"
                                onConfirm={() => handleDeleteReminder(reminder.id)}
                                okText="删除"
                                cancelText="取消"
                              >
                                <Button type="text" size="small" danger icon={<Trash2 size={14} />}>
                                  删除
                                </Button>
                              </Popconfirm>
                            </Space>
                          </List.Item>
                        )}
                      />
                    )}
                  </div>
                ),
              },
            ]} />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MemberPage;
