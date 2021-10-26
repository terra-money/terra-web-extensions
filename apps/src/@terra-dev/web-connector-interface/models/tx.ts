import { CreateTxOptions, Msg, StdFee } from '@terra-money/terra.js';
import {
  WebConnectorCreateTxFailed,
  WebConnectorTxFailed,
  WebConnectorTxUnspecifiedError,
} from '../errors';

export enum WebConnectorTxStatus {
  PROGRESS = 'PROGRESS',
  SUCCEED = 'SUCCEED',
  FAIL = 'FAIL',
  DENIED = 'DENIED',
}

export interface WebConnectorTxProgress {
  status: WebConnectorTxStatus.PROGRESS;
  payload?: unknown;
}

export interface WebConnectorTxSucceed {
  status: WebConnectorTxStatus.SUCCEED;
  payload: {
    height: number;
    raw_log: string;
    txhash: string;
  };
}

export interface WebConnectorTxFail {
  status: WebConnectorTxStatus.FAIL;
  error:
    | WebConnectorCreateTxFailed
    | WebConnectorTxFailed
    | WebConnectorTxUnspecifiedError;
}

export interface WebConnectorTxDenied {
  status: WebConnectorTxStatus.DENIED;
}

export type WebConnectorTxResult =
  | WebConnectorTxProgress
  | WebConnectorTxSucceed
  | WebConnectorTxFail
  | WebConnectorTxDenied;

// ---------------------------------------------
// functions
// ---------------------------------------------
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