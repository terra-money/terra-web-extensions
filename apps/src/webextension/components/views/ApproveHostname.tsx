import { Button } from '@station/ui';
import React from 'react';
import { MdDomainVerification } from 'react-icons/md';
import { ViewCenterLayout } from './components/ViewCenterLayout';

export interface ApproveHostnameProps {
  className?: string;
  hostname: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ApproveHostname({
  className,
  hostname,
  onCancel,
  onConfirm,
}: ApproveHostnameProps) {
  return (
    <ViewCenterLayout
      className={className}
      icon={<MdDomainVerification />}
      title="Approve this site?"
      footer={
        <>
          <Button variant="danger" size="large" onClick={onCancel}>
            Deny
          </Button>
          <Button variant="primary" size="large" onClick={onConfirm}>
            Approve
          </Button>
        </>
      }
    >
      <p>{hostname}</p>
    </ViewCenterLayout>
  );
}
