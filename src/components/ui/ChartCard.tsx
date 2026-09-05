import React from "react";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  clickable?: boolean;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  children,
  className,
  onClick,
  clickable = false,
}) => {
  const cardClasses = clickable
    ? "bg-white dark:bg-neutral-800 rounded-xl shadow-soft border border-neutral-200 dark:border-neutral-700 p-6 cursor-pointer hover:shadow-md transition-shadow duration-200"
    : "bg-white dark:bg-neutral-800 rounded-xl shadow-soft border border-neutral-200 dark:border-neutral-700 p-6";

  return (
    <div
      className={cn(cardClasses, className)}
      onClick={clickable ? onClick : undefined}
    >
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
        {title}
      </h3>
      <div className="h-64">{children}</div>
    </div>
  );
};
