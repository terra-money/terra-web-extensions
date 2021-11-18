import {
  WalletCreateTxFailed,
  WalletNetworkInfo,
  WalletPostPayload,
  WalletTxDenied,
  WalletTxFail,
  WalletTxFailed,
  WalletTxProgress,
  WalletTxStatus,
  WalletTxSucceed,
  WalletTxUnspecifiedError,
} from '@terra-dev/wallet-interface';
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
  network: WalletNetworkInfo,
  tx: CreateTxOptions,
) {
  return new Observable<
    | WalletTxProgress
    | WalletTxDenied
    | WalletTxSucceed<WalletPostPayload>
    | WalletTxFail
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
            status: WalletTxStatus.FAIL,
            error: !!data.txhash
              ? new WalletTxFailed(data.txhash, data.raw_log, data.raw_log)
              : new WalletCreateTxFailed(data.raw_log),
          });
          subscriber.complete();
        } else {
          subscriber.next({
            status: WalletTxStatus.SUCCEED,
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
          status: WalletTxStatus.FAIL,
          error: new WalletTxUnspecifiedError(
            error instanceof Error ? error.message : String(error),
          ),
        });
        subscriber.complete();
      });
  });
}
