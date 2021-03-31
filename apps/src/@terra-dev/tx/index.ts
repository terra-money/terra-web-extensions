import { Wallet } from '@terra-dev/wallet';
import { CreateTxOptions } from '@terra-money/terra.js';
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

export interface SerializedTx {
  msgs: string[];
  fee: string | undefined;
  memo: string | undefined;
  gasPrices: string | undefined;
  gasAdjustment: string | undefined;
  account_number: number | undefined;
  sequence: number | undefined;
  feeDenoms: string[] | undefined;
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

export function executeTx(
  wallet: Wallet,
  tx: SerializedTx,
): Observable<TxProgress | TxSucceed | TxFail> {
  return new Observable<TxProgress | TxSucceed | TxFail>((subscriber) => {
    // TODO
  });
}