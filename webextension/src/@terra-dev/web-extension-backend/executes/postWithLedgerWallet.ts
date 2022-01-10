import {
  isWebExtensionError,
  WebExtensionCreateTxFailed,
  WebExtensionLedgerError,
  WebExtensionNetworkInfo,
  WebExtensionPostPayload,
  WebExtensionTxDenied,
  WebExtensionTxFail,
  WebExtensionTxFailed,
  WebExtensionTxProgress,
  WebExtensionTxStatus,
  WebExtensionTxSucceed,
  WebExtensionTxUnspecifiedError,
} from '@terra-dev/web-extension-interface';
import { LedgerKey, LedgerWallet } from '@terra-dev/web-extension-backend';
import {
  CreateTxOptions,
  isTxError,
  LCDClient,
  SignatureV2,
} from '@terra-money/terra.js';
import { Observable } from 'rxjs';

export function postWithLedgerWallet(
  wallet: LedgerWallet,
  network: WebExtensionNetworkInfo,
  tx: CreateTxOptions,
  key: LedgerKey,
) {
  return new Observable<
    | WebExtensionTxProgress
    | WebExtensionTxDenied
    | WebExtensionTxSucceed<WebExtensionPostPayload>
    | WebExtensionTxFail
  >((subscriber) => {
    const lcd = new LCDClient({
      chainID: network.chainID,
      URL: network.lcd,
      gasPrices: tx.gasPrices,
      gasAdjustment: tx.gasAdjustment,
    });

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
            status: WebExtensionTxStatus.FAIL,
            error: !!data.txhash
              ? new WebExtensionTxFailed(
                  data.txhash,
                  data.raw_log,
                  data.raw_log,
                )
              : new WebExtensionCreateTxFailed(data.raw_log),
          });
          subscriber.complete();
        } else {
          subscriber.next({
            status: WebExtensionTxStatus.SUCCEED,
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
          error instanceof WebExtensionLedgerError,
          isWebExtensionError(error),
          error.toString(),
        );
        if (isWebExtensionError(error)) {
          if (
            error instanceof WebExtensionLedgerError &&
            error.code === 27014
          ) {
            subscriber.next({
              status: WebExtensionTxStatus.DENIED,
            });
          } else {
            subscriber.next({
              status: WebExtensionTxStatus.FAIL,
              error,
            });
          }
        } else {
          subscriber.next({
            status: WebExtensionTxStatus.FAIL,
            error: new WebExtensionTxUnspecifiedError(
              'message' in error ? error.message : String(error),
            ),
          });
        }
        subscriber.complete();
      });
  });
}
