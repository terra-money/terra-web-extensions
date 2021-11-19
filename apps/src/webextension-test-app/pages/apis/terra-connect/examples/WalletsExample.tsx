import { useWebExtensionConnector } from '@station/web-extension-react';
import { WebExtensionStatus } from '@terra-dev/web-extension-interface';
import React from 'react';

export function WalletsExample() {
  const { states } = useWebExtensionConnector();

  if (states.type !== WebExtensionStatus.READY) {
    return null;
  }

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
