import { WalletCard } from '@libs/wallet-card';
import { Button, TextField } from '@material-ui/core';
import {
  deserializeTx,
  SerializedCreateTxOptions,
  WebExtensionNetworkInfo,
  WebExtensionTxFail,
  WebExtensionTxStatus,
} from '@terra-dev/web-extension';
import {
  decryptWallet,
  EncryptedWallet,
  executeTxWithInternalWallet,
  TxRequest,
  Wallet,
} from '@terra-dev/web-extension-backend';
import { GlobalStyle } from 'common/components/GlobalStyle';
import { fixHMR } from 'fix-hmr';
import React, { ChangeEvent, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { browser } from 'webextension-polyfill-ts';
import { txPortPrefix } from '../../env';
import { TxDetail } from './TxDetail';
import { TxRequestDetail } from './TxRequestDetail';

export interface InternalWalletTxFormProps {
  className?: string;
  txRequest: TxRequest;
  wallet: EncryptedWallet;
  onDeny: (params: { id: string }) => void;
}

function InternalWalletTxFormBase({
  className,
  txRequest,
  wallet,
  onDeny,
}: InternalWalletTxFormProps) {
  const tx = useMemo(() => {
    return deserializeTx(txRequest.tx);
  }, [txRequest.tx]);

  // ---------------------------------------------
  // states
  // ---------------------------------------------
  const [password, setPassword] = useState<string>('');

  const [invalidPassword, setInvalidPassword] = useState<string | null>(null);

  // ---------------------------------------------
  // callbacks
  // ---------------------------------------------
  const proceed = useCallback(
    async (param: {
      id: string;
      network: WebExtensionNetworkInfo;
      tx: SerializedCreateTxOptions;
      password: string;
      wallet: EncryptedWallet;
    }) => {
      try {
        const w: Wallet = decryptWallet(
          param.wallet.encryptedWallet,
          param.password,
        );

        const port = browser.runtime.connect(undefined, {
          name: txPortPrefix + param.id,
        });

        executeTxWithInternalWallet(w, param.network, param.tx).subscribe({
          next: (result) => {
            if (
              result.status === WebExtensionTxStatus.FAIL &&
              'toJSON' in result.error
            ) {
              port.postMessage({
                ...result,
                error: result.error.toJSON(),
              });
            } else {
              port.postMessage(result);
            }
          },
          error: (error) => {
            port.postMessage({
              status: WebExtensionTxStatus.FAIL,
              error,
            } as WebExtensionTxFail);
          },
          complete: () => {
            port.disconnect();
          },
        });
      } catch (e) {
        if (e instanceof Error) {
          setInvalidPassword(e.message);
        } else {
          setInvalidPassword('Proceed failed!');
        }
      }
    },
    [],
  );

  return (
    <section className={className}>
      <header>
        <WalletCard
          className="wallet-card"
          name={wallet.name}
          terraAddress={wallet.terraAddress}
          design={wallet.design}
        />
      </header>

      <TxRequestDetail className="wallets-actions" txRequest={txRequest} />

      <TxDetail className="tx" tx={tx} />

      <section className="form">
        <TextField
          variant="outlined"
          type="password"
          size="small"
          fullWidth
          label="WALLET PASSWORD"
          InputLabelProps={{ shrink: true }}
          value={password}
          onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
            setPassword(target.value)
          }
          error={!!invalidPassword}
          helperText={invalidPassword}
        />
      </section>

      <footer>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => onDeny({ ...txRequest })}
        >
          Deny
        </Button>

        <Button
          variant="contained"
          color="primary"
          disabled={password.length === 0}
          onClick={() =>
            proceed({
              ...txRequest,
              password,
              wallet,
            })
          }
        >
          Submit
        </Button>
      </footer>

      <GlobalStyle backgroundColor="#ffffff" />
    </section>
  );
}

export const StyledInternalWalletTxForm = styled(InternalWalletTxFormBase)`
  header {
    display: flex;
    justify-content: center;

    .wallet-card {
      width: 276px;
    }

    margin-bottom: 30px;
  }

  .tx {
    margin: 30px 0;
  }

  .form {
    margin: 30px 0;
  }

  footer {
    display: flex;

    > * {
      flex: 1;

      &:not(:first-child) {
        margin-left: 10px;
      }
    }
  }
`;

export const InternalWalletTxForm = fixHMR(StyledInternalWalletTxForm);
