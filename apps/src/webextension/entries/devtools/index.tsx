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
import JsonView, { ReactJsonViewProps } from 'react-json-view';
import styled from 'styled-components';

const jsonViewOptions: Omit<ReactJsonViewProps, 'src'> = {
  iconStyle: 'triangle',
  theme: 'monokai',
  displayDataTypes: false,
  enableClipboard: false,
  collapseStringsAfterLength: 50,
  collapsed: 3,
};

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
        <h1>Wallets</h1>
        {walletStorage && <JsonView src={walletStorage} {...jsonViewOptions} />}
      </section>

      <section>
        <h1>Networks</h1>
        {networkStorage && (
          <JsonView src={networkStorage} {...jsonViewOptions} />
        )}
      </section>

      <section>
        <h1>Hostnames</h1>
        {hostnamesStorage && (
          <JsonView src={hostnamesStorage} {...jsonViewOptions} />
        )}
      </section>

      <section>
        <h1>CW20</h1>
        {cw20Storage && <JsonView src={cw20Storage} {...jsonViewOptions} />}
      </section>

      <section>
        <h1>Security</h1>
        {securityStorage && (
          <JsonView src={securityStorage} {...jsonViewOptions} />
        )}
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

    .react-json-view {
      font-size: 14px;

      padding: 20px;
      border-radius: 10px;

      max-height: 400px;
      overflow-y: auto;

      .string-value {
        word-break: break-word;
        white-space: break-spaces;
      }
    }

    &:first-child {
      grid-column: 1/3;
    }
  }
`;

render(<Main />, document.querySelector('#app'));
