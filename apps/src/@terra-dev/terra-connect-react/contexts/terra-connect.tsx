import {
  ClientStates,
  ClientStatus,
  TerraConnectClient,
} from '@terra-dev/terra-connect';
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

export interface TerraConnectProviderProps {
  children: ReactNode;
  client: TerraConnectClient;
}

export interface TerraConnect {
  status: ClientStatus;
  clientStates: ClientStates | null;
  refetchClientStates: () => void;
}

// @ts-ignore
const TerraConnectContext: Context<TerraConnect> = createContext<TerraConnect>();

export function TerraConnectProvider({
  children,
  client,
}: TerraConnectProviderProps) {
  const [status, setStatus] = useState<ClientStatus>(ClientStatus.INITIALIZING);
  const [clientStates, setClientStates] = useState<ClientStates | null>(null);

  const refetchClientStates = useCallback(() => {
    client.refetch();
  }, [client]);

  useEffect(() => {
    client.refetch();

    const statusSubscription = client.status().subscribe((status) => {
      console.log('terra-connect.tsx..() status is', status);
      setStatus(status);
    });

    const statesSubscription = client.states().subscribe((clientStates) => {
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
    }),
    [clientStates, refetchClientStates, status],
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
