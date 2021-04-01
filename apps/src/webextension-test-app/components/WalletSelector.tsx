import { useWalletSelect } from '@terra-dev/terra-connect-react';
import React from 'react';

export function WalletSelector() {
  const { wallets, selectedWallet, selectWallet } = useWalletSelect();
  
  return (
    <div>
      <ul>
        {wallets.map((wallet) => (
          <li key={wallet.terraAddress} onClick={() => selectWallet(wallet)}>
            [{wallet.terraAddress === selectedWallet?.terraAddress ? 'X' : ' '}]{' '}
            {wallet.name} ({wallet.terraAddress})
          </li>
        ))}
      </ul>
    </div>
  );
}
