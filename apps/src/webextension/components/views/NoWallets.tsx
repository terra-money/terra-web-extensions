import { FormLayout, Layout } from '@station/ui';
import { Button } from '@material-ui/core';
import React from 'react';

export interface NoWalletsProps {
  className?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function NoWallets({ className, onCancel, onConfirm }: NoWalletsProps) {
  return (
    <Layout className={className}>
      <FormLayout>
        <p>지갑이 하나도 없습니다. 지갑을 먼저 생성한 뒤에 시도해주세요.</p>
      </FormLayout>

      <footer>
        <Button variant="contained" color="secondary" onClick={onCancel}>
          Cancel
        </Button>

        <Button variant="contained" color="primary" onClick={onConfirm}>
          Create Wallet
        </Button>
      </footer>
    </Layout>
  );
}
