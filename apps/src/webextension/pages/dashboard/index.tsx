import { truncate } from '@anchor-protocol/notation';
import { EncryptedWallet } from '@terra-dev/wallet';
import { WalletCard, WalletCardSelector } from '@terra-dev/wallet-card';
import {
  observeWalletStorage,
  removeWallet,
} from '@terra-dev/webextension-wallet-storage';
import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';
import styled from 'styled-components';

function DashboardBase({ className }: { className?: string }) {
  const history = useHistory();

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

  const walletCards = useMemo(() => {
    return encryptedWallets.map(({ name, terraAddress }) => (
      <WalletCard name={name} terraAddress={terraAddress} />
    ));
  }, [encryptedWallets]);

  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  return (
    <section className={className}>
      <WalletCardSelector
        className="wallet-cards"
        cardWidth={280}
        selectedIndex={selectedIndex}
        onSelect={setSelectedIndex}
        onCreate={() => history.push('/wallet/create')}
      >
        {walletCards}
      </WalletCardSelector>

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

export const Dashboard = styled(DashboardBase)`
  .wallet-cards {
    margin: 20px auto 0 auto;
  }
`;
