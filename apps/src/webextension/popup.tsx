import {
  AddressProvider,
  AddressProviderFromJson,
} from '@anchor-protocol/anchor.js';
import { Rate, uUST } from '@anchor-protocol/types';
import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';
import { createMuiTheme } from '@material-ui/core';
import { Network } from '@terra-dev/network';
import { yScroller } from '@terra-dev/station-ui/styles/yScroller';
import { observeNetworkStorage } from '@terra-dev/webextension-network-storage';
import { GlobalStyle } from 'common/components/GlobalStyle';
import { Constants, ConstantsProvider } from 'common/contexts/constants';
import { ContractProvider } from 'common/contexts/contract';
import {
  columbusContractAddresses,
  tequilaContractAddresses,
} from 'common/env';
import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { render } from 'react-dom';
import { IntlProvider } from 'react-intl';
import {
  HashRouter,
  Redirect,
  Route,
  Switch,
  useLocation,
} from 'react-router-dom';
import styled, { DefaultTheme, keyframes } from 'styled-components';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PopupHeader } from './components/PopupHeader';
import { LocalesProvider, useIntlProps } from './contexts/locales';
import { ThemeProvider } from './contexts/theme';
import { contentHeight, defaultNetworks, headerHeight, width } from './env';
import { Dashboard } from './pages/dashboard';
import { NetworkCreate } from './pages/networks/create';
import { WalletChangePassword } from './pages/wallets/change-password';
import { WalletCreate } from './pages/wallets/create';
import { WalletRecover } from './pages/wallets/recover';

const theme: DefaultTheme = createMuiTheme({
  typography: {
    button: {
      textTransform: 'none',
    },
  },
});

function NetworkProviders({ children }: { children: ReactNode }) {
  // ---------------------------------------------
  // graphql settings
  // ---------------------------------------------
  const [selectedNetwork, setSelectedNetwork] = useState<Network>(
    () => defaultNetworks[0],
  );

  const isMainnet = useMemo(() => {
    return /^columbus/.test(selectedNetwork.chainID);
  }, [selectedNetwork.chainID]);

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
          selectedNetwork.servers.mantle ??
          'https://tequila-mantle.anchorprotocol.com'
        }?${operationName}`,
    });

    return new ApolloClient({
      cache: new InMemoryCache(),
      link: httpLink,
    });
  }, [selectedNetwork.servers.mantle]);

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

  useEffect(() => {
    const subscription = observeNetworkStorage().subscribe(
      ({ selectedNetwork: nextSelectedNetwork }) => {
        setSelectedNetwork(nextSelectedNetwork ?? defaultNetworks[0]);
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

function MainBase({ className }: { className?: string }) {
  const { locale, messages } = useIntlProps();

  const location = useLocation();

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [location.pathname]);

  useEffect(() => {
    setTimeout(() => {
      if (!containerRef.current) return;
      containerRef.current.style.minHeight = contentHeight + 'px';
      containerRef.current.style.maxHeight = contentHeight + 'px';
    }, 2000);
  }, []);

  return (
    <NetworkProviders>
      <IntlProvider locale={locale} messages={messages}>
        <ThemeProvider theme={theme}>
          <div className={className}>
            <PopupHeader />
            <section ref={containerRef}>
              <Switch>
                <Route exact path="/" component={Dashboard} />
                <Route path="/wallet/create" component={WalletCreate} />
                <Route path="/wallet/recover" component={WalletRecover} />
                <Route
                  path="/wallets/:terraAddress/password"
                  component={WalletChangePassword}
                />
                <Route path="/network/create" component={NetworkCreate} />
                <Redirect to="/" />
              </Switch>
            </section>
            <GlobalStyle />
          </div>
        </ThemeProvider>
      </IntlProvider>
    </NetworkProviders>
  );
}

const sectionEnter = keyframes`
  0% {
    transform: translateY(-${headerHeight}px);
  }
  
  30% {
    transform: translateY(-${headerHeight}px);
  }
  
  100% {
    transform: translateY(0);
  }
`;

const Main = styled(MainBase)`
  min-width: ${width}px;
  min-height: ${headerHeight + contentHeight}px;
  max-height: ${headerHeight + contentHeight}px;

  display: flex;
  flex-direction: column;

  > section {
    min-height: ${headerHeight + contentHeight}px;
    max-height: ${headerHeight + contentHeight}px;
    padding: 20px;

    ${yScroller};

    background-color: #ffffff;

    border-top-left-radius: 24px;
    border-top-right-radius: 24px;

    box-shadow: 0px 4px 18px 3px rgba(0, 0, 0, 0.33);

    animation: ${sectionEnter} 0.6s ease-in;
  }
`;

render(
  <HashRouter>
    <ErrorBoundary>
      <LocalesProvider>
        <Main />
      </LocalesProvider>
    </ErrorBoundary>
  </HashRouter>,
  document.querySelector('#app'),
);
