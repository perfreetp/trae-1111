import React from 'react';
import { Layout, Menu, Avatar, Dropdown } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store';
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  Heart,
  Tag,
  Shield,
  ChevronLeft,
  ChevronRight,
  User,
  Settings,
  LogOut,
} from 'lucide-react';

const { Header, Sider, Content } = Layout;

const menuItems = [
  {
    key: '/dashboard',
    icon: <LayoutDashboard size={20} />,
    label: '经营看板',
  },
  {
    key: '/prescription',
    icon: <FileText size={20} />,
    label: '处方审核',
  },
  {
    key: '/member',
    icon: <Users size={20} />,
    label: '会员服务',
  },
  {
    key: '/inventory',
    icon: <Package size={20} />,
    label: '库存效期',
  },
  {
    key: '/chronic',
    icon: <Heart size={20} />,
    label: '慢病随访',
  },
  {
    key: '/promotion',
    icon: <Tag size={20} />,
    label: '促销活动',
  },
  {
    key: '/compliance',
    icon: <Shield size={20} />,
    label: '合规检查',
  },
];

const userMenuItems = [
  {
    key: '1',
    icon: <User size={16} />,
    label: '个人中心',
  },
  {
    key: '2',
    icon: <Settings size={16} />,
    label: '系统设置',
  },
  {
    type: 'divider' as const,
  },
  {
    key: '3',
    icon: <LogOut size={16} />,
    label: '退出登录',
  },
];

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={sidebarCollapsed}
        width={220}
        className="bg-white border-r border-gray-100"
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-semibold text-gray-800 text-base">智慧药房</span>
            )}
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="border-r-0 pt-4"
          style={{ height: 'calc(100vh - 64px)' }}
        />
      </Sider>
      <Layout>
        <Header className="bg-white border-b border-gray-100 px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="text-gray-500 hover:text-blue-600 transition-colors p-1 rounded hover:bg-gray-50"
            >
              {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
            <div>
              <h2 className="text-lg font-medium text-gray-800">
                {menuItems.find((m) => m.key === location.pathname)?.label || '智慧药房管理平台'}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors">
                <Avatar size={32} className="bg-blue-500">
                  <User size={18} />
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-700">管理员</p>
                  <p className="text-xs text-gray-400">中心店</p>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="bg-gray-50 p-6 overflow-auto" style={{ height: 'calc(100vh - 64px)' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
