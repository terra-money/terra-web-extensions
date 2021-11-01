import { Button } from '@station/ui';
import {
  approveHostnames,
  readWalletsStorage,
} from '@terra-dev/web-extension-backend';
import React, { useCallback, useMemo, useState } from 'react';
import { render } from 'react-dom';
import { MdDomainVerification } from 'react-icons/md';
import { IntlProvider } from 'react-intl';
import styled from 'styled-components';
import { browser } from 'webextension-polyfill-ts';
import { ApproveHostname } from 'webextension/components/views/ApproveHostname';
import { ViewCenterLayout } from 'webextension/components/views/components/ViewCenterLayout';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';
import { LocalesProvider, useIntlProps } from '../../contexts/locales';
import { txPortPrefix } from '../../env';

export interface AppProps {
  className?: string;
}

function Component({ className }: AppProps) {
  // ---------------------------------------------
  // read hash urls
  // ---------------------------------------------
  const connectInfo = useMemo(() => {
    const queries = window.location.search;

    const params = new URLSearchParams(queries);

    const id = params.get('id');
    const hostname = params.get('hostname');

    if (!id || !hostname) {
      throw new Error(`Can't find params!`);
    }

    return {
      id,
      hostname,
    };
  }, []);

  // ---------------------------------------------
  // states
  // ---------------------------------------------
  const [noWallets, setNoWallets] = useState<boolean>(false);

  // ---------------------------------------------
  // callbacks
  // ---------------------------------------------
  const approve = useCallback(async () => {
    await approveHostnames(connectInfo.hostname);

    const port = browser.runtime.connect(undefined, {
      name: txPortPrefix + connectInfo.id,
    });

    port.postMessage(true);

    port.disconnect();
  }, [connectInfo.hostname, connectInfo.id]);

  const deny = useCallback(() => {
    const port = browser.runtime.connect(undefined, {
      name: txPortPrefix + connectInfo.id,
    });

    port.postMessage(false);

    port.disconnect();
  }, [connectInfo.id]);

  const approveConnect = useCallback(async () => {
    const { wallets } = await readWalletsStorage();

    if (wallets.length > 0) {
      await approve();
    } else {
      setNoWallets(true);
    }
  }, [approve]);

  // ---------------------------------------------
  // presentation
  // ---------------------------------------------
  if (noWallets) {
    return (
      <div className={className}>
        <ViewCenterLayout
          className="content"
          icon={<MdDomainVerification />}
          title="You don't have any wallets"
          footer={
            <Button variant="primary" size="large" onClick={deny}>
              OK
            </Button>
          }
        >
          <p>Please make any wallets first!</p>
        </ViewCenterLayout>
      </div>
    );
  }

  return (
    <div className={className}>
      <ApproveHostname
        className="content"
        hostname={connectInfo.hostname}
        onCancel={deny}
        onConfirm={approveConnect}
      />
    </div>
  );
}

export const App = styled(Component)`
  min-height: 100vh;

  .content {
    min-height: 100vh;
  }
`;

function Main() {
  const { locale, messages } = useIntlProps();

  return (
    <IntlProvider locale={locale} messages={messages}>
      <App />
    </IntlProvider>
  );
}

render(
  <ErrorBoundary>
    <LocalesProvider>
      <Main />
    </LocalesProvider>
  </ErrorBoundary>,
  document.querySelector('#app'),
);
