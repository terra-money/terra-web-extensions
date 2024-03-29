import {
  WebExtensionNetworkInfo,
  WebExtensionSignPayload,
  WebExtensionTxDenied,
  WebExtensionTxFail,
  WebExtensionTxProgress,
  WebExtensionTxStatus,
  WebExtensionTxSucceed,
  WebExtensionTxUnspecifiedError,
} from '@terra-dev/web-extension-interface';
import { LedgerKey, LedgerWallet } from '@terra-dev/web-extension-backend';
import { CreateTxOptions, LCDClient, SignatureV2 } from '@terra-money/terra.js';
import { Observable } from 'rxjs';

export function signWithLedgerWallet(
  wallet: LedgerWallet,
  network: WebExtensionNetworkInfo,
  tx: CreateTxOptions,
  key: LedgerKey,
) {
  return new Observable<
    | WebExtensionTxProgress
    | WebExtensionTxDenied
    | WebExtensionTxSucceed<WebExtensionSignPayload>
    | WebExtensionTxFail
  >((subscriber) => {
    const lcd = new LCDClient({
      chainID: network.chainID,
      URL: network.lcd,
      gasPrices: tx.gasPrices,
      gasAdjustment: tx.gasAdjustment,
    });

    const lcdWallet = lcd.wallet(key);

    lcdWallet
      .accountNumberAndSequence()
      .then(({ account_number, sequence }) => {
        return lcdWallet.createTx({ ...tx, sequence }).then((signed) => {
          return key.signTx(signed, {
            accountNumber: account_number,
            sequence,
            signMode: SignatureV2.SignMode.SIGN_MODE_LEGACY_AMINO_JSON,
            chainID: network.chainID,
          });
        });
      })
      .then((signedTx) => {
        subscriber.next({
          status: WebExtensionTxStatus.SUCCEED,
          payload: signedTx.toData(),
        });
        subscriber.complete();
      })
      .catch((error) => {
        subscriber.next({
          status: WebExtensionTxStatus.FAIL,
          error: new WebExtensionTxUnspecifiedError(
            error instanceof Error ? error.message : String(error),
          ),
        });
        subscriber.complete();
      });
  });
}
