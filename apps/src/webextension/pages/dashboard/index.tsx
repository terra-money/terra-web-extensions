import {
  AddCircleOutline,
  DeleteForever,
  SettingsBackupRestore,
  VpnKey,
} from '@material-ui/icons';
import { LinedList } from '@terra-dev/station-ui/components/LinedList';
import { MiniButton } from '@terra-dev/station-ui/components/MiniButton';
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
    return encryptedWallets.map(({ name, terraAddress, design }) => (
      <WalletCard
        key={name}
        name={name}
        terraAddress={terraAddress}
        design={design}
      />
    ));
  }, [encryptedWallets]);

  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  return (
    <section className={className}>
      <header>
        <WalletCardSelector
          className="wallet-cards"
          cardWidth={280}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
          onCreate={() => history.push('/wallet/create')}
        >
          {walletCards}
        </WalletCardSelector>

        {encryptedWallets.length > 0 && !!encryptedWallets[selectedIndex] && (
          <div className="wallet-actions">
            <MiniButton
              startIcon={<VpnKey />}
              component={Link}
              to={`/wallets/${encryptedWallets[selectedIndex].terraAddress}/password`}
            >
              <FormattedMessage id="wallet.change-password" />
            </MiniButton>

            <MiniButton
              startIcon={<DeleteForever />}
              onClick={() => removeWallet(encryptedWallets[selectedIndex])}
            >
              <FormattedMessage id="wallet.delete" />
            </MiniButton>
          </div>
        )}
      </header>

      {encryptedWallets.length === 0 && (
        <section className="empty-wallets">
          <FormattedMessage id="wallet.empty" />
        </section>
      )}

      <LinedList className="wallets-actions" iconMarginRight="0.6em">
        <li>
          <Link to="/wallet/create">
            <i>
              <AddCircleOutline />
            </i>
            <span>
              <FormattedMessage id="wallet.new" />
            </span>
          </Link>
        </li>
        <li>
          <Link to="/wallet/recover">
            <i>
              <SettingsBackupRestore />
            </i>
            <span>
              <FormattedMessage id="wallet.recover" />
            </span>
          </Link>
        </li>
      </LinedList>
    </section>
  );
}

export const Dashboard = styled(DashboardBase)`
  .wallet-cards {
    margin: 20px auto 0 auto;
  }

  .wallet-actions {
    height: 50px;

    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
  }

  .empty-wallets {
    margin: 30px 0 20px 0;
    text-align: center;
  }

  .wallets-actions {
    margin-top: 10px;
    font-size: 17px;
  }
`;
