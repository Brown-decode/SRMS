import React from "react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background dark:bg-neutral-900">
      <main className="min-h-screen">{children}</main>
    </div>
  );
};
