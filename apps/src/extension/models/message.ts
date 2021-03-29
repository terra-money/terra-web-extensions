import { StoredWallet } from '@terra-dev/extension-wallet-storage';

export interface ExtensionState {
  wallets?: StoredWallet[];
}

export enum MessageType {
  EXTENSION_STATE_UPDATED = 'extension_state_updated',
  REFETCH_EXTENSION_STATE = 'refetch_extension_state',
}

export interface ExtensionStateUpdated {
  connectId: string;
  type: MessageType.EXTENSION_STATE_UPDATED;
  payload: ExtensionState;
}

export interface RefetchExtensionState {
  connectId: string;
  type: MessageType.REFETCH_EXTENSION_STATE;
  payload: (keyof ExtensionState)[];
}

export type TerraConnectMessage = ExtensionStateUpdated | RefetchExtensionState;

export function isTerraConnectMessage(
  value: unknown,
): value is TerraConnectMessage {
  return (
    !!value &&
    typeof value === 'object' &&
    'connectId' in (value ?? {}) &&
    'type' in (value ?? {}) &&
    'payload' in (value ?? {})
  );
}
