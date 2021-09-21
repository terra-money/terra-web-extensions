import { formatUTokenWithPostfixUnits } from '@libs/formatter';
import { QRCodeIcon } from '@libs/icons';
import { AnimateNumber } from '@libs/ui';
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
import { LinedList, MiniButton, MiniIconButton } from '@station/ui';
import { WalletCard, WalletCardSelector } from '@station/wallet-card';
import {
  focusWallet,
  isLedgerSupportBrowser,
  removeWallet,
} from '@terra-dev/web-extension-backend';
import { fixHMR } from 'fix-hmr';
import React, { useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';
import useCopyClipboard from 'react-use-clipboard';
import styled from 'styled-components';
import { useStore } from 'webextension/contexts/store';
import { useTokenList } from 'webextension/queries/useTokenList';
import { useWalletUpdateDialog } from '../../components/wallets/update';

export interface DashboardProps {
  className?: string;
}

function DashboardBase({ className }: DashboardProps) {
  const history = useHistory();

  const [openWalletUpdate, walletUpdateElement] = useWalletUpdateDialog();

  const { wallets, focusedWallet, focusedWalletIndex, selectedNetwork } =
    useStore();

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

              <MiniButton
                startIcon={<Settings />}
                onClick={() =>
                  openWalletUpdate({ terraAddress: focusedWallet.terraAddress })
                }
              >
                Edit Wallet
              </MiniButton>

              {'encryptedWallet' in focusedWallet && (
                <MiniButton
                  startIcon={<VpnKey />}
                  component={Link}
                  to={`/wallet/${focusedWallet.terraAddress}/password`}
                >
                  <FormattedMessage id="wallet.change-password" />
                </MiniButton>
              )}

              {'encryptedWallet' in focusedWallet && (
                <MiniButton
                  startIcon={<SwapCalls />}
                  component={Link}
                  to={`/wallet/${focusedWallet.terraAddress}/export`}
                >
                  Export wallet
                </MiniButton>
              )}

              {/* TODO Run Verify Ledger */}
              {'usbDevice' in focusedWallet && (
                <MiniButton
                  startIcon={<AccountBalanceWallet />}
                  component={Link}
                  to={`/ledger/verify`}
                >
                  Verify Ledger
                </MiniButton>
              )}

              {/* TODO Confirm Dialog */}
              <MiniButton
                startIcon={<DeleteForever />}
                onClick={() => {
                  removeWallet(focusedWallet);
                }}
              >
                <FormattedMessage id="wallet.delete" />
              </MiniButton>
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
                <a
                  href={`https://finder.terra.money/${selectedNetwork?.chainID}/address/${asset.token.contract_addr}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <i>
                    <img src={icon} alt={info?.name} />
                  </i>
                </a>
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

        <MiniButton startIcon={<Settings />} component={Link} to={`/tokens`}>
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

      {walletUpdateElement}
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

export const StyledDashboard = styled(DashboardBase)`
  padding: 20px;

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

export const Dashboard = fixHMR(StyledDashboard);
