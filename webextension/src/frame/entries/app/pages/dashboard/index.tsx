import { useTerraTokenUstValueQuery } from '@libs/app-provider';
import { formatUTokenWithPostfixUnits } from '@libs/formatter';
import { AnimateNumber } from '@libs/ui';
import { Menu, Switch } from '@mantine/core';
import { useLocalStorageValue } from '@mantine/hooks';
import {
  Box,
  Button,
  EmptyWalletCard,
  LedgerIcon,
  ListBox,
  SvgButton,
  SvgIcon,
  TerraIcon,
  TokenSymbolIcon,
  WalletCard,
  WalletCardSelector,
  WalletMoreMenus,
} from '@station/ui';
import {
  EncryptedWallet,
  focusWallet,
  isLedgerSupportBrowser,
  LedgerWallet,
  removeSavedPassword,
  removeWallet,
} from '@terra-dev/web-extension-backend';
import big from 'big.js';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  MdAdd,
  MdAddCircle,
  MdAddCircleOutline,
  MdCallToAction,
  MdChevronRight,
  MdDelete,
  MdEdit,
  MdErrorOutline,
  MdLockOpen,
  MdSettings,
  MdSettingsBackupRestore,
  MdUpload,
  MdVpnKey,
} from 'react-icons/md';
import { FormattedMessage } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { ConfigSelector } from 'frame/components/header/ConfigSelector';
import { useStore } from 'frame/contexts/store';
import { extensionPath } from 'frame/logics/extensionPath';
import { usePasswordSavedAddresses } from 'frame/queries/usePasswordSavedAddresses';
import { TokenListItem, useTokenList } from 'frame/queries/useTokenList';
import { useAddCW20TokensDialog } from '../../dialogs/useAddCW20TokensDialog';
import { useDeleteWalletDialog } from '../../dialogs/useDeleteWalletDialog';
import { useManageCW20TokensDialog } from '../../dialogs/useManageCW20TokensDialog';
import { useTerraAddressQrDialog } from '../../dialogs/useTerraAddressQrDialog';

const INDEX = extensionPath('app.html');

function navItemRenderer(length: number, itemIndex: number) {
  return itemIndex >= length - 1 ? <MdAddCircle /> : <MdCallToAction />;
}

