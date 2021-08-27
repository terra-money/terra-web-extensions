import { WebExtensionController } from '@terra-dev/web-extension';
import {
  useWebExtension,
  WalletSelectProvider,
  WebExtensionProvider,
} from '@libs/web-extension-react';
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
import './markdown.css';
import TerraConnectAPI from './pages/apis/terra-connect/api.mdx';
import TerraConnectExample from './pages/apis/terra-connect/example.mdx';

const client = new WebExtensionController(window);

function AppProviders({ children }: { children: ReactNode }) {
  // ---------------------------------------------
  // terra connect
  // ---------------------------------------------
  const { states } = useWebExtension();

  // ---------------------------------------------
  // graphql settings
  // ---------------------------------------------
  const isMainnet = useMemo(() => {
    if (!states) return false;
    return /^columbus/.test(states.network.chainID);
  }, [states]);

  const addressMap = useMemo(() => {
    return isMainnet ? columbusContractAddresses : tequilaContractAddresses;
  }, [isMainnet]);

  const constants = useMemo<Constants>(
    () =>
      isMainnet
        ? {
            gasFee: 1000000,
            fixedGas: 500000,
            blocksPerYear: 4906443,
            gasAdjustment: 1.6,
          }
        : {
            gasFee: 6000000,
            fixedGas: 3500000,
            blocksPerYear: 4906443,
            gasAdjustment: 1.4,
          },
    [isMainnet],
  );

  // ---------------------------------------------
  // presentation
  // ---------------------------------------------
  return (
    <ConstantsProvider {...constants}>
      <ContractProvider address={addressMap}>{children}</ContractProvider>
    </ConstantsProvider>
  );
}

function App() {
  return (
    <WebExtensionProvider controller={client}>
      <WalletSelectProvider>
        <AppProviders>
          <AppLayout>
            <Switch>
              <Route exact path="/" component={Overview} />
              <Route path="/apis/terra-connect/api">
                <TerraConnectAPI />
              </Route>
              <Route path="/apis/terra-connect/example">
                <TerraConnectExample />
              </Route>
            </Switch>
          </AppLayout>
          <GlobalStyle backgroundColor="#ffffff" />
        </AppProviders>
      </WalletSelectProvider>
    </WebExtensionProvider>
  );
}

render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.querySelector('#root'),
);
