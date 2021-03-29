import { useWalletSelect } from '@terra-dev/terra-connect-react';
import React from 'react';

export function CurrentWallet() {
  const { selectedWallet } = useWalletSelect();

  return <pre>{JSON.stringify(selectedWallet, null, 2)}</pre>;
}
