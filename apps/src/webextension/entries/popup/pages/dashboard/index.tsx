import { formatUTokenWithPostfixUnits } from '@libs/formatter';
import { AnimateNumber } from '@libs/ui';
import { Menu } from '@mantine/core';
import {
  Box,
  Button,
  EmptyWalletCard,
  ListBox,
  SvgIcon,
  WalletCard,
  WalletCardSelector,
  WalletMoreMenus,
} from '@station/ui2';
import {
  focusWallet,
  isLedgerSupportBrowser,
  removeWallet,
} from '@terra-dev/web-extension-backend';
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
  MdSettings,
  MdSettingsBackupRestore,
  MdUpload,
  MdVpnKey,
  MdWeb,
} from 'react-icons/md';
import { FormattedMessage } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { LedgerIcon, TerraIcon } from 'webextension/assets';
import { ConfigSelector } from 'webextension/components/header/ConfigSelector';
import { useStore } from 'webextension/contexts/store';
import { extensionPath } from 'webextension/logics/extensionPath';
import { useTokenList } from 'webextension/queries/useTokenList';

const INDEX = extensionPath('index.html');

function navItemRenderer(length: number, itemIndex: number) {
  return itemIndex >= length - 1 ? <MdAddCircle /> : <MdCallToAction />;
}

function DashboardBase({ className }: { className?: string }) {
  const history = useHistory();

  const { wallets, focusedWallet, focusedWalletIndex } = useStore();

  const [selectedCardIndex, setSelectedCardIndex] =
    useState<number>(focusedWalletIndex);

  const isLedgerSupport = useMemo(() => {
    return isLedgerSupportBrowser();
  }, []);

  const updateSelectedIndex = useCallback(
    async (nextSelectedIndex) => {
      const nextWallet = wallets[nextSelectedIndex];
      if (nextWallet) {
        await focusWallet(nextWallet.terraAddress);
        setSelectedCardIndex(nextSelectedIndex);
      } else {
        setSelectedCardIndex(nextSelectedIndex);
      }
    },
    [wallets],
  );

  useEffect(() => {
    setSelectedCardIndex(focusedWalletIndex);
  }, [focusedWalletIndex]);

  const showTokenList = useMemo(() => {
    return selectedCardIndex === focusedWalletIndex;
  }, [focusedWalletIndex, selectedCardIndex]);

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
                history.push(`/wallet/${wallet.terraAddress}/qr`)
              }
              design={wallet.design}
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
                      history.push(`/wallet/${wallet.terraAddress}/password`)
                    }
                  >
                    <FormattedMessage id="wallet.change-password" />
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

                {/* TODO Confirm Dialog */}
                <Menu.Item
                  icon={<MdDelete />}
                  onClick={() => removeWallet(wallet)}
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
        {showTokenList && (
          <>
            {focusedWallet && tokens && tokens.length > 0 ? (
              <ListBox enableItemInteraction disableItemPadding>
                {tokens.map(({ asset, balance, info, icon }, i) => (
                  <li key={'token' + i}>
                    <TokenItem
                      to={`/wallet/${focusedWallet.terraAddress}/send/${
                        'native_token' in asset
                          ? asset.native_token.denom
                          : asset.token.contract_addr
                      }`}
                    >
                      <div>
                        {'token' in asset ? (
                          <img src={icon} alt={info?.name} />
                        ) : (
                          <img src={icon} alt={info?.name} />
                        )}
                        <span>{info?.symbol}</span>
                      </div>

                      <div>
                        <AnimateNumber
                          format={formatUTokenWithPostfixUnits}
                          decimalPointsFontSize="12px"
                        >
                          {balance}
                        </AnimateNumber>

                        <MdChevronRight />
                      </div>
                    </TokenItem>
                  </li>
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
                <Button<Link>
                  variant="dim"
                  size="medium"
                  leftIcon={<MdAdd />}
                  component={Link as any}
                  to={`/tokens/add`}
                >
                  Add Token
                </Button>

                {tokens.some(({ isCW20Token }) => isCW20Token) && (
                  <Button<Link>
                    variant="dim"
                    size="medium"
                    leftIcon={<MdSettings />}
                    component={Link as any}
                    to={`/tokens`}
                  >
                    Manage Token
                  </Button>
                )}
              </footer>
            )}
          </>
        )}

        {!showTokenList && (
          <>
            <ListBox enableItemInteraction disableItemPadding>
              {isLedgerSupport && (
                <ToolListItem>
                  <a
                    href="/connect-ledger.html"
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
              <ToolListItem>
                <Link to="/dapps">
                  <span>Whitelist dApps</span>
                  <SvgIcon width={24} height={24}>
                    <MdWeb />
                  </SvgIcon>
                </Link>
              </ToolListItem>
            </ListBox>
          </>
        )}
      </main>
    </section>
  );
}

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

    img {
      width: 16px;
      height: 16px;

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
