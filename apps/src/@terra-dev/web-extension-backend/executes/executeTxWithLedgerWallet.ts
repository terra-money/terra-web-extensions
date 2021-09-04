import {
  WebExtensionCreateTxFailed,
  WebExtensionNetworkInfo,
  WebExtensionTxFail,
  WebExtensionTxFailed,
  WebExtensionTxProgress,
  WebExtensionTxStatus,
  WebExtensionTxSucceed,
  WebExtensionTxUnspecifiedError,
} from '@terra-dev/web-extension';
import { LedgerKey } from '@terra-dev/web-extension-backend/interfaces';
import { LedgerWallet } from '@terra-dev/web-extension-backend/models';
import { CreateTxOptions, isTxError, LCDClient } from '@terra-money/terra.js';
import { Observable } from 'rxjs';

export function executeTxWithLedgerWallet(
  wallet: LedgerWallet,
  network: WebExtensionNetworkInfo,
  tx: CreateTxOptions,
  key: LedgerKey,
): Observable<
  WebExtensionTxProgress | WebExtensionTxSucceed | WebExtensionTxFail
> {
  const lcd = new LCDClient({
    chainID: network.chainID,
    URL: network.lcd,
    gasPrices: tx.gasPrices,
    gasAdjustment: tx.gasAdjustment,
  });

  return new Observable<
    WebExtensionTxProgress | WebExtensionTxSucceed | WebExtensionTxFail
  >((subscriber) => {
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
