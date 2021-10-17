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
