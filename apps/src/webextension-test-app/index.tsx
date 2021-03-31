import type { AddressProvider } from '@anchor-protocol/anchor.js';
import { AddressProviderFromJson } from '@anchor-protocol/anchor.js';
import type { Rate, uUST } from '@anchor-protocol/types';
import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';
import {
  TerraConnectProvider,
  useTerraConnect,
  WalletSelectProvider,
} from '@terra-dev/terra-connect-react';
import { TerraConnectWebExtensionClient } from '@terra-dev/terra-connect-webextension';
import React, { ReactNode, useMemo } from 'react';
import { render } from 'react-dom';
import { CurrentStatus } from 'webextension-test-app/components/CurrentStatus';
import { CurrentWallet } from 'webextension-test-app/components/CurrentWallet';
import { SampleMantleData } from 'webextension-test-app/components/SampleMantleData';
import {
  Constants,
  ConstantsProvider,
} from 'webextension-test-app/contexts/constants';
import { ContractProvider } from 'webextension-test-app/contexts/contract';
import { CurrentNetwork } from './components/CurrentNetwork';
import { WalletSelector } from './components/WalletSelector';
import { columbusContractAddresses, tequilaContractAddresses } from './env';

const client = new TerraConnectWebExtensionClient(window);

function AppProviders({ children }: { children: ReactNode }) {
  const { clientStates } = useTerraConnect();

  const isMainnet = useMemo(() => {
    if (!clientStates) return false;
    return /^columbus/.test(clientStates.network.chainID);
  }, [clientStates]);

  const addressMap = useMemo(() => {
    return isMainnet ? columbusContractAddresses : tequilaContractAddresses;
  }, [isMainnet]);

  const addressProvider = useMemo<AddressProvider>(() => {
    return new AddressProviderFromJson(addressMap);
  }, [addressMap]);

  const client = useMemo<ApolloClient<any>>(() => {
    const httpLink = new HttpLink({
      uri: ({ operationName }) =>
        `${
          clientStates?.network.servers.mantle ??
          'https://tequila-mantle.anchorprotocol.com'
        }?${operationName}`,
    });

    return new ApolloClient({
      cache: new InMemoryCache(),
      link: httpLink,
    });
  }, [clientStates]);

  const constants = useMemo<Constants>(
    () =>
      isMainnet
        ? {
            gasFee: 1000000 as uUST<number>,
            fixedGas: 500000 as uUST<number>,
            blocksPerYear: 4906443,
            gasAdjustment: 1.6 as Rate<number>,
          }
        : {
            gasFee: 6000000 as uUST<number>,
            fixedGas: 3500000 as uUST<number>,
            blocksPerYear: 4906443,
            gasAdjustment: 1.4 as Rate<number>,
          },
    [isMainnet],
  );

  if (!client) {
    return null;
  }

  return (
    <ConstantsProvider {...constants}>
      <ContractProvider
        addressProvider={addressProvider}
        addressMap={addressMap}
      >
        <ApolloProvider client={client}>{children}</ApolloProvider>
      </ContractProvider>
    </ConstantsProvider>
  );
}

function App() {
  return (
    <TerraConnectProvider client={client}>
      <WalletSelectProvider>
        <AppProviders>
          <header>
            <WalletSelector />
          </header>
          <section>
            <CurrentStatus />
            <CurrentNetwork />
            <CurrentWallet />
            <hr />
            <SampleMantleData />
          </section>
        </AppProviders>
      </WalletSelectProvider>
    </TerraConnectProvider>
  );
}

render(<App />, document.querySelector('#app'));

// Hot Module Replacement
if (module.hot) {
  module.hot.accept();
}
