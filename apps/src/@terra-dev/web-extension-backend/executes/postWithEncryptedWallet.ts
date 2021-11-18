import {
  WebConnectorCreateTxFailed,
  WebConnectorNetworkInfo,
  WebConnectorPostPayload,
  WebConnectorTxDenied,
  WebConnectorTxFail,
  WebConnectorTxFailed,
  WebConnectorTxProgress,
  WebConnectorTxStatus,
  WebConnectorTxSucceed,
  WebConnectorTxUnspecifiedError,
} from '@terra-dev/web-connector-interface';
import {
  CreateTxOptions,
  isTxError,
  LCDClient,
  RawKey,
} from '@terra-money/terra.js';
import { Observable } from 'rxjs';
import { Wallet } from '../models';

export function postWithEncryptedWallet(
  wallet: Wallet,
  network: WebConnectorNetworkInfo,
  tx: CreateTxOptions,
) {
  return new Observable<
    | WebConnectorTxProgress
    | WebConnectorTxDenied
    | WebConnectorTxSucceed<WebConnectorPostPayload>
    | WebConnectorTxFail
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
        subscriber.next({
          status: WebConnectorTxStatus.FAIL,
          error: new WebConnectorTxUnspecifiedError(
            error instanceof Error ? error.message : String(error),
          ),
        });
        subscriber.complete();
      });
  });
}
