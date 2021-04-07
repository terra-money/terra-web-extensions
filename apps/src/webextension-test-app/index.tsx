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
import { GlobalStyle } from 'common/components/GlobalStyle';
import { Constants, ConstantsProvider } from 'common/contexts/constants';
import { ContractProvider } from 'common/contexts/contract';
import {
  columbusContractAddresses,
  tequilaContractAddresses,
} from 'common/env';
import React, { ReactNode, useMemo } from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { AppLayout } from 'webextension-test-app/components/AppLayout';
import { Overview } from 'webextension-test-app/pages/overview';
import TerraConnectAPI from './pages/apis/terra-connect/api.mdx';
import TerraConnectExample from './pages/apis/terra-connect/example.mdx';
import './markdown.css';

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

  const apolloClient = useMemo<ApolloClient<any>>(() => {
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
        <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
      </ContractProvider>
    </ConstantsProvider>
  );
}

function App() {
  return (
    <TerraConnectProvider client={client}>
      <WalletSelectProvider>
        <AppProviders>
          <AppLayout>
            <Switch>
              <Route exact path="/" component={Overview} />
              <Route
                path="/apis/terra-connect/api"
                component={TerraConnectAPI}
              />
              <Route
                path="/apis/terra-connect/example"
                component={TerraConnectExample}
              />
            </Switch>
          </AppLayout>
          <GlobalStyle backgroundColor="#ffffff" />
        </AppProviders>
      </WalletSelectProvider>
    </TerraConnectProvider>
  );
}

render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.querySelector('#app'),
);

// Hot Module Replacement
if (module.hot) {
  module.hot.accept();
}
