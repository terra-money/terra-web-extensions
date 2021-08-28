import {
  SerializedCreateTxOptions,
  WebExtensionNetworkInfo,
  WebExtensionStates,
  WebExtensionTxResult,
} from '../models';

// ---------------------------------------------
// web -> content script
// ---------------------------------------------
export enum FromWebToContentScriptMessage {
  REFETCH_STATES = 'refetch_states',
  EXECUTE_TX = 'execute_tx',
  REQUEST_APPROVAL = 'request_approval',
}

export interface RefetchExtensionStates {
  type: FromWebToContentScriptMessage.REFETCH_STATES;
}

export interface ExecuteExtensionTx {
  type: FromWebToContentScriptMessage.EXECUTE_TX;

  /** primary id of this tx */
  id: number;

  /** target terra wallet address */
  terraAddress: string;

  /** target network */
  network: WebExtensionNetworkInfo;

  /** transaction payload */
  payload: SerializedCreateTxOptions;
}

export interface RequestApproval {
  type: FromWebToContentScriptMessage.REQUEST_APPROVAL;
}

// ---------------------------------------------
// content script -> web
// ---------------------------------------------
export enum FromContentScriptToWebMessage {
  STATES_UPDATED = 'states_updated',
  TX_RESPONSE = 'tx_response',
}

export interface WebExtensionStatesUpdated {
  type: FromContentScriptToWebMessage.STATES_UPDATED;
  payload: WebExtensionStates & { isApproved: boolean };
}

export interface WebExtensionTxResponse {
  type: FromContentScriptToWebMessage.TX_RESPONSE;

  /** primary id of this tx */
  id: number;

  /** tx response */
  payload: WebExtensionTxResult;
}

export type WebExtensionMessage =
  // web -> content script
  | RefetchExtensionStates
  | ExecuteExtensionTx
  | RequestApproval
  // content script -> web
  | WebExtensionStatesUpdated
  | WebExtensionTxResponse;

export function isWebExtensionMessage(
  value: unknown,
): value is WebExtensionMessage {
  if (!value || typeof value !== 'object' || !('type' in (value ?? {}))) {
    return false;
  }

  const msg = value as WebExtensionMessage;

  switch (msg.type) {
    // web -> content script
    case FromWebToContentScriptMessage.REFETCH_STATES:
      return true;
    case FromWebToContentScriptMessage.EXECUTE_TX:
      return typeof msg.id === 'number' && !!msg.payload;
    case FromWebToContentScriptMessage.REQUEST_APPROVAL:
      return true;
    // content script -> web
    case FromContentScriptToWebMessage.STATES_UPDATED:
      return !!msg.payload;
    case FromContentScriptToWebMessage.TX_RESPONSE:
      return typeof msg.id === 'number' && !!msg.payload;
    default:
      return false;
  }
}
