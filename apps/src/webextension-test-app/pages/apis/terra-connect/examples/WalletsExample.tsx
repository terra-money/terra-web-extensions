import { useWebConnector } from '@station/web-connector-react';
import React from 'react';

export function WalletsExample() {
  const { states } = useWebConnector();

  if (!states) return null;

  return (
    <ol>
      {states.wallets.map((itemWallet) => (
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
