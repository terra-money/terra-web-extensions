import {
  WebExtensionSignBytesPayload,
  WebExtensionTxDenied,
  WebExtensionTxFail,
  WebExtensionTxProgress,
  WebExtensionTxStatus,
  WebExtensionTxSucceed,
  WebExtensionTxUnspecifiedError,
} from '@terra-dev/web-extension-interface';
import { SignResponse } from '@terra-money/ledger-terra-js';
import { Observable } from 'rxjs';
import { LedgerWallet } from '../models';

export function signBytesWithEncryptedWallet(
  wallet: LedgerWallet,
  bytes: Buffer,
  { signature }: SignResponse,
) {
  return new Observable<
    | WebExtensionTxProgress
    | WebExtensionTxDenied
    | WebExtensionTxSucceed<WebExtensionSignBytesPayload>
    | WebExtensionTxFail
  >((subscriber) => {
    try {
      //const { privateKey } = wallet;
      //
      //const key = new RawKey(Buffer.from(privateKey, 'hex'));
      //
      //const { signature, recid } = key.ecdsaSign(bytes);
      //
      //const result: WebExtensionSignBytesPayload = {
      //  recid,
      //  signature,
      //  public_key: key.publicKey?.toData(),
      //};
      //
      //subscriber.next({
      //  status: WebExtensionTxStatus.SUCCEED,
      //  payload: result,
      //});
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
