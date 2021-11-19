import {
  WebExtensionPostPayload,
  WebExtensionSignPayload,
  WebExtensionStates,
  WebExtensionStatus,
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
  states: WebExtensionStates;
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
  const [states, setStates] = useState<WebExtensionStates>(() => {
    return {
      type: WebExtensionStatus.INITIALIZING,
    };
  });

  const requestApproval = useMemo(() => {
    return states.type === WebExtensionStatus.NO_AVAILABLE &&
      states.isApproved === false
      ? controller.requestApproval
      : null;
  }, [controller.requestApproval, states]);

  useEffect(() => {
    controller.refetchStates();

    const statesSubscription = controller.states().subscribe((nextStates) => {
      setStates(nextStates);
    });

    return () => {
      statesSubscription.unsubscribe();
    };
  }, [controller]);

  const state = useMemo<WebExtensionConnectorState>(
    () => ({
      controller,
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
    [controller, states, requestApproval],
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
