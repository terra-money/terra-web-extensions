import {
  TerraConnectProvider,
  WalletSelectProvider,
} from '@terra-dev/terra-connect-react';
import { TerraConnectWebExtensionClient } from '@terra-dev/terra-connect-webextension';
import React from 'react';
import { render } from 'react-dom';
import { CurrentStatus } from 'webextension-test-app/components/CurrentStatus';
import { CurrentWallet } from 'webextension-test-app/components/CurrentWallet';
import { CurrentNetwork } from './components/CurrentNetwork';
import { WalletSelector } from './components/WalletSelector';

const client = new TerraConnectWebExtensionClient(window);

function App() {
  return (
    <TerraConnectProvider client={client}>
      <WalletSelectProvider>
        <header>
          <WalletSelector />
        </header>
        <section>
          <CurrentStatus />
          <CurrentNetwork />
          <CurrentWallet />
        </section>
      </WalletSelectProvider>
    </TerraConnectProvider>
  );
}

render(<App />, document.querySelector('#app'));

// Hot Module Replacement
if (module.hot) {
  module.hot.accept();
}
