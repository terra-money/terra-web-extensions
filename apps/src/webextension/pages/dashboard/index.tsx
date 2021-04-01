import { EncryptedWallet } from '@terra-dev/wallet';
import {
  observeWalletStorage,
  removeWallet,
} from '@terra-dev/webextension-wallet-storage';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { NetworkSelector } from '../../components/NetworkSelector';

export function Dashboard() {
  const [encryptedWallets, setEncryptedWallets] = useState<EncryptedWallet[]>(
    [],
  );

  useEffect(() => {
    const subscription = observeWalletStorage().subscribe((wallets) => {
      setEncryptedWallets(wallets);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <section>
      <h3>Network Select</h3>
      <NetworkSelector />

      <h3>Wallets</h3>
      {encryptedWallets.length > 0 ? (
        <ul>
          {encryptedWallets.map((wallet) => (
            <li key={wallet.terraAddress}>
              {wallet.name} ({wallet.terraAddress}){' '}
              <Link to={`/wallets/${wallet.terraAddress}/password`}>
                Change Password
              </Link>
              <button onClick={() => removeWallet(wallet)}>Delete</button>
            </li>
          ))}
        </ul>
      ) : (
        'No Wallet'
      )}

      <ul>
        <li>
          <Link to="/wallet/create">Create New Wallet</Link>
        </li>
        <li>
          <Link to="/wallet/restore">Restore Wallet</Link>
        </li>
      </ul>
    </section>
  );
}
