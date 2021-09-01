import { AccAddress } from '@terra-money/terra.js';
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
  ADD_CW20_TOKENS = 'add_cw20_tokens',
  HAS_CW20_TOKENS = 'has_cw20_tokens',
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
  STATES_UPDATED = 'states_updated',
  TX_RESPONSE = 'tx_response',
  ADD_CW20_TOKENS_RESPONSE = 'add_cw20_tokens_response',
  HAS_CW20_TOKENS_RESPONSE = 'has_cw20_tokens_response',
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
