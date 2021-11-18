import { useLocalStorageValue } from '@mantine/hooks';
import {
  useWalletSelect,
  useWalletConnector,
} from '@station/web-connector-react';
import {
  WalletSignPayload,
  WalletTxResult,
  WalletTxStatus,
} from '@terra-dev/wallet-interface';
import {
  Coin,
  Fee,
  LCDClient,
  MsgSend,
  SyncTxBroadcastResult,
  Tx,
} from '@terra-money/terra.js';
import React, { useCallback, useState } from 'react';

const TO_ADDRESS = 'terra12hnhh5vtyg5juqnzm43970nh4fw42pt27nw9g9';

export function SignExample() {
  const { states, sign } = useWalletConnector();

  const { selectedWallet } = useWalletSelect();

  const [feeStyle, setFeeStyle] = useLocalStorageValue<
    'none' | 'single' | 'multiple'
  >({
    key: '__test_app_fee_style__',
    defaultValue: 'single',
  });

  const [txResult, setTxResult] =
    useState<WalletTxResult<WalletSignPayload> | null>(null);

  const [txError, setTxError] = useState<string | null>(null);

  const [broadcastResult, setBroadcastResult] =
    useState<SyncTxBroadcastResult | null>(null);

  const [broadcastError, setBroadcastError] = useState<string | null>(null);

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

    sign(selectedWallet.terraAddress, {
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
        setBroadcastResult(null);
        setBroadcastError(null);

        if (result.status === WalletTxStatus.SUCCEED) {
          const lcd = new LCDClient({
            chainID: states.network.chainID,
            URL: states.network.lcd,
          });

          lcd.tx
            .broadcastSync(Tx.fromData(result.payload))
            .then((nextBroadcastResult) => {
              setBroadcastResult(nextBroadcastResult);
              setBroadcastError(null);
            })
            .catch((error) => {
              setBroadcastResult(null);
              setBroadcastError(
                error instanceof Error ? error.message : String(error),
              );
            });
        }
      },
      error: (error) => {
        setTxResult(null);
        setTxError(error instanceof Error ? error.message : String(error));
        setBroadcastResult(null);
        setBroadcastError(null);
        setInProgress(false);
      },
      complete: () => {
        setInProgress(false);
      },
    });
  }, [feeStyle, selectedWallet, sign, states]);

  return (
    <div>
      {txResult && <pre>{JSON.stringify(txResult, null, 2)}</pre>}

      {txError && <pre>{txError}</pre>}

      {broadcastResult && <pre>{JSON.stringify(broadcastResult, null, 2)}</pre>}

      {broadcastError && <pre>{broadcastError}</pre>}

      {broadcastResult && states && (
        <a
          href={`https://finder.terra.money/${states.network.chainID}/tx/${broadcastResult.txhash}`}
          target="_blank"
          rel="noreferrer"
        >
          Open Tx Result in Terra Finder
        </a>
      )}

      {(!!txResult || !!txError || !!broadcastResult || !!broadcastError) && (
        <div>
          <button
            onClick={() => {
              setTxResult(null);
              setTxError(null);
              setBroadcastResult(null);
              setBroadcastError(null);
            }}
          >
            Clear result
          </button>
        </div>
      )}

      {!txResult &&
        !txError &&
        !broadcastResult &&
        !broadcastError &&
        selectedWallet &&
        !inProgress && (
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
