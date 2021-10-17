import {
  ConnectType,
  Wallet,
  WalletContext,
  WalletStatus,
} from '@terra-dev/use-wallet';
import { WebConnectorNetworkInfo } from '@terra-dev/web-connector-interface';
import { NetworksData, WalletsData } from '@terra-dev/web-extension-backend';
import { CreateTxOptions } from '@terra-money/terra.js';
import React, {
  Consumer,
  Context,
  createContext,
  ReactNode,
  useContext,
  useMemo,
} from 'react';
import { useDefaultNetworks } from 'webextension/queries/useDefaultNetworks';
import { useNetworksStore } from './useNetworksStore';
import { useWalletsStore } from './useWalletsStore';

export interface StoreProviderProps {
  children: ReactNode;
}

export type Store = WalletsData &
  NetworksData & { defaultNetworks: WebConnectorNetworkInfo[] };

// @ts-ignore
const StoreContext: Context<Store> = createContext<Store>();

export function StoreProvider({ children }: StoreProviderProps) {
  const defaultNetworks = useDefaultNetworks();

  const walletsData = useWalletsStore();
  const networksData = useNetworksStore(defaultNetworks);

  const store = useMemo<Store>(
    () => ({
      ...walletsData,
      ...networksData,
      defaultNetworks,
    }),
    [defaultNetworks, networksData, walletsData],
  );

  const wallet = useMemo<Wallet>(() => {
    return {
      availableConnectTypes: [ConnectType.WEBEXTENSION],
      availableInstallTypes: [],
      status: !!walletsData.focusedWallet
        ? WalletStatus.WALLET_CONNECTED
        : WalletStatus.WALLET_NOT_CONNECTED,
      network: networksData.selectedNetwork ?? networksData.networks[0],
      wallets: walletsData.focusedWallet
        ? [
            {
              connectType: ConnectType.WEBEXTENSION,
              terraAddress: walletsData.focusedWallet.terraAddress,
              design: walletsData.focusedWallet.design,
            },
          ]
        : [],
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
      sign: (tx: CreateTxOptions) => {
        throw new Error('not implemented!');
      },
      post: (tx: CreateTxOptions) => {
        throw new Error('not implemented!');
      },
      recheckStatus: () => {
        throw new Error('not implemented!');
      },
      isChromeExtensionCompatibleBrowser: () => {
        throw new Error('not implemented!');
      },
    };
  }, [
    networksData.networks,
    networksData.selectedNetwork,
    walletsData.focusedWallet,
  ]);

  return (
    <StoreContext.Provider value={store}>
      <WalletContext.Provider value={wallet}>{children}</WalletContext.Provider>
    </StoreContext.Provider>
  );
}

export function useStore(): Store {
  return useContext(StoreContext);
}

export const StoreConsumer: Consumer<Store> = StoreContext.Consumer;
