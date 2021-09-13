import {
  WebExtensionCreateTxFailed,
  WebExtensionNetworkInfo,
  WebExtensionTxDenied,
  WebExtensionTxFail,
  WebExtensionTxFailed,
  WebExtensionTxProgress,
  WebExtensionTxStatus,
  WebExtensionTxSucceed,
  WebExtensionTxUnspecifiedError,
} from '@terra-dev/web-extension';
import {
  CreateTxOptions,
  isTxError,
  LCDClient,
  RawKey,
} from '@terra-money/terra.js';
import { Observable } from 'rxjs';
import { Wallet } from '../models/InternalWallet';

export function executeTxWithInternalWallet(
  wallet: Wallet,
  network: WebExtensionNetworkInfo,
  tx: CreateTxOptions,
): Observable<
  | WebExtensionTxProgress
  | WebExtensionTxDenied
  | WebExtensionTxSucceed
  | WebExtensionTxFail
> {
  return new Observable<
    | WebExtensionTxProgress
    | WebExtensionTxDenied
    | WebExtensionTxSucceed
    | WebExtensionTxFail
  >((subscriber) => {
    const lcd = new LCDClient({
      chainID: network.chainID,
      URL: network.lcd,
      gasPrices: tx.gasPrices,
      gasAdjustment: tx.gasAdjustment,
    });

    const { privateKey } = wallet;

    const key = new RawKey(Buffer.from(privateKey, 'hex'));

    lcd
      .wallet(key)
      .createAndSignTx(tx)
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
        subscriber.next({
          status: WebExtensionTxStatus.FAIL,
          error: new WebExtensionTxUnspecifiedError(
            'message' in error ? error.message : String(error),
          ),
        });
        subscriber.complete();
      });
  });
}
