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
import { WalletCard, WalletCardProps } from '@terra-dev/wallet-card';
import { WalletCardSelector } from '@terra-dev/wallet-card/components/WalletCardSelector';
import React, { ReactNode, useMemo, useState } from 'react';
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
          <header>
            <h1>Wallet Select</h1>
            <WalletSelector />
          </header>
          <section>
            <CardSelectorSample variant="medium" cardWidth={300} />
            <CardSelectorSample variant="small" cardWidth={170} />

            <h1>Current Client Status</h1>
            <CurrentStatus />
            <h1>Current Network</h1>
            <CurrentNetwork />
            <h1>Current Wallet</h1>
            <CurrentWallet />
            <h1>Sample Application</h1>
            <SampleMantleData />
          </section>
        </AppProviders>
      </WalletSelectProvider>
    </TerraConnectProvider>
  );
}

function CardSelectorSample({
  variant,
  cardWidth,
}: {
  variant: WalletCardProps['variant'];
  cardWidth: number;
}) {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  return (
    <WalletCardSelector
      selectedIndex={selectedIndex}
      onSelect={setSelectedIndex}
      cardWidth={cardWidth}
      style={{ margin: '0 auto' }}
    >
      <WalletCard
        variant={variant}
        name="anchor-dev2"
        terraAddress="terra12hnhh5vtyg5juqnzm43970nh4fw42pt27nw9g9"
      />
      <WalletCard
        variant={variant}
        name="anchor-dev2"
        terraAddress="terra12hnhh5vtyg5juqnzm43970nh4fw42pt27nw9g9"
      />
      <WalletCard
        variant={variant}
        name="anchor-dev2"
        terraAddress="terra12hnhh5vtyg5juqnzm43970nh4fw42pt27nw9g9"
      />
      <WalletCard
        variant={variant}
        name="anchor-dev2"
        terraAddress="terra12hnhh5vtyg5juqnzm43970nh4fw42pt27nw9g9"
      />
      <WalletCard
        variant={variant}
        name="anchor-dev2"
        terraAddress="terra12hnhh5vtyg5juqnzm43970nh4fw42pt27nw9g9"
      />
    </WalletCardSelector>
  );
}

render(<App />, document.querySelector('#app'));

// Hot Module Replacement
if (module.hot) {
  module.hot.accept();
}
