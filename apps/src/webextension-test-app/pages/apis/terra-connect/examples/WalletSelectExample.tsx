import { useWalletSelect } from '@libs/web-extension-react';
import React from 'react';

export function WalletSelectExample() {
  const { selectedWallet, selectWallet, wallets } = useWalletSelect();

  return (
    <ol>
      {wallets.map((itemWallet) => (
        <li
          key={itemWallet.name}
          onClick={() => selectWallet(itemWallet)}
          style={{ cursor: 'pointer' }}
        >
          <ul>
            <li>[{selectedWallet?.name === itemWallet.name ? 'X' : ' '}]</li>
            <li>name: {itemWallet.name}</li>
            <li>terraAddress: {itemWallet.terraAddress}</li>
            <li>design: {itemWallet.design}</li>
          </ul>
        </li>
      ))}
    </ol>
  );
}
