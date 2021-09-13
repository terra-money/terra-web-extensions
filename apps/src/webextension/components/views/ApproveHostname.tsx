import { Button } from '@material-ui/core';
import { FormLayout, Layout } from '@station/ui';
import React from 'react';

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
    <Layout className={className}>
      <FormLayout>
        <p>{hostname} 의 접근을 허용하시겠습니까?</p>
        <p>
          이 App 이 Extension 에 접근할 수 있습니다. 신뢰할 수 있는 App 인지
          확인해주세요!
        </p>
      </FormLayout>

      <footer>
        <Button variant="contained" color="secondary" onClick={onCancel}>
          Cancel
        </Button>

        <Button variant="contained" color="primary" onClick={onConfirm}>
          Approve
        </Button>
      </footer>
    </Layout>
  );
}
