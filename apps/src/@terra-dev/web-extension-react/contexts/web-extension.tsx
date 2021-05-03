import {
  PostParams,
  WebExtensionController,
  WebExtensionStates,
  WebExtensionStatus,
  WebExtensionStatusInitializing,
  WebExtensionStatusNoAvailable,
  WebExtensionStatusReady,
  WebExtensionStatusType,
  WebExtensionTxResult,
} from '@terra-dev/web-extension';
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
import { Observable } from 'rxjs';

export interface WebExtensionProviderProps {
  children: ReactNode;
  controller: WebExtensionController;
}

export interface WebExtensionState {
  controller: WebExtensionController;
  status: WebExtensionStatus;
  clientStates: WebExtensionStates | null;
  refetchClientStates: () => void;
  post: (params: PostParams) => Observable<WebExtensionTxResult>;
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
  const [clientStates, setClientStates] = useState<WebExtensionStates | null>(
    null,
  );

  const refetchClientStates = useCallback(() => {
    controller.refetchClientStates();
  }, [controller]);

  useEffect(() => {
    controller.refetchClientStates();

    const statusSubscription = controller.status().subscribe((nextStatus) => {
      setStatus(nextStatus);
    });

    const statesSubscription = controller
      .clientStates()
      .subscribe((nextClientStates) => {
        setClientStates(nextClientStates);
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
      clientStates,
      refetchClientStates,
      post: controller.post,
    }),
    [clientStates, controller, refetchClientStates, status],
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
