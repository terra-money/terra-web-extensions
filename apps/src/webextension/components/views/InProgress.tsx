import React, { ReactNode } from 'react';
import { RotateSpinner } from 'react-spinners-kit';
import { ViewCenterLayout } from './components/ViewCenterLayout';

export interface InProgressProps {
  className?: string;
  title: string;
  children?: ReactNode;
}

export function InProgress({ className, title, children }: InProgressProps) {
  return (
    <ViewCenterLayout
      className={className}
      icon={
        <div style={{ marginBottom: 15 }}>
          <RotateSpinner size={48} color="#2043b5" />
        </div>
      }
      title={title}
      footer={null}
    >
      {children}
    </ViewCenterLayout>
  );
}
