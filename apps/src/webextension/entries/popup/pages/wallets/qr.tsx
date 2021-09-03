import React, { useCallback } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { ViewAddressQR } from 'webextension/components/views/ViewAddressQR';

export function WalletQR({
  history,
  match,
}: RouteComponentProps<{ terraAddress: string }>) {
  console.log('qr.tsx..WalletQR()', match.params.terraAddress);

  const confirm = useCallback(() => {
    history.push('/');
  }, [history]);

  return (
    <ViewAddressQR terraAddress={match.params.terraAddress} onConfirm={confirm}>
      <header>
        <h1>Your wallet address</h1>
      </header>
    </ViewAddressQR>
  );
}
