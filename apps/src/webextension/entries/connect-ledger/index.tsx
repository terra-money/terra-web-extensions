import { createMuiTheme } from '@material-ui/core';
import {
  addWallet,
  connectLedger,
  findWallet,
  LedgerWallet,
  observeConnectedLedgerList,
  observeWalletsStorage,
  subtractUSBDevices,
} from '@terra-dev/web-extension-backend';
import { fixHMR } from 'fix-hmr';
import React, { useCallback, useEffect, useState } from 'react';
import { render } from 'react-dom';
import { IntlProvider } from 'react-intl';
import { HashRouter } from 'react-router-dom';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import styled, { DefaultTheme } from 'styled-components';
import { ErrorBoundary } from 'webextension/components/common/ErrorBoundary';
import { LocalesProvider, useIntlProps } from 'webextension/contexts/locales';
import { ThemeProvider } from '../../contexts/theme';

const theme: DefaultTheme = createMuiTheme({
  typography: {
    button: {
      textTransform: 'none',
    },
  },
});

export interface ConnectLedgerProps {
  className?: string;
}

function ConnectLedgerBase({ className }: ConnectLedgerProps) {
  const { locale, messages } = useIntlProps();

  const [usbDevices, setUsbDevices] = useState<USBDevice[]>(() => []);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const subscription = combineLatest([
      observeConnectedLedgerList(),
      observeWalletsStorage().pipe(
        map(({ wallets }) =>
          wallets.filter(
            (wallet): wallet is LedgerWallet => 'usbDevice' in wallet,
          ),
        ),
      ),
    ])
      .pipe(
        map(([devices, ledgerWallets]) => {
          return subtractUSBDevices(
            devices,
            ledgerWallets.map(({ usbDevice }) => usbDevice),
          );
        }),
      )
      .subscribe({
        next: (devices) => {
          setUsbDevices(devices);
        },
      });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const connect = useCallback(async () => {
    try {
      const ledgerWallet = await connectLedger();

      if (ledgerWallet) {
        const existsWallet = await findWallet(ledgerWallet.terraAddress);

        if (!existsWallet) {
          await addWallet(ledgerWallet);
        } else {
          setError(`Already added this wallet ${ledgerWallet.terraAddress}`);
        }
      }
    } catch (e) {
      setError(String(e));
    }
  }, []);

  return (
    <IntlProvider locale={locale} messages={messages}>
      <ThemeProvider theme={theme}>
        <div className={className}>
          <h3>Can add this devices</h3>
          <ul>
            {usbDevices.map(({ serialNumber, productName }, i) => (
              <li key={'device' + (serialNumber ?? i)}>
                {productName} ({serialNumber})
              </li>
            ))}
          </ul>

          <h3>Errors</h3>
          <pre>{error}</pre>

          <h3>Actions</h3>
          <button onClick={connect}>Connect Ledger</button>
        </div>
      </ThemeProvider>
    </IntlProvider>
  );
}

export const StyledConnectLedger = styled(ConnectLedgerBase)`
  // TODO
`;

const ConnectLedger = fixHMR(StyledConnectLedger);

render(
  <HashRouter>
    <ErrorBoundary>
      <LocalesProvider>
        <ConnectLedger />
      </LocalesProvider>
    </ErrorBoundary>
  </HashRouter>,
  document.querySelector('#app'),
);
