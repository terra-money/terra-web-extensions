import { Network } from '@terra-dev/network';
import {
  ClientStates,
  ClientStatus,
  StatusInitializing,
  StatusNoAvailable,
  StatusReady,
  TerraConnectClient,
} from '@terra-dev/terra-connect';
import { Tx, TxDenied, TxFail, TxProgress, TxSucceed } from '@terra-dev/tx';
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
  status: StatusInitializing | StatusNoAvailable | StatusReady;
  clientStates: ClientStates | null;
  refetchClientStates: () => void;
  execute: (
    terraAddress: string,
    network: Network,
    tx: Tx,
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
      console.log('terra-connect.tsx..() status is', status);
      setStatus(status);
    });

    const statesSubscription = client
      .clientStates()
      .subscribe((clientStates) => {
        console.log('terra-connect.tsx..() clientStates are', clientStates);
        setClientStates(clientStates);
      });

    return () => {
      statusSubscription.unsubscribe();
      statesSubscription.unsubscribe();
    };
  }, [client]);

  const state = useMemo<TerraConnect>(
    () => ({
      status,
      clientStates,
      refetchClientStates,
      execute: client.execute,
    }),
    [client.execute, clientStates, refetchClientStates, status],
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
