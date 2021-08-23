import { CreateTxOptions, Msg, StdFee } from '@terra-money/terra.js';
import {
  WebExtensionCreateTxFailed,
  WebExtensionTxFailed,
  WebExtensionTxUnspecifiedError,
} from '../errors';

export enum WebExtensionTxStatus {
  PROGRESS = 'PROGRESS',
  SUCCEED = 'SUCCEED',
  FAIL = 'FAIL',
  DENIED = 'DENIED',
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
  error:
    | WebExtensionCreateTxFailed
    | WebExtensionTxFailed
    | WebExtensionTxUnspecifiedError;
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
