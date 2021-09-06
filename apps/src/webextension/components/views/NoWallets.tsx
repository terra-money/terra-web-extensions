import { FormLayout, FormSection } from '@station/ui';
import { Button } from '@material-ui/core';
import React from 'react';

export interface NoWalletsProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export function NoWallets({ onCancel, onConfirm }: NoWalletsProps) {
  return (
    <FormSection>
      <FormLayout>
        <p>지갑이 하나도 없습니다. 지갑을 먼저 생성해주세요.</p>
      </FormLayout>

      <footer>
        <footer>
          <Button variant="contained" color="secondary" onClick={onCancel}>
            Cancel
          </Button>

          <Button variant="contained" color="primary" onClick={onConfirm}>
            Create Wallet
          </Button>
        </footer>
      </footer>
    </FormSection>
  );
}
