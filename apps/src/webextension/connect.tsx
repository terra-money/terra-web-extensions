import { Button, createMuiTheme } from '@material-ui/core';
import { FormSection } from '@terra-dev/station-ui/components/FormSection';
import {
  createWallet,
  EncryptedWallet,
  encryptWallet,
  restoreMnemonicKey,
  Wallet,
} from '@terra-dev/wallet';
import {
  addWallet,
  approveHostnames,
  readWalletStorage,
} from '@terra-dev/web-extension/backend';
import React, { useCallback, useMemo, useState } from 'react';
import { render } from 'react-dom';
import { IntlProvider } from 'react-intl';
import styled, { DefaultTheme } from 'styled-components';
import { browser } from 'webextension-polyfill-ts';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import {
  CreateNewWalletForm,
  CreateNewWalletResult,
} from './components/form/CreateNewWalletForm';
import {
  RecoverMnemonicForm,
  RecoverMnemonicResult,
} from './components/form/RecoverMnemonicForm';
import { LocalesProvider, useIntlProps } from './contexts/locales';
import { ThemeProvider } from './contexts/theme';
import { txPortPrefix } from './env';

export interface AppProps {
  className?: string;
}

function AppBase({ className }: AppProps) {
  // ---------------------------------------------
  // read hash urls
  // ---------------------------------------------
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

  // ---------------------------------------------
  // states
  // ---------------------------------------------
  const [walletCreatePages, setWalletCreatePages] = useState<number>(-1);

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
    const { wallets } = await readWalletStorage();

    if (wallets.length > 0) {
      await approve();
    } else {
      setWalletCreatePages(0);
    }
  }, [approve]);

  // ---------------------------------------------
  // presentation
  // ---------------------------------------------
  if (walletCreatePages === 0) {
    return (
      <FormSection>
        <header>
          <h1>You don't have any wallets</h1>
        </header>

        <p>Do you want to create new wallet?</p>

        <Button variant="contained" color="secondary" onClick={approve}>
          Cancel
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={() => setWalletCreatePages(1)}
        >
          Create New Wallet
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={() => setWalletCreatePages(2)}
        >
          Recover Existing Wallet
        </Button>
      </FormSection>
    );
  } else if (walletCreatePages === 1) {
    return <CreateNewWallet onApprove={approve} />;
  } else if (walletCreatePages === 2) {
    return <RecoverMnemonic onApprove={approve} />;
  }

  return (
    <FormSection className={className}>
      <header>
        <h1>Approve this site?</h1>
      </header>

      <p>{connectInfo.hostname}</p>

      <footer>
        <Button variant="contained" color="secondary" onClick={deny}>
          Deny
        </Button>
        <Button variant="contained" color="primary" onClick={approveConnect}>
          Approve
        </Button>
      </footer>
    </FormSection>
  );
}

interface ApproveWithWalletProps {
  onApprove: () => void;
}

function CreateNewWallet({ onApprove }: ApproveWithWalletProps) {
  const [result, setResult] = useState<CreateNewWalletResult | null>(null);

  const approve = useCallback(async () => {
    if (!result) {
      throw new Error(`Don't call when result is empty!`);
    }

    const encryptedWallet: EncryptedWallet = {
      name: result.name,
      design: result.design,
      terraAddress: result.mk.accAddress,
      encryptedWallet: encryptWallet(createWallet(result.mk), result.password),
    };

    await addWallet(encryptedWallet);

    onApprove();
  }, [result, onApprove]);

  return (
    <FormSection>
      <header>
        <h1>Approve + Add New Wallet</h1>
      </header>

      <CreateNewWalletForm onChange={setResult} />

      <footer>
        <Button variant="contained" color="secondary" onClick={onApprove}>
          Cancel
        </Button>

        <Button
          variant="contained"
          color="primary"
          disabled={!result}
          onClick={approve}
        >
          Create Wallet
        </Button>
      </footer>
    </FormSection>
  );
}

function RecoverMnemonic({ onApprove }: ApproveWithWalletProps) {
  const [result, setResult] = useState<RecoverMnemonicResult | null>(null);

  const recover = useCallback(async () => {
    if (!result) {
      throw new Error(`Don't call when result is empty!`);
    }

    const mk = restoreMnemonicKey(result.mnemonic);

    const wallet: Wallet = createWallet(mk);

    const encryptedWallet: EncryptedWallet = {
      name: result.name,
      design: result.design,
      terraAddress: mk.accAddress,
      encryptedWallet: encryptWallet(wallet, result.password),
    };

    await addWallet(encryptedWallet);

    onApprove();
  }, [onApprove, result]);

  return (
    <FormSection>
      <header>
        <h1>Approve + Recover Existing Wallet</h1>

        <RecoverMnemonicForm onChange={setResult} />

        <footer>
          <Button variant="contained" color="secondary" onClick={onApprove}>
            Cancel
          </Button>

          <Button
            variant="contained"
            color="primary"
            disabled={!result}
            onClick={recover}
          >
            Recover Wallet
          </Button>
        </footer>
      </header>
    </FormSection>
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
