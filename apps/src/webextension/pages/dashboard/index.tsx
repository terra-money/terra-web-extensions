import { truncate } from '@anchor-protocol/notation';
import { EncryptedWallet } from '@terra-dev/wallet';
import {
  observeWalletStorage,
  removeWallet,
} from '@terra-dev/webextension-wallet-storage';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

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
      <h3>Wallets</h3>
      {encryptedWallets.length > 0 ? (
        <ul>
          {encryptedWallets.map((wallet) => (
            <li key={wallet.terraAddress}>
              <ul>
                <li>
                  {wallet.name} ({truncate(wallet.terraAddress)})
                </li>
                <li>
                  <Link to={`/wallets/${wallet.terraAddress}/password`}>
                    <FormattedMessage id="wallet.change-password" />
                  </Link>
                </li>
                <li>
                  <button onClick={() => removeWallet(wallet)}>
                    <FormattedMessage id="wallet.delete" />
                  </button>
                </li>
              </ul>
            </li>
          ))}
        </ul>
      ) : (
        <FormattedMessage id="wallet.empty" />
      )}

      <ul>
        <li>
          <Link to="/wallet/create">
            <FormattedMessage id="wallet.new" />
          </Link>
        </li>
        <li>
          <Link to="/wallet/recover">
            <FormattedMessage id="wallet.recover" />
          </Link>
        </li>
      </ul>
    </section>
  );
}
