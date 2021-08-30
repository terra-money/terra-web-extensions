import { LinedList } from '@libs/station-ui/components/LinedList';
import { MiniButton } from '@libs/station-ui/components/MiniButton';
import { WalletCard, WalletCardSelector } from '@libs/wallet-card';
import {
  AddCircleOutline,
  DeleteForever,
  SettingsBackupRestore,
  Usb,
  VpnKey,
  Web,
} from '@material-ui/icons';
import {
  focusWallet,
  isLedgerSupportBrowser,
  removeWallet,
} from '@terra-dev/web-extension-backend';
import React, { useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { useWallets } from '../../queries/useWallets';

function DashboardBase({ className }: { className?: string }) {
  const history = useHistory();

  const { wallets, focusedWallet, focusedWalletIndex } = useWallets();

  console.log('index.tsx..DashboardBase()', focusedWallet, focusedWalletIndex);

  const isLedgerSupport = useMemo(() => {
    return isLedgerSupportBrowser();
  }, []);

  const updateSelectedIndex = useCallback(
    async (nextSelectedIndex) => {
      const nextWallet = wallets[nextSelectedIndex];
      if (nextWallet) {
        await focusWallet(nextWallet.terraAddress);
      }
    },
    [wallets],
  );

  //const {
  //  data: { uUSD, uaUST, uLuna, ubLuna, uANC },
  //} = useUserBalances({ selectedWallet: encryptedWallets[selectedIndex] });

  return (
    <section className={className}>
      {wallets.length > 0 ? (
        <header>
          <WalletCardSelector
            className="wallet-cards"
            cardWidth={276}
            selectedIndex={focusedWalletIndex}
            onSelect={updateSelectedIndex}
            onCreate={() => history.push('/wallet/create')}
          >
            {wallets.map(({ name, terraAddress, design }) => (
              <WalletCard
                key={name}
                name={name}
                terraAddress={terraAddress}
                design={design}
              />
            ))}
          </WalletCardSelector>

          {wallets.length > 0 && !!focusedWallet && (
            <div className="wallet-actions">
              {'encryptedWallet' in focusedWallet && (
                <MiniButton
                  startIcon={<VpnKey />}
                  component={Link}
                  to={`/wallets/${focusedWallet.terraAddress}/password`}
                >
                  <FormattedMessage id="wallet.change-password" />
                </MiniButton>
              )}

              <MiniButton
                startIcon={<DeleteForever />}
                onClick={() => {
                  removeWallet(focusedWallet);
                }}
              >
                <FormattedMessage id="wallet.delete" />
              </MiniButton>
            </div>
          )}
        </header>
      ) : (
        <section className="empty-wallets">
          <FormattedMessage id="wallet.empty" />
        </section>
      )}

      <LinedList
        className="user-balances"
        iconMarginRight="0.6em"
        firstLetterUpperCase={false}
      >
        {/*{uLuna && big(uLuna).gt(0) && (*/}
        {/*  <li>*/}
        {/*    <div>*/}
        {/*      <i>*/}
        {/*        <img*/}
        {/*          src="https://assets.terra.money/icon/60/Luna.png"*/}
        {/*          alt="Luna"*/}
        {/*        />*/}
        {/*      </i>*/}
        {/*      <span>Luna</span>*/}
        {/*    </div>*/}
        {/*    <div>*/}
        {/*      <AnimateNumber format={formatLuna}>*/}
        {/*        {demicrofy(uLuna)}*/}
        {/*      </AnimateNumber>*/}
        {/*    </div>*/}
        {/*  </li>*/}
        {/*)}*/}
        {/*{uUSD && big(uUSD).gt(0) && (*/}
        {/*  <li>*/}
        {/*    <div>*/}
        {/*      <i>*/}
        {/*        <img*/}
        {/*          src="https://assets.terra.money/icon/60/UST.png"*/}
        {/*          alt="UST"*/}
        {/*        />*/}
        {/*      </i>*/}
        {/*      <span>UST</span>*/}
        {/*    </div>*/}
        {/*    <div>*/}
        {/*      <AnimateNumber format={formatUST}>*/}
        {/*        {demicrofy(uUSD)}*/}
        {/*      </AnimateNumber>*/}
        {/*    </div>*/}
        {/*  </li>*/}
        {/*)}*/}
        {/*{uANC && big(uANC).gt(0) && (*/}
        {/*  <li>*/}
        {/*    <div>*/}
        {/*      <i>*/}
        {/*        <img*/}
        {/*          src="https://whitelist.anchorprotocol.com/logo/ANC.png"*/}
        {/*          alt="ANC"*/}
        {/*        />*/}
        {/*      </i>*/}
        {/*      <span>ANC</span>*/}
        {/*    </div>*/}
        {/*    <div>*/}
        {/*      <AnimateNumber format={formatANC}>*/}
        {/*        {demicrofy(uANC)}*/}
        {/*      </AnimateNumber>*/}
        {/*    </div>*/}
        {/*  </li>*/}
        {/*)}*/}
        {/*{ubLuna && big(ubLuna).gt(0) && (*/}
        {/*  <li>*/}
        {/*    <div>*/}
        {/*      <i>*/}
        {/*        <img*/}
        {/*          src="https://whitelist.anchorprotocol.com/logo/bLUNA.png"*/}
        {/*          alt="bLUNA"*/}
        {/*        />*/}
        {/*      </i>*/}
        {/*      <span>bLUNA</span>*/}
        {/*    </div>*/}
        {/*    <div>*/}
        {/*      <AnimateNumber format={formatLuna}>*/}
        {/*        {demicrofy(ubLuna)}*/}
        {/*      </AnimateNumber>*/}
        {/*    </div>*/}
        {/*  </li>*/}
        {/*)}*/}
        {/*{uaUST && big(uaUST).gt(0) && (*/}
        {/*  <li>*/}
        {/*    <div>*/}
        {/*      <i>*/}
        {/*        <img*/}
        {/*          src="https://whitelist.anchorprotocol.com/logo/aUST.png"*/}
        {/*          alt="aUST"*/}
        {/*        />*/}
        {/*      </i>*/}
        {/*      <span>aUST</span>*/}
        {/*    </div>*/}
        {/*    <div>*/}
        {/*      <AnimateNumber format={formatAUST}>*/}
        {/*        {demicrofy(uaUST)}*/}
        {/*      </AnimateNumber>*/}
        {/*    </div>*/}
        {/*  </li>*/}
        {/*)}*/}
      </LinedList>

      <LinedList className="wallets-actions" iconMarginRight="0.6em">
        {isLedgerSupport && (
          <li>
            <a href="/connect-ledger.html" target="_blank" rel="noreferrer">
              <i>
                <Usb />
              </i>
              <span>
                <FormattedMessage id="wallet.new.ledger" />
              </span>
            </a>
          </li>
        )}
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
        <li>
          <Link to="/hostnames">
            <i>
              <Web />
            </i>
            <span>Manage Sites</span>
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