function DashboardBase({ className }: { className?: string }) {
  const history = useHistory();

  const [openAddCW20Tokens, addCW20TokensElement] = useAddCW20TokensDialog();
  const [openManageCW20Tokens, manageCW20TokensElement] =
    useManageCW20TokensDialog();
  const [openDeleteWallet, deleteWalletElement] = useDeleteWalletDialog();
  const [openTerraAddressQr, terraAddressQrElement] = useTerraAddressQrDialog();

  const { wallets, focusedWallet, focusedWalletIndex } = useStore();

  const passwordSavedAddresses = usePasswordSavedAddresses();

  const [hideSmallBalances, setHideSmallBalances] = useLocalStorageValue<
    'on' | 'off'
  >({ key: '__station_ui_hide_small_balances__', defaultValue: 'off' });

  const [selectedCardIndex, setSelectedCardIndex] = useState<number>(() =>
    wallets.length > 0 ? focusedWalletIndex : 0,
  );

  const isLedgerSupport = useMemo(() => {
    return isLedgerSupportBrowser();
  }, []);

  const updateSelectedIndex = useCallback(
    async (nextSelectedIndex: number) => {
      const nextIndex = Math.max(
        0,
        Math.min(wallets.length, nextSelectedIndex),
      );
      const nextWallet = wallets[nextIndex];
      if (nextWallet) {
        await focusWallet(nextWallet.terraAddress);
        setSelectedCardIndex(nextIndex);
      } else {
        setSelectedCardIndex(nextIndex);
      }
    },
    [wallets],
  );

  useEffect(() => {
    setSelectedCardIndex(focusedWalletIndex >= 0 ? focusedWalletIndex : 0);
  }, [focusedWalletIndex]);

  useEffect(() => {
    function handler(event: KeyboardEvent) {
      switch (event.key.toLowerCase()) {
        case 'arrowleft':
          updateSelectedIndex(selectedCardIndex - 1);
          break;
        case 'arrowright':
          updateSelectedIndex(selectedCardIndex + 1);
          break;
      }
    }

    window.addEventListener('keydown', handler);

    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, [selectedCardIndex, updateSelectedIndex]);

  const showTokenList = useMemo(() => {
    return selectedCardIndex === focusedWalletIndex;
  }, [focusedWalletIndex, selectedCardIndex]);

  const deleteWallet = useCallback(
    async (wallet: EncryptedWallet | LedgerWallet) => {
      const result = await openDeleteWallet({ wallet });

      if (result) {
        await removeWallet(wallet);
      }
    },
    [openDeleteWallet],
  );

  const tokens = useTokenList();

  return (
    <section className={className}>
      <header>
        <section>
          <a href={INDEX} target="terra-station-index">
            <TerraIcon />
          </a>
          <ConfigSelector />
        </section>

        <WalletCardSelector
          className="wallet-cards"
          cardWidth={280}
          cardHeight={140}
          selectedIndex={selectedCardIndex}
          onSelect={updateSelectedIndex}
          navItemRenderer={navItemRenderer}
        >
          {wallets.map((wallet) => (
            <WalletCard
              key={wallet.terraAddress}
              name={wallet.name}
              terraAddress={wallet.terraAddress}
              showCopyTerraAddress
              onShowQRCode={() =>
                openTerraAddressQr({ terraAddress: wallet.terraAddress })
              }
              design={wallet.design}
              rightBottomSection={
                passwordSavedAddresses.has(wallet.terraAddress) ? (
                  <SvgButton
                    onClick={() => {
                      removeSavedPassword(wallet.terraAddress);
                    }}
                    width={16}
                    height={16}
                    style={{
                      marginRight: 3,
                      transform: 'translateY(1px)',
                      opacity: 0.4,
                    }}
                  >
                    <MdLockOpen />
                  </SvgButton>
                ) : undefined
              }
            >
              <WalletMoreMenus>
                <Menu.Item
                  icon={<MdEdit />}
                  onClick={() =>
                    history.push(`/wallet/${wallet.terraAddress}/update`)
                  }
                >
                  Edit wallet
                </Menu.Item>

                {'encryptedWallet' in wallet && (
                  <Menu.Item
                    icon={<MdVpnKey />}
                    onClick={() =>
                      history.push(
                        `/wallet/${wallet.terraAddress}/change-password`,
                      )
                    }
                  >
                    <FormattedMessage id="wallet.change-password" />
                  </Menu.Item>
                )}

                {'encryptedWallet' in wallet && (
                  <Menu.Item
                    icon={<MdVpnKey />}
                    onClick={() =>
                      history.push(
                        `/wallet/${wallet.terraAddress}/reset-password`,
                      )
                    }
                  >
                    Reset password
                  </Menu.Item>
                )}

                {'encryptedWallet' in wallet && (
                  <Menu.Item
                    icon={<MdUpload />}
                    onClick={() =>
                      history.push(`/wallet/${wallet.terraAddress}/export`)
                    }
                  >
                    Export wallet
                  </Menu.Item>
                )}

                {/* TODO Run Verify Ledger */}
                {'usbDevice' in wallet && (
                  <Menu.Item
                    icon={<LedgerIcon />}
                    onClick={() => alert('verify ledger')}
                  >
                    Export wallet
                  </Menu.Item>
                )}

                <Menu.Item
                  icon={<MdDelete />}
                  onClick={() => deleteWallet(wallet)}
                >
                  <FormattedMessage id="wallet.delete" />
                </Menu.Item>
              </WalletMoreMenus>
            </WalletCard>
          ))}

          <EmptyWalletCard>Create or recover a wallet</EmptyWalletCard>
        </WalletCardSelector>
      </header>

      <main>
        {tokens &&
          tokens.filter(({ asset }) => 'native_token' in asset).length > 0 && (
            <div className="hide-small-balances-container">
              <Switch
                label="Hide small balances"
                size="xs"
                checked={hideSmallBalances === 'on'}
                onChange={({ currentTarget }) =>
                  setHideSmallBalances(currentTarget.checked ? 'on' : 'off')
                }
              />
            </div>
          )}

        {showTokenList && (
          <>
            {focusedWallet && tokens && tokens.length > 0 ? (
              <ListBox enableItemInteraction disableItemPadding>
                {tokens.map((token) => (
                  <TokenRow
                    key={
                      'token' +
                      ('native_token' in token.asset
                        ? token.asset.native_token.denom
                        : token.asset.token.contract_addr)
                    }
                    token={token}
                    focusedWallet={focusedWallet}
                    hideSmallBalances={hideSmallBalances}
                  />
                ))}
              </ListBox>
            ) : (
              <EmptyMessage>
                <h1>
                  <MdErrorOutline /> Wallet empty
                </h1>
                <p>This wallet doesn't hold any coins yet</p>
              </EmptyMessage>
            )}

            {focusedWallet && tokens && (
              <footer className="token-actions">
                <Button
                  variant="dim"
                  size="medium"
                  leftIcon={<MdAdd />}
                  onClick={() => openAddCW20Tokens({})}
                >
                  Add Token
                </Button>

                {tokens.some(({ isCW20Token }) => isCW20Token) && (
                  <Button
                    variant="dim"
                    size="medium"
                    leftIcon={<MdSettings />}
                    onClick={() => openManageCW20Tokens({})}
                  >
                    Manage Token
                  </Button>
                )}
              </footer>
            )}

            {focusedWallet && (
              <ListBox
                enableItemInteraction
                disableItemPadding
                style={{ marginTop: 40 }}
              >
                <ToolListItem>
                  <a
                    href="https://station.terra.money/history"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>History</span>
                    <SvgIcon width={15} height={15}>
                      <MdChevronRight />
                    </SvgIcon>
                  </a>
                </ToolListItem>
              </ListBox>
            )}
          </>
        )}

        {!showTokenList && (
          <>
            <ListBox enableItemInteraction disableItemPadding>
              {isLedgerSupport && (
                <ToolListItem>
                  <a
                    href="/app.html#/connect-ledger"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>
                      <FormattedMessage id="wallet.new.ledger" />
                    </span>
                    <SvgIcon width={24} height={24}>
                      <LedgerIcon />
                    </SvgIcon>
                  </a>
                </ToolListItem>
              )}
              <ToolListItem>
                <Link to="/wallets/create">
                  <span>
                    <FormattedMessage id="wallet.new" />
                  </span>
                  <SvgIcon width={24} height={24}>
                    <MdAddCircleOutline />
                  </SvgIcon>
                </Link>
              </ToolListItem>
              <ToolListItem>
                <Link to="/wallets/recover">
                  <span>
                    <FormattedMessage id="wallet.recover" />
                  </span>
                  <SvgIcon width={24} height={24}>
                    <MdSettingsBackupRestore />
                  </SvgIcon>
                </Link>
              </ToolListItem>
            </ListBox>
          </>
        )}
      </main>

      {addCW20TokensElement}
      {manageCW20TokensElement}
      {deleteWalletElement}
      {terraAddressQrElement}
    </section>
  );
}

function TokenRow({
  token: { asset, icon, info, balance },
  focusedWallet,
  hideSmallBalances,
}: {
  token: TokenListItem;
  focusedWallet: EncryptedWallet | LedgerWallet;
  hideSmallBalances: 'on' | 'off';
}) {
  const { data: ustValue } = useTerraTokenUstValueQuery(asset, balance);

  if (hideSmallBalances === 'on' && ustValue && big(ustValue).lt(1000000)) {
    return null;
  }

  return (
    <li>
      <TokenItem
        to={`/wallet/${focusedWallet.terraAddress}/token/${
          'native_token' in asset
            ? asset.native_token.denom
            : asset.token.contract_addr
        }`}
      >
        <div>
          <TokenSymbolIcon
            className="symbol-icon"
            src={icon}
            name={info?.symbol ?? ''}
            size={16}
          />
          <span>{info?.symbol}</span>
        </div>

        <div>
          <Balances>
            <AnimateNumber
              format={formatUTokenWithPostfixUnits}
              decimalPointsFontSize="12px"
            >
              {balance}
            </AnimateNumber>
            {ustValue &&
              ('token' in asset || asset.native_token.denom !== 'uusd') && (
                <sub>
                  <AnimateNumber format={formatUTokenWithPostfixUnits}>
                    {ustValue}
                  </AnimateNumber>{' '}
                  USD
                </sub>
              )}
          </Balances>

          <MdChevronRight />
        </div>
      </TokenItem>
    </li>
  );
}

const Balances = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;

  > sub {
    vertical-align: unset;
    font-size: 11px;
    font-weight: normal;
    color: var(--desaturated-800);
  }
`;

const ToolListItem = styled.li`
  a {
    padding: 0 20px;
    height: 60px;

    display: flex;
    justify-content: space-between;
    align-items: center;

    text-decoration: none;

    color: inherit;

    font-size: 14px;
    font-weight: 700;
  }
`;

const TokenItem = styled(Link)`
  padding: 0 20px;
  height: 60px;

  display: flex;
  justify-content: space-between;
  align-items: center;

  text-decoration: none;

  color: inherit;

  > :first-child {
    display: flex;
    align-items: center;

    font-size: 14px;
    font-weight: 700;

    .symbol-icon {
      margin-right: 8px;
    }
  }

  > :last-child {
    display: flex;
    align-items: center;

    font-size: 15px;
    font-weight: 500;

    > :last-child {
      margin-left: 15px;
    }
  }
`;

const EmptyMessage = styled(Box)`
  h1 {
    font-size: 16px;
    font-weight: 700;
    line-height: 1.5;

    svg {
      display: inline-block;
      transform: translateY(0.15em) scale(1.2);
    }
  }

  p {
    margin-top: 5px;

    font-size: 14px;
    line-height: 1.5;
  }
`;

export const Dashboard = styled(DashboardBase)`
  header {
    background-color: var(--color-header-background);
    color: var(--color-header-text);

    padding: 20px;
    height: 244px;

    > section {
      width: 100%;
      height: 20px;

      display: flex;
      justify-content: space-between;

      a {
        width: 20px;
        color: inherit;
      }
    }

    .wallet-cards {
      width: 100%;
      height: 180px;
    }
  }

  main {
    max-height: calc(100vh - 244px);
    overflow-y: auto;

    padding: 20px;

    max-width: 800px;
    margin: 0 auto;

    .hide-small-balances-container {
      height: 30px;
      display: flex;
      justify-content: flex-end;
      padding-right: 4px;
    }

    .token-actions {
      margin-top: 20px;

      display: flex;
      gap: 14px;

      > * {
        flex: 1;
      }
    }
  }
`;
