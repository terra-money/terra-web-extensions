import { WalletInfo } from '@terra-dev/wallet';
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
import { useWebExtension } from './web-extension';

export interface WalletSelectProviderProps {
  children: ReactNode;
}

export interface WalletSelect {
  wallets: WalletInfo[];
  selectedWallet: WalletInfo | null;
  selectWallet: (nextWallet: WalletInfo) => void;
}

// @ts-ignore
const WalletSelectContext: Context<WalletSelect> = createContext<WalletSelect>();

const CURRENT_WALLET_ADDRESS = '__current_wallet_address__';

export function WalletSelectProvider({ children }: WalletSelectProviderProps) {
  const { clientStates } = useWebExtension();

  const [selectedWallet, setSelectedWallet] = useState<WalletInfo | null>(null);

  const selectedWalletRef = useStateRef(selectedWallet);

  const selectWallet = useCallback((wallet: WalletInfo) => {
    setSelectedWallet(wallet);
    localStorage.setItem(CURRENT_WALLET_ADDRESS, wallet.terraAddress);
  }, []);

  const state = useMemo<WalletSelect>(
    () => ({
      wallets: clientStates?.wallets ?? [],
      selectedWallet: selectedWallet,
      selectWallet,
    }),
    [clientStates?.wallets, selectedWallet, selectWallet],
  );

  useEffect(() => {
    if (!clientStates) {
      return;
    }

    // clientStates initialized
    if (!selectedWalletRef.current && clientStates.wallets.length > 0) {
      const currentWalletAddress = localStorage.getItem(CURRENT_WALLET_ADDRESS);

      if (currentWalletAddress) {
        setSelectedWallet(
          clientStates.wallets.find(
            (wallet) => wallet.terraAddress === currentWalletAddress,
          ) ?? clientStates.wallets[0],
        );
      } else {
        setSelectedWallet(clientStates.wallets[0]);
      }
    }

    // all wallets deleted
    if (clientStates.wallets.length === 0) {
      setSelectedWallet(null);
      localStorage.removeItem(CURRENT_WALLET_ADDRESS);
      return;
    }

    // current wallet deleted
    if (selectedWalletRef.current) {
      const currentWalletAddress = selectedWalletRef.current.terraAddress;

      if (
        clientStates.wallets.every(
          (wallet) => wallet.terraAddress !== currentWalletAddress,
        )
      ) {
        setSelectedWallet(clientStates.wallets[0]);
        localStorage.setItem(
          CURRENT_WALLET_ADDRESS,
          clientStates.wallets[0].terraAddress,
        );
        return;
      }
    }
  }, [clientStates, selectedWalletRef]);

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
