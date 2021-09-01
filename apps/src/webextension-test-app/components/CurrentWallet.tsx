import { useWalletSelect } from '@libs/web-extension-react';
import React from 'react';

export function CurrentWallet() {
  const { selectedWallet } = useWalletSelect();

  return <pre>{JSON.stringify(selectedWallet, null, 2)}</pre>;
}
