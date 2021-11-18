import {
  WebConnectorNetworkInfo,
  WebConnectorSignPayload,
  WebConnectorTxDenied,
  WebConnectorTxFail,
  WebConnectorTxProgress,
  WebConnectorTxStatus,
  WebConnectorTxSucceed,
  WebConnectorTxUnspecifiedError,
} from '@terra-dev/web-connector-interface';
import {
  CreateTxOptions,
  LCDClient,
  RawKey,
  SignatureV2,
} from '@terra-money/terra.js';
import { Observable } from 'rxjs';
import { Wallet } from '../models';

export function signWithEncryptedWallet(
  wallet: Wallet,
  network: WebConnectorNetworkInfo,
  tx: CreateTxOptions,
) {
  return new Observable<
    | WebConnectorTxProgress
    | WebConnectorTxDenied
    | WebConnectorTxSucceed<WebConnectorSignPayload>
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

    const lcdWallet = lcd.wallet(key);

    Promise.all([lcdWallet.createTx(tx), lcdWallet.accountNumberAndSequence()])
      .then(([signed, { account_number, sequence }]) => {
        return key.signTx(signed, {
          accountNumber: account_number,
          sequence,
          signMode: SignatureV2.SignMode.SIGN_MODE_DIRECT,
          chainID: network.chainID,
        });
      })
      .then((signedTx) => {
        subscriber.next({
          status: WebConnectorTxStatus.SUCCEED,
          payload: signedTx.toData(),
        });
        subscriber.complete();
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
