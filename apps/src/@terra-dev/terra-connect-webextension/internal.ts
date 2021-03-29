import { ClientStates } from '@terra-dev/terra-connect';

export enum ExtensionMessageType {
  CLIENT_STATES_UPDATED = 'client_states_updated',
  REFETCH_CLIENT_STATES = 'refetch_client_states',
}

export interface ExtensionClientStatesUpdated {
  type: ExtensionMessageType.CLIENT_STATES_UPDATED;
  payload: ClientStates;
}

export interface RefetchExtensionClientStates {
  type: ExtensionMessageType.REFETCH_CLIENT_STATES;
}

export type ExtensionMessage =
  | ExtensionClientStatesUpdated
  | RefetchExtensionClientStates;

export function isExtensionMessage(value: unknown): value is ExtensionMessage {
  if (!value || typeof value !== 'object' || !('type' in (value ?? {}))) {
    return false;
  }

  const msg = value as ExtensionMessage;

  switch (msg.type) {
    case ExtensionMessageType.CLIENT_STATES_UPDATED:
      return !!msg.payload;
    case ExtensionMessageType.REFETCH_CLIENT_STATES:
      return true;
    default:
      return false;
  }
}
