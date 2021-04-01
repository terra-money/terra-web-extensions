import {
  ClientStates,
  ClientStatus,
  ExecuteParams,
  Status,
  StatusInitializing,
  StatusNoAvailable,
  StatusReady,
  TerraConnectClient,
} from '@terra-dev/terra-connect';
import { TxDenied, TxFail, TxProgress, TxSucceed } from '@terra-dev/tx';
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

export interface TerraConnectProviderProps {
  children: ReactNode;
  client: TerraConnectClient;
}

export interface TerraConnect {
  client: TerraConnectClient;
  status: Status;
  clientStates: ClientStates | null;
  refetchClientStates: () => void;
  execute: (
    params: ExecuteParams,
  ) => Observable<TxProgress | TxSucceed | TxFail | TxDenied>;
}

// @ts-ignore
const TerraConnectContext: Context<TerraConnect> = createContext<TerraConnect>();

export function TerraConnectProvider({
  children,
  client,
}: TerraConnectProviderProps) {
  const [status, setStatus] = useState<
    StatusInitializing | StatusNoAvailable | StatusReady
  >(() => ({
    type: ClientStatus.INITIALIZING,
  }));
  const [clientStates, setClientStates] = useState<ClientStates | null>(null);

  const refetchClientStates = useCallback(() => {
    client.refetchClientStates();
  }, [client]);

  useEffect(() => {
    client.refetchClientStates();

    const statusSubscription = client.status().subscribe((status) => {
      setStatus(status);
    });

    const statesSubscription = client
      .clientStates()
      .subscribe((clientStates) => {
        setClientStates(clientStates);
      });

    return () => {
      statusSubscription.unsubscribe();
      statesSubscription.unsubscribe();
    };
  }, [client]);

  const state = useMemo<TerraConnect>(
    () => ({
      client,
      status,
      clientStates,
      refetchClientStates,
      execute: client.execute,
    }),
    [client, clientStates, refetchClientStates, status],
  );

  return (
    <TerraConnectContext.Provider value={state}>
      {children}
    </TerraConnectContext.Provider>
  );
}

export function useTerraConnect(): TerraConnect {
  return useContext(TerraConnectContext);
}

export const TerraConnectConsumer: Consumer<TerraConnect> =
  TerraConnectContext.Consumer;
