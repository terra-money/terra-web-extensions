import { Network } from '@terra-dev/network';
import { Wallet } from '@terra-dev/wallet';
import { CreateTxOptions, Msg, StdFee } from '@terra-money/terra.js';
import { Observable } from 'rxjs';

export enum TxStatus {
  PROGRESS = 'progress',
  SUCCEED = 'succeed',
  FAIL = 'fail',
  DENIED = 'denied',
}

export interface TxProgress {
  status: TxStatus.PROGRESS;
  payload?: unknown;
}

export interface TxSucceed {
  status: TxStatus.SUCCEED;
  payload: {
    height: number;
    rawLog: string;
    txhash: string;
  };
}

export interface TxFail {
  status: TxStatus.FAIL;
  error: unknown;
}

export interface TxDenied {
  status: TxStatus.DENIED;
}

export interface Tx extends CreateTxOptions {}

export interface SerializedTx extends Omit<CreateTxOptions, 'msgs' | 'fee'> {
  msgs: string[];
  fee: string | undefined;
}

export function serializeTx(tx: Tx): SerializedTx {
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

export function deserializeTx(tx: SerializedTx): Tx {
  return {
    ...tx,
    msgs: tx.msgs.map((msg) => Msg.fromData(JSON.parse(msg))),
    fee: tx.fee ? StdFee.fromData(JSON.parse(tx.fee)) : undefined,
  };
}

export function executeTx(
  wallet: Wallet,
  network: Network,
  tx: SerializedTx,
): Observable<TxProgress | TxSucceed | TxFail> {
  return new Observable<TxProgress | TxSucceed | TxFail>((subscriber) => {
    // TODO
  });
}
