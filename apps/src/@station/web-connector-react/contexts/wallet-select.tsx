import { WebConnectorWalletInfo } from '@terra-dev/web-connector-interface';
import React, {
  Consumer,
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
import { useWebConnector } from './web-extension';

export interface WalletSelectProviderProps {
  children: ReactNode;
}

export interface WalletSelect {
  wallets: WebConnectorWalletInfo[];
  selectedWallet: WebConnectorWalletInfo | null;
  selectWallet: (nextWallet: WebConnectorWalletInfo) => void;
}

const WalletSelectContext: Context<WalletSelect> =
  // @ts-ignore
  createContext<WalletSelect>();

const CURRENT_WALLET_ADDRESS = '__current_wallet_address__';

export function WalletSelectProvider({ children }: WalletSelectProviderProps) {
  const { states } = useWebConnector();

  const [selectedWallet, setSelectedWallet] =
    useState<WebConnectorWalletInfo | null>(null);

  const selectedWalletRef = useStateRef(selectedWallet);

  const selectWallet = useCallback((wallet: WebConnectorWalletInfo) => {
    setSelectedWallet(wallet);
    localStorage.setItem(CURRENT_WALLET_ADDRESS, wallet.terraAddress);
  }, []);

  const state = useMemo<WalletSelect>(
    () => ({
      wallets: states?.wallets ?? [],
      selectedWallet: selectedWallet,
      selectWallet,
    }),
    [states?.wallets, selectedWallet, selectWallet],
  );

  useEffect(() => {
    if (!states) {
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

export const WalletSelectConsumer: Consumer<WalletSelect> =
  WalletSelectContext.Consumer;
