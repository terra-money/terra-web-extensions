import {
  AnimateNumber,
  demicrofy,
  formatANC,
  formatAUST,
  formatLuna,
  formatUST,
} from '@anchor-protocol/notation';
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
  focusWallet,
  observeWalletStorage,
  removeWallet,
} from '@terra-dev/webextension-wallet-storage';
import big from 'big.js';
import { useUserBalances } from 'common/queries/userBalances';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';
import styled from 'styled-components';

function DashboardBase({ className }: { className?: string }) {
  const history = useHistory();

  const [encryptedWallets, setEncryptedWallets] = useState<EncryptedWallet[]>(
    [],
  );

  const [selectedIndex, setSelectedIndex] = useState<number>(0);

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

  const updateSelectedIndex = useCallback(
    async (nextSelectedIndex) => {
      const nextWallet = encryptedWallets[nextSelectedIndex];
      if (nextWallet) {
        await focusWallet(nextWallet.terraAddress);
        setSelectedIndex(nextSelectedIndex);
      }
    },
    [encryptedWallets],
  );

  useEffect(() => {
    const subscription = observeWalletStorage().subscribe(
      ({ wallets, focusedWalletAddress }) => {
        const nextSelectedIndex = wallets.findIndex(
          (itemWallet) => itemWallet.terraAddress === focusedWalletAddress,
        );

        setEncryptedWallets(wallets);
        setSelectedIndex(nextSelectedIndex > -1 ? nextSelectedIndex : 0);
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const {
    data: { uUSD, uaUST, uLuna, ubLuna, uANC },
  } = useUserBalances({ selectedWallet: encryptedWallets[selectedIndex] });

  return (
    <section className={className}>
      <header>
        <WalletCardSelector
          className="wallet-cards"
          cardWidth={276}
          selectedIndex={selectedIndex}
          onSelect={updateSelectedIndex}
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

      <LinedList
        className="user-balances"
        iconMarginRight="0.6em"
        firstLetterUpperCase={false}
      >
        {uLuna && big(uLuna).gt(0) && (
          <li>
            <div>
              <i>
                <img
                  src="https://assets.terra.money/icon/60/Luna.png"
                  alt="Luna"
                />
              </i>
              <span>Luna</span>
            </div>
            <div>
              <AnimateNumber format={formatLuna}>
                {demicrofy(uLuna)}
              </AnimateNumber>
            </div>
          </li>
        )}
        {uUSD && big(uUSD).gt(0) && (
          <li>
            <div>
              <i>
                <img
                  src="https://assets.terra.money/icon/60/UST.png"
                  alt="UST"
                />
              </i>
              <span>UST</span>
            </div>
            <div>
              <AnimateNumber format={formatUST}>
                {demicrofy(uUSD)}
              </AnimateNumber>
            </div>
          </li>
        )}
        {uANC && big(uANC).gt(0) && (
          <li>
            <div>
              <i>
                <img
                  src="https://whitelist.anchorprotocol.com/logo/ANC.png"
                  alt="ANC"
                />
              </i>
              <span>ANC</span>
            </div>
            <div>
              <AnimateNumber format={formatANC}>
                {demicrofy(uANC)}
              </AnimateNumber>
            </div>
          </li>
        )}
        {ubLuna && big(ubLuna).gt(0) && (
          <li>
            <div>
              <i>
                <img
                  src="https://whitelist.anchorprotocol.com/logo/bLUNA.png"
                  alt="bLUNA"
                />
              </i>
              <span>bLUNA</span>
            </div>
            <div>
              <AnimateNumber format={formatLuna}>
                {demicrofy(ubLuna)}
              </AnimateNumber>
            </div>
          </li>
        )}
        {uaUST && big(uaUST).gt(0) && (
          <li>
            <div>
              <i>
                <img
                  src="https://whitelist.anchorprotocol.com/logo/aUST.png"
                  alt="aUST"
                />
              </i>
              <span>aUST</span>
            </div>
            <div>
              <AnimateNumber format={formatAUST}>
                {demicrofy(uaUST)}
              </AnimateNumber>
            </div>
          </li>
        )}
      </LinedList>

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

    > :not(:first-child) {
      margin-left: 10px;
    }
  }

  .empty-wallets {
    margin: 30px 0 20px 0;
    text-align: center;
  }

  .user-balances,
  .wallets-actions {
    margin-top: 10px;
    font-size: 17px;
  }
`;
