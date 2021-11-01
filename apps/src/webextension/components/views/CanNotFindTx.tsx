import { Button } from '@station/ui';
import React from 'react';
import { MdMoodBad } from 'react-icons/md';
import { ViewCenterLayout } from './components/ViewCenterLayout';

export interface CanNotFindTxProps {
  className?: string;
  onConfirm?: () => void;
}

export function CanNotFindTx({ className, onConfirm }: CanNotFindTxProps) {
  return (
    <ViewCenterLayout
      className={className}
      icon={<MdMoodBad />}
      title="Can't find Tx"
      footer={
        <Button variant="primary" size="large" onClick={onConfirm}>
          Close
        </Button>
      }
    />
  );
}
