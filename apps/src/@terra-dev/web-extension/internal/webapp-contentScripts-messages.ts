import {
  Network,
  SerializedCreateTxOptions,
  WebExtensionStates,
  WebExtensionTxResult,
} from '../models';

// ---------------------------------------------
// web -> content script
// ---------------------------------------------
export enum FromWebToContentScriptMessage {
  REFETCH_CLIENT_STATES = 'refetch_client_states',
  EXECUTE_TX = 'execute_tx',
}

export interface RefetchExtensionClientStates {
  type: FromWebToContentScriptMessage.REFETCH_CLIENT_STATES;
}

export interface ExecuteExtensionTx {
  type: FromWebToContentScriptMessage.EXECUTE_TX;

  /** primary id of this tx */
  id: number;

  /** target terra wallet address */
  terraAddress: string;

  /** target network */
  network: Network;

  /** transaction payload */
  payload: SerializedCreateTxOptions;
}

// ---------------------------------------------
// content script -> web
// ---------------------------------------------
export enum FromContentScriptToWebMessage {
  CLIENT_STATES_UPDATED = 'client_states_updated',
  TX_RESPONSE = 'tx_response',
}

export interface WebExtensionClientStatesUpdated {
  type: FromContentScriptToWebMessage.CLIENT_STATES_UPDATED;
  payload: WebExtensionStates;
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
  | RefetchExtensionClientStates
  | ExecuteExtensionTx
  // content script -> web
  | WebExtensionClientStatesUpdated
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
    case FromWebToContentScriptMessage.REFETCH_CLIENT_STATES:
      return true;
    case FromWebToContentScriptMessage.EXECUTE_TX:
      return typeof msg.id === 'number' && !!msg.payload;
    // content script -> web
    case FromContentScriptToWebMessage.CLIENT_STATES_UPDATED:
      return !!msg.payload;
    case FromContentScriptToWebMessage.TX_RESPONSE:
      return typeof msg.id === 'number' && !!msg.payload;
    default:
      return false;
  }
}
