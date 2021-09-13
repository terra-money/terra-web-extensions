import { Button } from '@material-ui/core';
import { FormLayout, Layout } from '@station/ui';
import React, { ReactNode } from 'react';

export interface AlreadyCW20TokensExistsProps {
  className?: string;
  onConfirm: () => void;
  children?: ReactNode;
}

export function AlreadyCW20TokensExists({
  className,
  children,
  onConfirm,
}: AlreadyCW20TokensExistsProps) {
  return (
    <Layout className={className}>
      {children}

      <FormLayout>
        <p>이미 모두 추가된 Token 들 입니다</p>
      </FormLayout>

      <footer>
        <Button variant="contained" color="primary" onClick={onConfirm}>
          Confirm
        </Button>
      </footer>
    </Layout>
  );
}
