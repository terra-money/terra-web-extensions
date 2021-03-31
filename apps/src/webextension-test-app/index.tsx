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
import { CurrentNetwork } from './components/CurrentNetwork';
import { CurrentStatus } from './components/CurrentStatus';
import { CurrentWallet } from './components/CurrentWallet';
import { SampleMantleData } from './components/SampleMantleData';
import { WalletSelector } from './components/WalletSelector';
import { Constants, ConstantsProvider } from './contexts/constants';
import { ContractProvider } from './contexts/contract';
import { columbusContractAddresses, tequilaContractAddresses } from './env';

const client = new TerraConnectWebExtensionClient(window);

function AppProviders({ children }: { children: ReactNode }) {
  // ---------------------------------------------
  // terra connect
  // ---------------------------------------------
  const { clientStates } = useTerraConnect();

  // ---------------------------------------------
  // graphql settings
  // ---------------------------------------------
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

  // ---------------------------------------------
  // presentation
  // ---------------------------------------------
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
