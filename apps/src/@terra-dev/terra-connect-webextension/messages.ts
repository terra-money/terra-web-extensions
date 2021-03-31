import { WalletInfo } from '@terra-dev/wallet';

export enum MessageType {
  NEW_WALLET = 'new_wallet',
  NETWORK_CHANGED = 'network_changed',
  WALLET_CHANGED = 'wallet_changed',
  ALL_WALLETS_REMOVED = 'all_wallet_removed',
}

export interface MessageNewWallet {
  type: MessageType.NEW_WALLET;
  wallet: WalletInfo;
}

export interface MessageNetworkChanged {
  type: MessageType.NETWORK_CHANGED;
}

export interface MessageWalletChanged {
  type: MessageType.WALLET_CHANGED;
  prevWallet?: WalletInfo;
  wallet: WalletInfo;
}

export interface MessageAllWalletsRemoved {
  type: MessageType.ALL_WALLETS_REMOVED;
}

export type WebExtensionMessage =
  | MessageNewWallet
  | MessageNetworkChanged
  | MessageWalletChanged
  | MessageAllWalletsRemoved;
