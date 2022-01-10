import React, { useCallback } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { SubLayout } from 'frame/components/layouts/SubLayout';

export function WalletExport({ history }: RouteComponentProps) {
  const cancel = useCallback(() => {
    history.push('/');
  }, [history]);

  return (
    <SubLayout title="Export wallet" onBack={cancel}>
      TODO
    </SubLayout>
  );
}
