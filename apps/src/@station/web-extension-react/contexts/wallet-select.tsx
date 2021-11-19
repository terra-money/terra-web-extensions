import {
  WebExtensionStatus,
  WebExtensionWalletInfo,
} from '@terra-dev/web-extension-interface';
import React, {
  Context,
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useStateRef } from 'use-state-ref';
import { useWebExtensionConnector } from './web-extension';

export interface WalletSelectProviderProps {
  children: ReactNode;
}

export interface WalletSelect {
  wallets: WebExtensionWalletInfo[];
  selectedWallet: WebExtensionWalletInfo | null;
  selectWallet: (nextWallet: WebExtensionWalletInfo) => void;
}

const WalletSelectContext: Context<WalletSelect> =
  // @ts-ignore
  createContext<WalletSelect>();

const CURRENT_WALLET_ADDRESS = '__current_wallet_address__';

export function WalletSelectProvider({ children }: WalletSelectProviderProps) {
  const { states } = useWebExtensionConnector();

  const [selectedWallet, setSelectedWallet] =
    useState<WebExtensionWalletInfo | null>(null);

  const selectedWalletRef = useStateRef(selectedWallet);

  const selectWallet = useCallback((wallet: WebExtensionWalletInfo) => {
    setSelectedWallet(wallet);
    localStorage.setItem(CURRENT_WALLET_ADDRESS, wallet.terraAddress);
  }, []);

  const state = useMemo<WalletSelect>(
    () => ({
      wallets: states.type === WebExtensionStatus.READY ? states.wallets : [],
      selectedWallet: selectedWallet,
      selectWallet,
    }),
    [states, selectedWallet, selectWallet],
  );

  useEffect(() => {
    if (states.type !== WebExtensionStatus.READY) {
      return;
    }

    // clientStates initialized
    if (!selectedWalletRef.current && states.wallets.length > 0) {
      const currentWalletAddress = localStorage.getItem(CURRENT_WALLET_ADDRESS);

      if (currentWalletAddress) {
        setSelectedWallet(
          states.wallets.find(
            (wallet) => wallet.terraAddress === currentWalletAddress,
          ) ?? states.wallets[0],
        );
      } else {
        setSelectedWallet(states.wallets[0]);
      }
    }

    // all wallets deleted
    if (states.wallets.length === 0) {
      setSelectedWallet(null);
      localStorage.removeItem(CURRENT_WALLET_ADDRESS);
      return;
    }

    // current wallet deleted
    if (selectedWalletRef.current) {
      const currentWalletAddress = selectedWalletRef.current.terraAddress;

      if (
        states.wallets.every(
          (wallet) => wallet.terraAddress !== currentWalletAddress,
        )
      ) {
        setSelectedWallet(states.wallets[0]);
        localStorage.setItem(
          CURRENT_WALLET_ADDRESS,
          states.wallets[0].terraAddress,
        );
        return;
      }
    }
  }, [states, selectedWalletRef]);

  return (
    <WalletSelectContext.Provider value={state}>
      {children}
    </WalletSelectContext.Provider>
  );
}

export function useWalletSelect(): WalletSelect {
  return useContext(WalletSelectContext);
}
