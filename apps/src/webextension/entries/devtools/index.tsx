import {
  CW20StorageData,
  HostnamesStorageData,
  NetworkStorageData,
  observeCW20Storage,
  observeHostnamesStorage,
  observeNetworkStorage,
  observeSecurityStorage,
  observeWalletsStorage,
  SecurityStorageData,
  WalletsStorageData,
} from '@terra-dev/web-extension-backend';
import React, { useEffect, useState } from 'react';
import { render } from 'react-dom';
import styled from 'styled-components';

function Component({ className }: { className?: string }) {
  const [walletStorage, setWalletStorage] = useState<WalletsStorageData | null>(
    null,
  );
  const [networkStorage, setNetworkStorage] =
    useState<NetworkStorageData | null>(null);
  const [hostnamesStorage, setHostnamesStorage] =
    useState<HostnamesStorageData | null>(null);
  const [cw20Storage, setCW20Storage] = useState<CW20StorageData | null>(null);
  const [securityStorage, setSecurityStorage] =
    useState<SecurityStorageData | null>(null);

  useEffect(() => {
    observeWalletsStorage().subscribe(setWalletStorage);
    observeNetworkStorage().subscribe(setNetworkStorage);
    observeHostnamesStorage().subscribe(setHostnamesStorage);
    observeCW20Storage().subscribe(setCW20Storage);
    observeSecurityStorage().subscribe(setSecurityStorage);
  }, []);

  return (
    <main className={className}>
      <section>
        <h1>Networks</h1>
        <pre>{JSON.stringify(networkStorage, null, 2)}</pre>
      </section>

      <section>
        <h1>Hostnames</h1>
        <pre>{JSON.stringify(hostnamesStorage, null, 2)}</pre>
      </section>

      <section>
        <h1>CW20</h1>
        <pre>{JSON.stringify(cw20Storage, null, 2)}</pre>
      </section>

      <section>
        <h1>Security</h1>
        <pre>{JSON.stringify(securityStorage, null, 2)}</pre>
      </section>

      <section>
        <h1>Wallets</h1>
        <pre>{JSON.stringify(walletStorage, null, 2)}</pre>
      </section>
    </main>
  );
}

const Main = styled(Component)`
  padding: 20px;

  display: grid;
  grid-template-columns: repeat(2, 1fr);
  row-gap: 20px;
  column-gap: 20px;

  section {
    h1 {
      margin-bottom: 10px;
    }

    pre {
      word-break: break-word;
      white-space: break-spaces;

      line-height: 1.5;

      padding: 20px;

      background-color: #eeeeee;
      border-radius: 10px;
    }
  }
`;

render(<Main />, document.querySelector('#app'));
