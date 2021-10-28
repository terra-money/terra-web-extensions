import { MantineProvider } from '@mantine/core';
import { WalletContext, WalletStatus } from '@terra-dev/use-wallet';
import React, { useMemo } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AppProvider } from '../src/@libs/app-provider';
import {
  STATION_CONSTANTS,
  STATION_CONTRACT_ADDRESS,
  STATION_TX_REFETCH_MAP,
} from '../src/webextension/env';

export const parameters = {
  backgrounds: {
    default: 'content',
    values: [
      { name: 'content', value: 'var(--color-content-background)' },
      { name: 'box', value: 'var(--color-box-background)' },
      { name: 'header', value: 'var(--color-header-background)' },
    ],
  },
};

export const decorators = [
  (Story) => (
    <AppProviders>
      <MantineProvider theme={{ fontFamily: 'var(--font-family)' }}>
        <Story />
      </MantineProvider>
    </AppProviders>
  ),
];

// ---------------------------------------------
// app providers
// ---------------------------------------------
const queryClient = new QueryClient();

function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <StaticWalletProvider
        status={WalletStatus.WALLET_CONNECTED}
        wallets={[{}]}
      >
        <AppProvider
          defaultQueryClient="lcd"
          constants={STATION_CONSTANTS}
          contractAddress={STATION_CONTRACT_ADDRESS}
          refetchMap={STATION_TX_REFETCH_MAP}
        >
          {children}
        </AppProvider>
      </StaticWalletProvider>
    </QueryClientProvider>
  );
}

function StaticWalletProvider({
  children,
  status = WalletStatus.INITIALIZING,
  availableConnectTypes = [],
  availableInstallTypes = [],
  wallets = [],
}) {
  const state = useMemo(() => {
    return {
      availableConnectTypes,
      availableInstallTypes,
      status,
      network: {
        name: 'testnet',
        chainID: 'bombay-12',
        lcd: 'https://bombay-lcd.terra.dev',
      },
      wallets,
      install: () => {
        throw new Error('not implemented!');
      },
      connect: () => {
        throw new Error('not implemented!');
      },
      connectReadonly: () => {
        throw new Error('not implemented!');
      },
      disconnect: () => {
        throw new Error('not implemented!');
      },
      post: () => {
        throw new Error('not implemented!');
      },
      sign: () => {
        throw new Error('not implemented!');
      },
      recheckStatus: () => {
        throw new Error('not implemented!');
      },
      isChromeExtensionCompatibleBrowser: () => {
        throw new Error('not implemented!');
      },
    };
  }, [availableConnectTypes, availableInstallTypes, status, wallets]);

  return (
    <WalletContext.Provider value={state}>{children}</WalletContext.Provider>
  );
}
