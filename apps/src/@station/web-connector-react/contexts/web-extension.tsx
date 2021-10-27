import { WebConnectorController } from '@terra-dev/web-connector-controller';
import {
  WebConnectorStates,
  WebConnectorStatus,
  WebConnectorStatusInitializing,
  WebConnectorStatusNoAvailable,
  WebConnectorStatusReady,
  WebConnectorStatusType,
  WebConnectorTxResult,
} from '@terra-dev/web-connector-interface';
import { CreateTxOptions } from '@terra-money/terra.js';
import React, {
  Consumer,
  Context,
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Observable } from 'rxjs';

export interface WebConnectorProviderProps {
  children: ReactNode;
  controller: WebConnectorController;
}

export interface WebConnectorState {
  controller: WebConnectorController;
  status: WebConnectorStatus;
  states: WebConnectorStates | null;
  refetchStates: () => void;
  requestApproval: (() => void) | null;
  post: (
    terraAddress: string,
    tx: CreateTxOptions,
  ) => Observable<WebConnectorTxResult>;
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

const WebConnectorContext: Context<WebConnectorState> =
  // @ts-ignore
  createContext<WebConnectorState>();

export function WebConnectorProvider({
  children,
  controller,
}: WebConnectorProviderProps) {
  const [status, setStatus] = useState<
    | WebConnectorStatusInitializing
    | WebConnectorStatusNoAvailable
    | WebConnectorStatusReady
  >(() => ({
    type: WebConnectorStatusType.INITIALIZING,
  }));
  const [states, setStates] = useState<WebConnectorStates | null>(null);

  const requestApproval = useMemo(() => {
    return status.type === WebConnectorStatusType.NO_AVAILABLE &&
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

  const state = useMemo<WebConnectorState>(
    () => ({
      controller,
      status,
      states,
      refetchStates: controller.refetchStates,
      requestApproval,
      post: controller.post,
      hasCW20Tokens: controller.hasCW20Tokens,
      addCW20Tokens: controller.addCW20Tokens,
      hasNetwork: controller.hasNetwork,
      addNetwork: controller.addNetwork,
    }),
    [controller, status, states, requestApproval],
  );

  return (
    <WebConnectorContext.Provider value={state}>
      {children}
    </WebConnectorContext.Provider>
  );
}

export function useWebConnector(): WebConnectorState {
  return useContext(WebConnectorContext);
}

export const WebConnectorConsumer: Consumer<WebConnectorState> =
  WebConnectorContext.Consumer;
