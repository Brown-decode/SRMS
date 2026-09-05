import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  title,
  subtitle,
  actions,
}) => {
  return (
    <div className="space-y-6">
      {(title || subtitle || actions) && (
        <div className="flex items-center justify-between">
          <div>
            {title && (
              <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center space-x-3">{actions}</div>
          )}
        </div>
      )}

      <div>{children}</div>
    </div>
  );
};
