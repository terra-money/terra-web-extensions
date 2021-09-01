import {
  canRequestApproval,
  PostParams,
  WebExtensionController,
  WebExtensionStates,
  WebExtensionStatus,
  WebExtensionStatusInitializing,
  WebExtensionStatusNoAvailable,
  WebExtensionStatusReady,
  WebExtensionStatusType,
  WebExtensionTxProgress,
  WebExtensionTxSucceed,
} from '@terra-dev/web-extension';
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

export interface WebExtensionProviderProps {
  children: ReactNode;
  controller: WebExtensionController;
}

export interface WebExtensionState {
  controller: WebExtensionController;
  status: WebExtensionStatus;
  states: WebExtensionStates | null;
  refetchStates: () => void;
  requestApproval: (() => void) | null;
  post: (
    params: PostParams,
  ) => Observable<WebExtensionTxSucceed | WebExtensionTxProgress>;
  addCW20Tokens: (
    chainID: string,
    ...tokenAddrs: string[]
  ) => Promise<{ [tokenAddr: string]: boolean }>;
  hasCW20Tokens: (
    chainID: string,
    ...tokenAddrs: string[]
  ) => Promise<{ [tokenAddr: string]: boolean }>;
}

// @ts-ignore
const WebExtensionContext: Context<WebExtensionState> = createContext<WebExtensionState>();

export function WebExtensionProvider({
  children,
  controller,
}: WebExtensionProviderProps) {
  const [status, setStatus] = useState<
    | WebExtensionStatusInitializing
    | WebExtensionStatusNoAvailable
    | WebExtensionStatusReady
  >(() => ({
    type: WebExtensionStatusType.INITIALIZING,
  }));
  const [states, setStates] = useState<WebExtensionStates | null>(null);

  const requestApproval = useMemo(() => {
    return canRequestApproval(status) ? controller.requestApproval : null;
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

  const state = useMemo<WebExtensionState>(
    () => ({
      controller,
      status,
      states,
      refetchStates: controller.refetchStates,
      requestApproval,
      post: controller.post,
      addCW20Tokens: controller.addCW20Tokens,
      hasCW20Tokens: controller.hasCW20Tokens,
    }),
    [controller, status, states, requestApproval],
  );

  return (
    <WebExtensionContext.Provider value={state}>
      {children}
    </WebExtensionContext.Provider>
  );
}

export function useWebExtension(): WebExtensionState {
  return useContext(WebExtensionContext);
}

export const WebExtensionConsumer: Consumer<WebExtensionState> =
  WebExtensionContext.Consumer;
