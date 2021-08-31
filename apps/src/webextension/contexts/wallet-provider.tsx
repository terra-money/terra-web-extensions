import {
  ConnectType,
  Wallet,
  WalletContext,
  WalletStatus,
} from '@terra-dev/use-wallet';
import { NetworkInfo } from '@terra-dev/wallet-types';
import { CreateTxOptions } from '@terra-money/terra.js';
import React, { ReactNode, useMemo } from 'react';
import { useNetworks } from '../queries/useNetworks';
import { useWallets } from '../queries/useWallets';

export interface InternalWalletProviderProps {
  children: ReactNode;
}

export function WebExtensionInternalWalletProvider({
  children,
}: InternalWalletProviderProps) {
  const { focusedWallet } = useWallets();
  const { networks, selectedNetwork } = useNetworks();

  const state = useMemo<Wallet>(() => {
    return {
      availableConnectTypes: [ConnectType.WEBEXTENSION],
      availableInstallTypes: [],
      status: !!focusedWallet
        ? WalletStatus.WALLET_CONNECTED
        : WalletStatus.WALLET_NOT_CONNECTED,
      network: selectedNetwork ?? networks[0],
      wallets: focusedWallet
        ? [
            {
              connectType: ConnectType.WEBEXTENSION,
              terraAddress: focusedWallet.terraAddress,
              design: focusedWallet.design,
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
      post: (
        tx: CreateTxOptions,
        txTarget?: {
          network?: NetworkInfo;
          terraAddress?: string;
        },
      ) => {
        // TODO implement
        throw new Error('not implemented!');
      },
      recheckStatus: () => {
        throw new Error('not implemented!');
      },
      isChromeExtensionCompatibleBrowser: () => {
        throw new Error('not implemented!');
      },
    };
  }, [focusedWallet, networks, selectedNetwork]);

  return (
    <WalletContext.Provider value={state}>{children}</WalletContext.Provider>
  );
}
