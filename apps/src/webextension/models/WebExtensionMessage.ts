import {
  SerializedCreateTxOptions,
  WebConnectorStates,
  WebConnectorTxResult,
} from '@terra-dev/web-connector-interface';
import { AccAddress } from '@terra-money/terra.js';

// ---------------------------------------------
// web -> content script
// ---------------------------------------------
export enum FromWebToContentScriptMessage {
  REFETCH_STATES = 'REFETCH_STATES',
  EXECUTE_TX = 'EXECUTE_TX',
  REQUEST_APPROVAL = 'REQUEST_APPROVAL',
  ADD_CW20_TOKENS = 'ADD_CW20_TOKENS',
  HAS_CW20_TOKENS = 'HAS_CW20_TOKENS',
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

  /** transaction payload */
  payload: SerializedCreateTxOptions;
}

export interface RequestApproval {
  type: FromWebToContentScriptMessage.REQUEST_APPROVAL;
}

export interface AddCW20Tokens {
  type: FromWebToContentScriptMessage.ADD_CW20_TOKENS;

  /** primary id */
  id: number;

  chainID: string;

  /** CW20 Token Addr */
  tokenAddrs: string[];
}

export interface HasCW20Tokens {
  type: FromWebToContentScriptMessage.HAS_CW20_TOKENS;

  /** primary id */
  id: number;

  chainID: string;

  /** CW20 Token Addr */
  tokenAddrs: string[];
}

// ---------------------------------------------
// content script -> web
// ---------------------------------------------
export enum FromContentScriptToWebMessage {
  STATES_UPDATED = 'STATES_UPDATED',
  TX_RESPONSE = 'TX_RESPONSE',
  ADD_CW20_TOKENS_RESPONSE = 'ADD_CW20_TOKENS_RESPONSE',
  HAS_CW20_TOKENS_RESPONSE = 'HAS_CW20_TOKENS_RESPONSE',
}

export interface WebExtensionStatesUpdated {
  type: FromContentScriptToWebMessage.STATES_UPDATED;
  payload: WebConnectorStates & { isApproved: boolean };
}

export interface WebExtensionTxResponse {
  type: FromContentScriptToWebMessage.TX_RESPONSE;

  /** primary id of this tx */
  id: number;

  /** tx response */
  payload: WebConnectorTxResult;
}

export interface WebExtensionAddCW20TokenResponse {
  type: FromContentScriptToWebMessage.ADD_CW20_TOKENS_RESPONSE;

  /** primary id */
  id: number;

  chainID: string;

  /** result */
  payload: { [tokenAddr: string]: boolean };
}

export interface WebExtensionHasCW20TokensResponse {
  type: FromContentScriptToWebMessage.HAS_CW20_TOKENS_RESPONSE;

  /** primary id */
  id: number;

  chainID: string;

  /** result */
  payload: { [tokenAddr: string]: boolean };
}

export type WebExtensionMessage =
  // web -> content script
  | RefetchExtensionStates
  | ExecuteExtensionTx
  | RequestApproval
  | AddCW20Tokens
  | HasCW20Tokens
  // content script -> web
  | WebExtensionStatesUpdated
  | WebExtensionTxResponse
  | WebExtensionAddCW20TokenResponse
  | WebExtensionHasCW20TokensResponse;

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
    case FromWebToContentScriptMessage.ADD_CW20_TOKENS:
      return (
        Array.isArray(msg.tokenAddrs) &&
        msg.tokenAddrs.every((tokenAddr) => AccAddress.validate(tokenAddr))
      );
    case FromWebToContentScriptMessage.HAS_CW20_TOKENS:
      return (
        Array.isArray(msg.tokenAddrs) &&
        msg.tokenAddrs.every((tokenAddr) => AccAddress.validate(tokenAddr))
      );
    // content script -> web
    case FromContentScriptToWebMessage.STATES_UPDATED:
      return !!msg.payload;
    case FromContentScriptToWebMessage.TX_RESPONSE:
      return typeof msg.id === 'number' && !!msg.payload;
    case FromContentScriptToWebMessage.ADD_CW20_TOKENS_RESPONSE:
      return typeof msg.id === 'number' && !!msg.payload;
    case FromContentScriptToWebMessage.HAS_CW20_TOKENS_RESPONSE:
      return typeof msg.id === 'number' && !!msg.payload;
    default:
      return false;
  }
}
