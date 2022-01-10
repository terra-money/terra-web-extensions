import { Button } from '@station/ui';
import React from 'react';
import { MdMoodBad } from 'react-icons/md';
import { ViewCenterLayout } from './components/ViewCenterLayout';

export interface CanNotFindTokenProps {
  className?: string;
  token: string;
  onConfirm: () => void;
}

export function CanNotFinToken({
  className,
  token,
  onConfirm,
}: CanNotFindTokenProps) {
  return (
    <ViewCenterLayout
      className={className}
      icon={<MdMoodBad />}
      title="Can't find Token"
      footer={
        <Button variant="primary" size="large" onClick={onConfirm}>
          Continue
        </Button>
      }
    >
      <p>Can't find the token "{token}"</p>
    </ViewCenterLayout>
  );
}
