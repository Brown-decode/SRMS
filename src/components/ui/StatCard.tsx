import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
  onClick?: () => void;
  clickable?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  loading = false,
  onClick,
  clickable = false,
}) => {
  const cardClasses = clickable
    ? "bg-card dark:bg-neutral-800 rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow duration-200"
    : "bg-card dark:bg-neutral-800 rounded-lg shadow p-6";
  if (loading) {
    return (
      <div className="bg-card dark:bg-neutral-800 rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cardClasses} onClick={clickable ? onClick : undefined}>
      <div className="flex items-center">
        {Icon && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
        )}
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-neutral-600 truncate">
              {title}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-neutral-900">
                {value}
              </div>
            </dd>
          </dl>
          {description && (
            <div className="mt-2 text-sm text-neutral-600">{description}</div>
          )}
        </div>
      </div>
    </div>
  );
};
