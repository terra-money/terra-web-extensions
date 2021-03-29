import { ClientStates, TerraConnectClient } from '@terra-dev/terra-connect';
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
  clientStates: ClientStates | null;
  refetchClientStates: () => void;
}

// @ts-ignore
const TerraConnectContext: Context<TerraConnect> = createContext<TerraConnect>();

export function TerraConnectProvider({
  children,
  client,
}: TerraConnectProviderProps) {
  const [clientStates, setClientStates] = useState<ClientStates | null>(null);

  const refetchClientStates = useCallback(() => {
    client.refetch();
  }, [client]);

  useEffect(() => {
    client.refetch();

    const subscription = client.states().subscribe((clientStates) => {
      console.log('terra-connect.tsx..()', clientStates);
      setClientStates(clientStates);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [client]);

  const state = useMemo<TerraConnect>(
    () => ({
      clientStates,
      refetchClientStates,
    }),
    [clientStates, refetchClientStates],
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
