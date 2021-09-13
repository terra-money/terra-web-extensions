import { FormLayout, Layout } from '@station/ui';
import { Button } from '@material-ui/core';
import React from 'react';

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
    <Layout className={className}>
      <FormLayout>
        <p>{terraAddress} 은 비밀번호를 변경할 수 없는 Wallet 입니다.</p>
      </FormLayout>

      <footer>
        <footer>
          <Button variant="contained" color="primary" onClick={onConfirm}>
            Confirm
          </Button>
        </footer>
      </footer>
    </Layout>
  );
}
