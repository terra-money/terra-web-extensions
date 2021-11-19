import { useLocalStorageValue } from '@mantine/hooks';
import {
  useWalletSelect,
  useWebExtensionConnector,
} from '@station/web-extension-react';
import {
  WebExtensionPostPayload,
  WebExtensionTxResult,
  WebExtensionTxStatus,
} from '@terra-dev/web-extension-interface';
import { Coin, Fee, MsgSend } from '@terra-money/terra.js';
import React, { useCallback, useState } from 'react';

const TO_ADDRESS = 'terra12hnhh5vtyg5juqnzm43970nh4fw42pt27nw9g9';

export function PostExample() {
  const { states, post } = useWebExtensionConnector();

  const { selectedWallet } = useWalletSelect();

  const [feeStyle, setFeeStyle] = useLocalStorageValue<
    'none' | 'single' | 'multiple'
  >({
    key: '__test_app_fee_style__',
    defaultValue: 'single',
  });

  const [txResult, setTxResult] =
    useState<WebExtensionTxResult<WebExtensionPostPayload> | null>(null);

  const [txError, setTxError] = useState<string | null>(null);

  const [inProgress, setInProgress] = useState<boolean>(false);

  const send = useCallback(() => {
    if (!states || !selectedWallet) {
      return;
    }

    if (states.network.chainID.startsWith('columbus')) {
      alert(`Please only execute this example on Testnet`);
      return;
    }

    setTxResult(null);
    setTxError(null);
    setInProgress(true);

    post(selectedWallet.terraAddress, {
      fee:
        feeStyle === 'single'
          ? new Fee(1000000, '200000uusd')
          : feeStyle === 'multiple'
          ? new Fee(1000000, [
              new Coin('uusd', '100000'),
              new Coin('ukrw', '100000000'),
            ])
          : undefined,
      msgs: [
        new MsgSend(selectedWallet.terraAddress, TO_ADDRESS, {
          uusd: 1000000,
        }),
      ],
    }).subscribe({
      next: (result) => {
        setTxResult(result);
        setTxError(null);
      },
      error: (error) => {
        setTxResult(null);
        setTxError(error instanceof Error ? error.message : String(error));
        setInProgress(false);
      },
      complete: () => {
        setInProgress(false);
      },
    });
  }, [feeStyle, post, selectedWallet, states]);

  return (
    <div>
      {txResult && <pre>{JSON.stringify(txResult, null, 2)}</pre>}

      {txError && <pre>{txError}</pre>}

      {txResult && states && txResult.status === WebExtensionTxStatus.SUCCEED && (
        <a
          href={`https://finder.terra.money/${states.network.chainID}/tx/${txResult.payload.txhash}`}
          target="_blank"
          rel="noreferrer"
        >
          Open Tx Result in Terra Finder
        </a>
      )}

      {(!!txResult || !!txError) && (
        <div>
          <button
            onClick={() => {
              setTxResult(null);
              setTxError(null);
            }}
          >
            Clear result
          </button>
        </div>
      )}

      {!txResult && !txError && selectedWallet && !inProgress && (
        <div>
          <button onClick={send}>Send 1USD to {TO_ADDRESS}</button>
          <button
            onClick={() =>
              setFeeStyle((prev) =>
                prev === 'single'
                  ? 'multiple'
                  : prev === 'multiple'
                  ? 'none'
                  : 'single',
              )
            }
          >
            Include Fee = {feeStyle}
          </button>
        </div>
      )}
    </div>
  );
}
