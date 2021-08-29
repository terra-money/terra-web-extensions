import { WalletCard } from '@libs/wallet-card';
import { Button } from '@material-ui/core';
import {
  deserializeTx,
  SerializedCreateTxOptions,
  WebExtensionNetworkInfo,
  WebExtensionTxFail,
  WebExtensionTxStatus,
} from '@terra-dev/web-extension';
import {
  createLedgerKey,
  executeTxWithLedgerWallet,
  LedgerWallet,
  TxRequest,
} from '@terra-dev/web-extension-backend';
import { GlobalStyle } from 'common/components/GlobalStyle';
import { fixHMR } from 'fix-hmr';
import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { browser } from 'webextension-polyfill-ts';
import { TxDetail } from 'webextension/components/tx/TxDetail';
import { TxRequestDetail } from 'webextension/components/tx/TxRequestDetail';
import { txPortPrefix } from 'webextension/env';

export interface LedgerWalletTxFormProps {
  className?: string;
  txRequest: TxRequest;
  wallet: LedgerWallet;
  onDeny: (params: { id: string }) => void;
  onComplete: () => void;
}

function LedgerWalletTxFormBase({
  className,
  txRequest,
  wallet,
  onDeny,
  onComplete,
}: LedgerWalletTxFormProps) {
  const tx = useMemo(() => {
    return deserializeTx(txRequest.tx);
  }, [txRequest.tx]);

  // ---------------------------------------------
  // callbacks
  // ---------------------------------------------
  //const clickContext = useCallback(async (evt) => {
  //  console.log('LedgerWalletTxForm.tsx..() start!!!', evt);
  //
  //  const transport = await createTransport();
  //  const app = new TerraLedgerApp(transport);
  //
  //  console.log('LedgerWalletTxForm.tsx..()', transport, app);
  //
  //  await app.initialize();
  //
  //  console.log('LedgerWalletTxForm.tsx..() initialized...', );
  //
  //  const publicKey = await app.getAddressAndPubKey(
  //    TERRA_APP_PATH,
  //    TERRA_APP_HRP,
  //  );
  //
  //  console.log('LedgerWalletTxForm.tsx..()', publicKey);
  //}, []);

  const proceed = useCallback(
    async (param: {
      id: string;
      network: WebExtensionNetworkInfo;
      tx: SerializedCreateTxOptions;
      wallet: LedgerWallet;
    }) => {
      const port = browser.runtime.connect(undefined, {
        name: txPortPrefix + param.id,
      });

      console.log('LedgerWalletTxForm.tsx..() ????');

      const ledgerKey = await createLedgerKey();

      console.log('LedgerWalletTxForm.tsx..()', ledgerKey);

      executeTxWithLedgerWallet(
        param.wallet,
        param.network,
        param.tx,
        ledgerKey,
      ).subscribe({
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
          onComplete();
        },
      });
    },
    [onComplete],
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
          disabled={false}
          onClick={() =>
            proceed({
              ...txRequest,
              wallet,
            })
          }
          //onClick={clickContext}
        >
          Submit
        </Button>
      </footer>

      <GlobalStyle backgroundColor="#ffffff" />
    </section>
  );
}

export const StyledLedgerWalletTxForm = styled(LedgerWalletTxFormBase)`
  // TODO
`;

export const LedgerWalletTxForm = fixHMR(StyledLedgerWalletTxForm);
