import React from 'react';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface RecentActivityCardProps {
  activities: ActivityItem[];
  className?: string;
}

export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({ activities, className }) => {
  const getTypeColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'info':
        return 'bg-blue-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className={cn(
      'bg-white rounded-xl shadow-soft border border-gray-100 p-6',
      className
    )}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className={`w-2 h-2 ${getTypeColor(activity.type)} rounded-full mt-2 flex-shrink-0`}></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{activity.title}</p>
              <p className="text-sm text-gray-600">{activity.description}</p>
              <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
