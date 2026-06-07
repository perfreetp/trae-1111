import React from 'react';
import { Card } from 'antd';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  suffix?: string;
  prefix?: string;
  growth?: number;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'orange' | 'purple';
}

const colorMap = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-emerald-500 to-emerald-600',
  orange: 'from-orange-500 to-orange-600',
  purple: 'from-purple-500 to-purple-600',
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  suffix = '',
  prefix = '',
  growth,
  icon,
  color = 'blue',
}) => {
  return (
    <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-800">
            {prefix}
            {value}
            {suffix}
          </p>
          {growth !== undefined && (
            <div className="flex items-center mt-2">
              {growth >= 0 ? (
                <TrendingUp size={14} className="text-emerald-500 mr-1" />
              ) : (
                <TrendingDown size={14} className="text-red-500 mr-1" />
              )}
              <span className={`text-sm ${growth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {growth >= 0 ? '+' : ''}
                {growth}%
              </span>
              <span className="text-gray-400 text-sm ml-1">较昨日</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center text-white shadow-lg`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;
