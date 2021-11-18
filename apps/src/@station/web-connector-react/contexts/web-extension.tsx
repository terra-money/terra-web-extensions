import {
  WalletPostPayload,
  WalletSignPayload,
  WalletStates,
  WalletStatus,
  WalletStatusInitializing,
  WalletStatusNoAvailable,
  WalletStatusReady,
  WalletStatusType,
  WalletTxResult,
} from '@terra-dev/wallet-interface';
import { CreateTxOptions } from '@terra-money/terra.js';
import React, {
  Context,
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Subscribable } from 'rxjs';
import { WalletConnectorController } from '../controllers/connector-controller';

export interface WalletConnectorProviderProps {
  children: ReactNode;
  controller: WalletConnectorController;
}

export interface WalletConnectorState {
  controller: WalletConnectorController;
  status: WalletStatus;
  states: WalletStates | null;
  refetchStates: () => void;
  requestApproval: (() => void) | null;
  post: (
    terraAddress: string,
    tx: CreateTxOptions,
  ) => Subscribable<WalletTxResult<WalletPostPayload>>;
  sign: (
    terraAddress: string,
    tx: CreateTxOptions,
  ) => Subscribable<WalletTxResult<WalletSignPayload>>;
  hasCW20Tokens: (
    chainID: string,
    ...tokenAddrs: string[]
  ) => Promise<{ [tokenAddr: string]: boolean }>;
  addCW20Tokens: (
    chainID: string,
    ...tokenAddrs: string[]
  ) => Promise<{ [tokenAddr: string]: boolean }>;
  hasNetwork: (chainID: string, lcd: string) => Promise<boolean>;
  addNetwork: (
    name: string | undefined,
    chainID: string,
    lcd: string,
  ) => Promise<boolean>;
}

const WalletConnectorContext: Context<WalletConnectorState> =
  // @ts-ignore
  createContext<WalletConnectorState>();

export function WalletConnectorProvider({
  children,
  controller,
}: WalletConnectorProviderProps) {
  const [status, setStatus] = useState<
    WalletStatusInitializing | WalletStatusNoAvailable | WalletStatusReady
  >(() => ({
    type: WalletStatusType.INITIALIZING,
  }));
  const [states, setStates] = useState<WalletStates | null>(null);

  const requestApproval = useMemo(() => {
    return status.type === WalletStatusType.NO_AVAILABLE &&
      status.isApproved === false
      ? controller.requestApproval
      : null;
  }, [controller.requestApproval, status]);

  useEffect(() => {
    controller.refetchStates();

    const statusSubscription = controller.status().subscribe((nextStatus) => {
      setStatus(nextStatus);
    });

    const statesSubscription = controller.states().subscribe((nextStates) => {
      setStates(nextStates);
    });

    return () => {
      statusSubscription.unsubscribe();
      statesSubscription.unsubscribe();
    };
  }, [controller]);

  const state = useMemo<WalletConnectorState>(
    () => ({
      controller,
      status,
      states,
      refetchStates: controller.refetchStates,
      requestApproval,
      post: controller.post,
      sign: controller.sign,
      hasCW20Tokens: controller.hasCW20Tokens,
      addCW20Tokens: controller.addCW20Tokens,
      hasNetwork: controller.hasNetwork,
      addNetwork: controller.addNetwork,
    }),
    [controller, status, states, requestApproval],
  );

  return (
    <WalletConnectorContext.Provider value={state}>
      {children}
    </WalletConnectorContext.Provider>
  );
}

export function useWalletConnector(): WalletConnectorState {
  return useContext(WalletConnectorContext);
}
