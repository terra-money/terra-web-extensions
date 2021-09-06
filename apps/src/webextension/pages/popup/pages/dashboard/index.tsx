import { formatUTokenWithPostfixUnits } from '@libs/formatter';
import { QRCodeIcon } from '@libs/icons';
import { MiniButton } from '@station/ui';
import { LinedList } from '@station/ui';
import { MiniIconButton } from '@station/ui';
import { AnimateNumber } from '@libs/ui';
import { WalletCard, WalletCardSelector } from '@libs/wallet-card';
import { Tooltip } from '@material-ui/core';
import {
  AccountBalanceWallet,
  Add,
  AddCircleOutline,
  DeleteForever,
  FilterNone,
  Send,
  Settings,
  SettingsBackupRestore,
  SwapCalls,
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
import useCopyClipboard from 'react-use-clipboard';
import styled from 'styled-components';
import { useStore } from 'webextension/contexts/store';
import { useTokenList } from 'webextension/queries/useTokenList';

function DashboardBase({ className }: { className?: string }) {
  const history = useHistory();

  const { wallets, focusedWallet, focusedWalletIndex } = useStore();

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

  const tokens = useTokenList();

  const [isCopiedTerraAddress, copyTerraAddress] = useCopyClipboard(
    focusedWallet?.terraAddress ?? '',
  );

  return (
    <section className={className}>
      <header>
        <WalletCardSelector
          className="wallet-cards"
          cardWidth={276}
          selectedIndex={focusedWalletIndex}
          onSelect={updateSelectedIndex}
          onCreate={() => history.push('/wallets/create')}
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

        <div className="wallet-actions">
          {wallets.length > 0 && !!focusedWallet && (
            <>
              <Tooltip
                title={isCopiedTerraAddress ? 'Copied' : 'Copy Address'}
                placement="top"
                arrow
              >
                <MiniIconButton onClick={copyTerraAddress}>
                  <FilterNone />
                </MiniIconButton>
              </Tooltip>

              <Tooltip title="QR Code" placement="top" arrow>
                <MiniIconButton
                  component={Link}
                  to={`/wallet/${focusedWallet.terraAddress}/qr`}
                >
                  <QRCodeIcon />
                </MiniIconButton>
              </Tooltip>

              <Tooltip title="Edit Wallet" placement="top" arrow>
                <MiniIconButton
                  component={Link}
                  to={`/wallet/${focusedWallet.terraAddress}/update`}
                >
                  <Settings />
                </MiniIconButton>
              </Tooltip>

              {'encryptedWallet' in focusedWallet && (
                <Tooltip
                  title={<FormattedMessage id="wallet.change-password" />}
                  placement="top"
                  arrow
                >
                  <MiniIconButton
                    component={Link}
                    to={`/wallet/${focusedWallet.terraAddress}/password`}
                  >
                    <VpnKey />
                  </MiniIconButton>
                </Tooltip>
              )}

              {'encryptedWallet' in focusedWallet && (
                <Tooltip title="Export wallet" placement="top" arrow>
                  <MiniIconButton
                    component={Link}
                    to={`/wallet/${focusedWallet.terraAddress}/export`}
                  >
                    <SwapCalls />
                  </MiniIconButton>
                </Tooltip>
              )}

              {/* TODO Run Verify Ledger */}
              {'usbDevice' in focusedWallet && (
                <Tooltip title="Verify Ledger" placement="top" arrow>
                  <MiniIconButton component={Link} to={`/ledger/verify`}>
                    <AccountBalanceWallet />
                  </MiniIconButton>
                </Tooltip>
              )}

              {/* TODO Confirm Dialog */}
              <Tooltip
                title={<FormattedMessage id="wallet.delete" />}
                placement="top"
                arrow
              >
                <MiniIconButton
                  onClick={() => {
                    removeWallet(focusedWallet);
                  }}
                >
                  <DeleteForever />
                </MiniIconButton>
              </Tooltip>
            </>
          )}
        </div>
      </header>

      <LinedList
        className="user-balances"
        iconMarginRight="0.6em"
        firstLetterUpperCase={false}
      >
        {tokens?.map(({ asset, balance, info, icon, isCW20Token }, i) => (
          <li key={'token' + i}>
            <div>
              {'token' in asset ? (
                <Link to={`/token/${asset.token.contract_addr}`}>
                  <i>
                    <img src={icon} alt={info?.name} />
                  </i>
                </Link>
              ) : (
                <i>
                  <img src={icon} alt={info?.name} />
                </i>
              )}
              <span>{info?.symbol}</span>
            </div>
            <div>
              <AnimateNumber format={formatUTokenWithPostfixUnits}>
                {balance}
              </AnimateNumber>

              {focusedWallet && (
                <SendButton
                  to={`/wallet/${focusedWallet.terraAddress}/send/${
                    'native_token' in asset
                      ? asset.native_token.denom
                      : asset.token.contract_addr
                  }`}
                >
                  <Send /> Send
                </SendButton>
              )}
            </div>
          </li>
        ))}
      </LinedList>

      <div className="token-actions">
        <MiniButton startIcon={<Add />} component={Link} to={`/tokens/add`}>
          Add Token
        </MiniButton>

        <MiniButton
          startIcon={<Settings />}
          component="a"
          href="/index.html/#/tokens"
          target="_blank"
          rel="noreferrer"
        >
          Manage Tokens
        </MiniButton>
      </div>

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
          <Link to="/wallets/create">
            <i>
              <AddCircleOutline />
            </i>
            <span>
              <FormattedMessage id="wallet.new" />
            </span>
          </Link>
        </li>
        <li>
          <Link to="/wallets/recover">
            <i>
              <SettingsBackupRestore />
            </i>
            <span>
              <FormattedMessage id="wallet.recover" />
            </span>
          </Link>
        </li>
        <li>
          <Link to="/dapps">
            <i>
              <Web />
            </i>
            <span>Whitelist dApps</span>
          </Link>
        </li>
      </LinedList>
    </section>
  );
}

const SendButton = styled(Link)`
  font-size: 12px;
  text-decoration: none;

  margin-left: 10px;

  padding: 5px 10px;

  border-radius: 15px;
  background-color: #eeeeee;

  svg {
    font-size: 0.8em;
  }
`;

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

  .token-actions {
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
