import { Button } from '@station/ui2';
import React from 'react';
import { MdMoodBad } from 'react-icons/md';
import { ViewCenterLayout } from './components/ViewCenterLayout';

export interface WalletIsNotEncryptedWalletProps {
  className?: string;
  terraAddress: string;
  onConfirm: () => void;
}

export function WalletIsNotEncryptedWallet({
  className,
  terraAddress,
  onConfirm,
}: WalletIsNotEncryptedWalletProps) {
  return (
    <ViewCenterLayout
      className={className}
      icon={<MdMoodBad />}
      title="Error"
      footer={
        <Button variant="primary" size="large" onClick={onConfirm}>
          Close
        </Button>
      }
    >
      <p>{terraAddress} 은 비밀번호를 변경할 수 없는 Wallet 입니다.</p>
    </ViewCenterLayout>
  );
}
