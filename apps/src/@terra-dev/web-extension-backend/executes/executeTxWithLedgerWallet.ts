import {
  isWebConnectorError,
  WebConnectorCreateTxFailed,
  WebConnectorLedgerError,
  WebConnectorNetworkInfo,
  WebConnectorTxDenied,
  WebConnectorTxFail,
  WebConnectorTxFailed,
  WebConnectorTxProgress,
  WebConnectorTxStatus,
  WebConnectorTxSucceed,
  WebConnectorTxUnspecifiedError,
} from '@terra-dev/web-connector-interface';
import { LedgerKey } from '@terra-dev/web-extension-backend/interfaces';
import { LedgerWallet } from '@terra-dev/web-extension-backend/models';
import {
  CreateTxOptions,
  isTxError,
  LCDClient,
  SignatureV2,
} from '@terra-money/terra.js';
import { Observable } from 'rxjs';

export function executeTxWithLedgerWallet(
  wallet: LedgerWallet,
  network: WebConnectorNetworkInfo,
  tx: CreateTxOptions,
  key: LedgerKey,
): Observable<
  | WebConnectorTxProgress
  | WebConnectorTxDenied
  | WebConnectorTxSucceed
  | WebConnectorTxFail
> {
  const lcd = new LCDClient({
    chainID: network.chainID,
    URL: network.lcd,
    gasPrices: tx.gasPrices,
    gasAdjustment: tx.gasAdjustment,
  });

  return new Observable<
    | WebConnectorTxProgress
    | WebConnectorTxDenied
    | WebConnectorTxSucceed
    | WebConnectorTxFail
  >((subscriber) => {
    lcd
      .wallet(key)
      .createAndSignTx({
        ...tx,
        signMode: SignatureV2.SignMode.SIGN_MODE_LEGACY_AMINO_JSON,
      })
      .then((signed) => lcd.tx.broadcastSync(signed))
      .then((data) => {
        if (isTxError(data)) {
          subscriber.next({
            status: WebConnectorTxStatus.FAIL,
            error: !!data.txhash
              ? new WebConnectorTxFailed(
                  data.txhash,
                  data.raw_log,
                  data.raw_log,
                )
              : new WebConnectorCreateTxFailed(data.raw_log),
          });
          subscriber.complete();
        } else {
          subscriber.next({
            status: WebConnectorTxStatus.SUCCEED,
            payload: {
              txhash: data.txhash,
              height: data.height,
              raw_log: data.raw_log,
            },
          });
          subscriber.complete();
        }
      })
      .catch((error) => {
        console.log(
          'executeTxWithLedgerWallet.ts..()',
          error instanceof WebConnectorLedgerError,
          isWebConnectorError(error),
          error.toString(),
        );
        if (isWebConnectorError(error)) {
          if (
            error instanceof WebConnectorLedgerError &&
            error.code === 27014
          ) {
            subscriber.next({
              status: WebConnectorTxStatus.DENIED,
            });
          } else {
            subscriber.next({
              status: WebConnectorTxStatus.FAIL,
              error,
            });
          }
        } else {
          subscriber.next({
            status: WebConnectorTxStatus.FAIL,
            error: new WebConnectorTxUnspecifiedError(
              'message' in error ? error.message : String(error),
            ),
          });
        }
        subscriber.complete();
      });
  });
}
