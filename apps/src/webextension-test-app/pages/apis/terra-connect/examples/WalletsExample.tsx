import { useWebExtension } from '@terra-dev/web-extension-react';
import React from 'react';

export function WalletsExample() {
  const { clientStates } = useWebExtension();

  if (!clientStates) return null;

  return (
    <ol>
      {clientStates.wallets.map((itemWallet) => (
        <li key={itemWallet.name}>
          <ul>
            <li>name: {itemWallet.name}</li>
            <li>terraAddress: {itemWallet.terraAddress}</li>
            <li>design: {itemWallet.design}</li>
          </ul>
        </li>
      ))}
    </ol>
  );
}
