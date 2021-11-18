import {
  isWalletError,
  WalletCreateTxFailed,
  WalletLedgerError,
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
  network: WalletNetworkInfo,
  tx: CreateTxOptions,
  key: LedgerKey,
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
        console.log(
          'executeTxWithLedgerWallet.ts..()',
          error instanceof WalletLedgerError,
          isWalletError(error),
          error.toString(),
        );
        if (isWalletError(error)) {
          if (error instanceof WalletLedgerError && error.code === 27014) {
            subscriber.next({
              status: WalletTxStatus.DENIED,
            });
          } else {
            subscriber.next({
              status: WalletTxStatus.FAIL,
              error,
            });
          }
        } else {
          subscriber.next({
            status: WalletTxStatus.FAIL,
            error: new WalletTxUnspecifiedError(
              'message' in error ? error.message : String(error),
            ),
          });
        }
        subscriber.complete();
      });
  });
}
