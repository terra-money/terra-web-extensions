import { Button } from '@station/ui2';
import React from 'react';
import { MdMoodBad } from 'react-icons/md';
import { ViewCenterLayout } from './components/ViewCenterLayout';

export interface UnknownCaseProps {
  className?: string;
  detail: string;
  onConfirm?: () => void;
}

export function UnknownCase({
  className,
  detail,
  onConfirm,
}: UnknownCaseProps) {
  return (
    <ViewCenterLayout
      className={className}
      icon={<MdMoodBad />}
      title="Unknown case"
      footer={
        <Button variant="primary" size="large" onClick={onConfirm}>
          Close
        </Button>
      }
    >
      <p>{detail}</p>
    </ViewCenterLayout>
  );
}
