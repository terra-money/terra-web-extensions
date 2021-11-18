import { CreateTxOptions, Fee, Msg, Tx } from '@terra-money/terra.js';
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

export interface WebConnectorPostPayload {
  height: number;
  raw_log: string;
  txhash: string;
}

export type WebConnectorSignPayload = Tx.Data;

export interface WebConnectorTxSucceed<Payload> {
  status: WebConnectorTxStatus.SUCCEED;
  payload: Payload;
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

export type WebConnectorTxResult<Payload> =
  | WebConnectorTxProgress
  | WebConnectorTxSucceed<Payload>
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
    feeDenoms: tx.feeDenoms,
  };
}

export function deserializeTx(tx: SerializedCreateTxOptions): CreateTxOptions {
  const msgs = tx.msgs.map((msg) => JSON.parse(msg));
  const isProto = '@type' in msgs[0];

  return {
    ...tx,
    msgs: msgs.map((msg) => (isProto ? Msg.fromData(msg) : Msg.fromAmino(msg))),
    fee: tx.fee
      ? isProto
        ? Fee.fromData(JSON.parse(tx.fee))
        : Fee.fromAmino(JSON.parse(tx.fee))
      : undefined,
  };
}
