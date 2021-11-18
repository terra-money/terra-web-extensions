import { CreateTxOptions, Fee, Msg, Tx } from '@terra-money/terra.js';
import {
  WalletCreateTxFailed,
  WalletTxFailed,
  WalletTxUnspecifiedError,
} from '../errors';

export enum WalletTxStatus {
  PROGRESS = 'PROGRESS',
  SUCCEED = 'SUCCEED',
  FAIL = 'FAIL',
  DENIED = 'DENIED',
}

export interface WalletTxProgress {
  status: WalletTxStatus.PROGRESS;
  payload?: unknown;
}

export interface WalletPostPayload {
  height: number;
  raw_log: string;
  txhash: string;
}

export type WalletSignPayload = Tx.Data;

export interface WalletTxSucceed<Payload> {
  status: WalletTxStatus.SUCCEED;
  payload: Payload;
}

export interface WalletTxFail {
  status: WalletTxStatus.FAIL;
  error: WalletCreateTxFailed | WalletTxFailed | WalletTxUnspecifiedError;
}

export interface WalletTxDenied {
  status: WalletTxStatus.DENIED;
}

export type WalletTxResult<Payload> =
  | WalletTxProgress
  | WalletTxSucceed<Payload>
  | WalletTxFail
  | WalletTxDenied;

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
