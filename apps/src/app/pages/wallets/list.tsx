import {
  observeWalletStorage,
  removeWallet,
  StoredWallet,
} from '@terra-dev/extension-wallet-storage';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export function WalletList() {
  const [wallets, setWallets] = useState<StoredWallet[]>([]);

  useEffect(() => {
    const subscription = observeWalletStorage().subscribe((wallets) => {
      setWallets(wallets);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <section>
      {wallets.length > 0 ? (
        <ul>
          {wallets.map((wallet) => (
            <li key={wallet.accAddress}>
              {wallet.name} ({wallet.accAddress})
              <button onClick={() => removeWallet(wallet)}>Delete</button>
            </li>
          ))}
        </ul>
      ) : (
        'No Wallet'
      )}

      <div>
        <Link to="/create">Create New Wallet</Link>
      </div>
    </section>
  );
}
