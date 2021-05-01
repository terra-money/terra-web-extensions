// approved 되지 않았음 -> site 주소 보여주고 승인 / 거절? -> 승인 -> DB 바꾸고
// <지갑이 한개도 없으면?> -> 새 지갑 만들기 / 복구하기 화면 보여주기

import { createMuiTheme } from '@material-ui/core';
import {
  createWallet,
  EncryptedWallet,
  encryptWallet,
  restoreMnemonicKey,
} from '@terra-dev/wallet';
import {
  addWallet,
  approveHostnames,
  readWalletStorage,
} from '@terra-dev/webextension-wallet-storage';
import React, { useCallback, useMemo, useState } from 'react';
import { render } from 'react-dom';
import { IntlProvider } from 'react-intl';
import styled, { DefaultTheme } from 'styled-components';
import { browser } from 'webextension-polyfill-ts';
import { ErrorBoundary } from 'webextension/components/ErrorBoundary';
import { LocalesProvider, useIntlProps } from 'webextension/contexts/locales';
import { ThemeProvider } from 'webextension/contexts/theme';
import { txPortPrefix } from './env';

export interface AppProps {
  className?: string;
}

function AppBase({ className }: AppProps) {
  const connectInfo = useMemo(() => {
    const queries = window.location.search;

    const params = new URLSearchParams(queries);

    const id = params.get('id');
    const hostname = params.get('hostname');

    if (!id || !hostname) {
      throw new Error(`Can't find Connect!`);
    }

    return {
      id,
      hostname,
    };
  }, []);

  const [needWalletCreate, setNeedWalletCreate] = useState<boolean>(false);

  const approve = useCallback(async () => {
    const { wallets } = await readWalletStorage();

    // TODO form
    if (wallets.length === 0) {
      const mk = restoreMnemonicKey(
        'length depend curious theory boat uncover host laugh kind pole gorilla subway knock dolphin decrease novel bottom enrich spawn clump sphere immense ranch tongue',
      );
      const wallet = createWallet(mk);
      const encryptedWallet: EncryptedWallet = {
        name: 'test-wallet',
        terraAddress: wallet.terraAddress,
        design: 'terra',
        encryptedWallet: encryptWallet(wallet, '1234567890'),
      };

      await addWallet(encryptedWallet);
    }

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
    const { wallets } = await readWalletStorage();

    if (wallets.length > 0) {
      await approve();
    } else {
      setNeedWalletCreate(true);
    }
  }, [approve]);

  if (needWalletCreate) {
    return (
      <div>
        <p>TODO : Wallet Create Form</p>
        <button onClick={approve}>Approve</button>
        <button onClick={deny}>Deny</button>
      </div>
    );
  }

  return (
    <section className={className}>
      <p>{connectInfo.hostname}</p>
      <button onClick={approveConnect}>Approve</button>
      <button onClick={deny}>Deny</button>
    </section>
  );
}

export const App = styled(AppBase)``;

const theme: DefaultTheme = createMuiTheme();

function Main() {
  const { locale, messages } = useIntlProps();

  return (
    <IntlProvider locale={locale} messages={messages}>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
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
