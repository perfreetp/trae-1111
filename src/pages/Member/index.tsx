import React, { useState } from 'react';
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
} from 'lucide-react';
import { members as initialMembers } from '@/mock/member';
import type { Member, MedicationReminder } from '@/types';
import dayjs from 'dayjs';

const { Option } = Select;

const MemberPage: React.FC = () => {
  const [data, setData] = useState<Member[]>(initialMembers);
  const [searchText, setSearchText] = useState('');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [reminderForm] = Form.useForm();

  const levelMap: Record<string, { color: string; text: string }> = {
    normal: { color: 'default', text: '普通会员' },
    silver: { color: 'geekblue', text: '银卡会员' },
    gold: { color: 'gold', text: '金卡会员' },
    platinum: { color: 'purple', text: '钻石卡' },
  };

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
      title: '累计消费',
      dataIndex: 'totalConsumption',
      key: 'totalConsumption',
      width: 120,
      render: (val: number) => <span className="font-medium">¥{val.toLocaleString()}</span>,
    },
    {
      title: '积分',
      dataIndex: 'points',
      key: 'points',
      width: 100,
      render: (val: number) => <span>{val.toLocaleString()}</span>,
    },
    {
      title: '注册时间',
      dataIndex: 'registerDate',
      key: 'registerDate',
      width: 120,
    },
    {
      title: '标签',
      key: 'tags',
      render: (_: any, record: Member) => (
        <Space wrap>
          {record.tags.slice(0, 3).map((tag) => (
            <Tag key={tag} color="blue">
              {tag}
            </Tag>
          ))}
        </Space>
      ),
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
    setIsDetailOpen(true);
  };

  const handleAddReminder = () => {
    reminderForm.validateFields().then((values) => {
      if (!currentMember) return;

      const times = values.time as dayjs.Dayjs[];
      const timeStr = times.map((t) => t.format('HH:mm')).join(',');

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
    message.success('提醒状态已更新');
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
          scroll={{ x: 1000 }}
          pagination={{ pageSize: 8 }}
        />
      </Card>

      <Modal
        title="会员详情"
        open={isDetailOpen}
        onCancel={() => setIsDetailOpen(false)}
        width={800}
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

            <Tabs
              defaultActiveKey="records"
              items={[
                {
                  key: 'records',
                  label: '购药记录',
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
                  label: '用药提醒',
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
                            <Input placeholder="药品名称" style={{ width: 150 }} />
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
                      </div>

                      {currentMember.medicationReminders.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          暂无用药提醒，点击上方添加
                        </div>
                      ) : (
                        <List
                          dataSource={currentMember.medicationReminders}
                          renderItem={(reminder) => (
                            <List.Item className="px-4 py-3 bg-gray-50 rounded-lg mb-2">
                              <List.Item.Meta
                                avatar={<Bell size={20} className="text-blue-500 mt-1" />}
                                title={
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{reminder.drugName}</span>
                                    <Tag color="blue">{reminder.frequency}</Tag>
                                  </div>
                                }
                                description={
                                  <span className="flex items-center gap-1 text-gray-500">
                                    <Clock size={14} />
                                    {reminder.time}
                                  </span>
                                }
                              />
                              <Switch
                                checked={reminder.enabled}
                                onChange={() => handleToggleReminder(reminder.id)}
                              />
                            </List.Item>
                          )}
                        />
                      )}
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

export default MemberPage;
