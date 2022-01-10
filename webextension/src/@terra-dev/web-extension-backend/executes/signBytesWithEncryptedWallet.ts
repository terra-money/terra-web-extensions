import {
  WebExtensionSignBytesPayload,
  WebExtensionTxDenied,
  WebExtensionTxFail,
  WebExtensionTxProgress,
  WebExtensionTxStatus,
  WebExtensionTxSucceed,
  WebExtensionTxUnspecifiedError,
} from '@terra-dev/web-extension-interface';
import { RawKey } from '@terra-money/terra.js';
import { Observable } from 'rxjs';
import { Wallet } from '../models';

export function signBytesWithEncryptedWallet(wallet: Wallet, bytes: Buffer) {
  return new Observable<
    | WebExtensionTxProgress
    | WebExtensionTxDenied
    | WebExtensionTxSucceed<WebExtensionSignBytesPayload>
    | WebExtensionTxFail
  >((subscriber) => {
    try {
      const { privateKey } = wallet;

      const key = new RawKey(Buffer.from(privateKey, 'hex'));

      const { signature, recid } = key.ecdsaSign(bytes);

      const result: WebExtensionSignBytesPayload = {
        recid,
        signature: Buffer.from(signature).toString('base64'),
        public_key: key.publicKey?.toData(),
      };

      subscriber.next({
        status: WebExtensionTxStatus.SUCCEED,
        payload: result,
      });
      subscriber.complete();
    } catch (error) {
      subscriber.next({
        status: WebExtensionTxStatus.FAIL,
        error: new WebExtensionTxUnspecifiedError(
          error instanceof Error ? error.message : String(error),
        ),
      });
      subscriber.complete();
    }
  });
}
