import {
  WebExtensionPostPayload,
  WebExtensionSignPayload,
  WebExtensionStates,
  WebExtensionStatus,
  WebExtensionStatusInitializing,
  WebExtensionStatusNoAvailable,
  WebExtensionStatusReady,
  WebExtensionStatusType,
  WebExtensionTxResult,
} from '@terra-dev/web-extension-interface';
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
import { WebExtensionConnectorController } from '../controllers/connector-controller';

export interface WebExtensionConnectorProviderProps {
  children: ReactNode;
  controller: WebExtensionConnectorController;
}

export interface WebExtensionConnectorState {
  controller: WebExtensionConnectorController;
  status: WebExtensionStatus;
  states: WebExtensionStates | null;
  refetchStates: () => void;
  requestApproval: (() => void) | null;
  post: (
    terraAddress: string,
    tx: CreateTxOptions,
  ) => Subscribable<WebExtensionTxResult<WebExtensionPostPayload>>;
  sign: (
    terraAddress: string,
    tx: CreateTxOptions,
  ) => Subscribable<WebExtensionTxResult<WebExtensionSignPayload>>;
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

const WebExtensionConnectorContext: Context<WebExtensionConnectorState> =
  // @ts-ignore
  createContext<WebExtensionConnectorState>();

export function WebExtensionConnectorProvider({
  children,
  controller,
}: WebExtensionConnectorProviderProps) {
  const [status, setStatus] = useState<
    | WebExtensionStatusInitializing
    | WebExtensionStatusNoAvailable
    | WebExtensionStatusReady
  >(() => ({
    type: WebExtensionStatusType.INITIALIZING,
  }));
  const [states, setStates] = useState<WebExtensionStates | null>(null);

  const requestApproval = useMemo(() => {
    return status.type === WebExtensionStatusType.NO_AVAILABLE &&
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

  const state = useMemo<WebExtensionConnectorState>(
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
    <WebExtensionConnectorContext.Provider value={state}>
      {children}
    </WebExtensionConnectorContext.Provider>
  );
}

export function useWebExtensionConnector(): WebExtensionConnectorState {
  return useContext(WebExtensionConnectorContext);
}
