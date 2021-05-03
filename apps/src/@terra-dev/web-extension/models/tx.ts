import { Wallet } from '@terra-dev/wallet';
import {
  CreateTxOptions,
  isTxError,
  LCDClient,
  Msg,
  RawKey,
  StdFee,
} from '@terra-money/terra.js';
import { Observable } from 'rxjs';
import { Network } from './network';

export enum WebExtensionTxStatus {
  PROGRESS = 'progress',
  SUCCEED = 'succeed',
  FAIL = 'fail',
  DENIED = 'denied',
}

export interface WebExtensionTxProgress {
  status: WebExtensionTxStatus.PROGRESS;
  payload?: unknown;
}

export interface WebExtensionTxSucceed {
  status: WebExtensionTxStatus.SUCCEED;
  payload: {
    height: number;
    raw_log: string;
    txhash: string;
  };
}

export interface WebExtensionTxFail {
  status: WebExtensionTxStatus.FAIL;
  error: unknown;
}

export interface WebExtensionTxDenied {
  status: WebExtensionTxStatus.DENIED;
}

export type WebExtensionTxResult =
  | WebExtensionTxProgress
  | WebExtensionTxSucceed
  | WebExtensionTxFail
  | WebExtensionTxDenied;

export interface SerializedCreateTxOptions
  extends Omit<CreateTxOptions, 'msgs' | 'fee'> {
  msgs: string[];
  fee: string | undefined;
}

export function serializeTx(tx: CreateTxOptions): SerializedCreateTxOptions {
  return {
    msgs: tx.msgs.map((msg) => msg.toJSON()),
    fee: tx.fee?.toJSON(),
    memo: tx.memo,
    gasPrices: tx.gasPrices?.toString(),
    gasAdjustment: tx.gasAdjustment?.toString(),
    account_number: tx.account_number,
    sequence: tx.sequence,
    feeDenoms: tx.feeDenoms,
  };
}

export function deserializeTx(tx: SerializedCreateTxOptions): CreateTxOptions {
  return {
    ...tx,
    msgs: tx.msgs.map((msg) => Msg.fromData(JSON.parse(msg))),
    fee: tx.fee ? StdFee.fromData(JSON.parse(tx.fee)) : undefined,
  };
}

export function executeTx(
  wallet: Wallet,
  network: Network,
  tx: SerializedCreateTxOptions,
): Observable<
  WebExtensionTxProgress | WebExtensionTxSucceed | WebExtensionTxFail
> {
  return new Observable<
    WebExtensionTxProgress | WebExtensionTxSucceed | WebExtensionTxFail
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
      .createAndSignTx(deserializeTx(tx))
      .then((signed) => lcd.tx.broadcastSync(signed))
      .then((data) => {
        if (isTxError(data)) {
          subscriber.next({
            status: WebExtensionTxStatus.FAIL,
            error: new Error(data.raw_log),
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
          error,
        });
        subscriber.complete();
      });
  });
}
