import { Button } from '@station/ui';
import React from 'react';
import { MdMood } from 'react-icons/md';
import { ViewCenterLayout } from './components/ViewCenterLayout';

export interface AlreadyCW20TokensExistsProps {
  className?: string;
  onConfirm: () => void;
}

export function AlreadyCW20TokensExists({
  className,
  onConfirm,
}: AlreadyCW20TokensExistsProps) {
  return (
    <ViewCenterLayout
      className={className}
      icon={<MdMood />}
      title="Already exists"
      footer={
        <Button variant="primary" size="large" onClick={onConfirm}>
          Confirm
        </Button>
      }
    >
      <p>These are all tokens that have already been added.</p>
    </ViewCenterLayout>
  );
}
