export enum WalletStatusType {
  INITIALIZING = 'initializing',
  NO_AVAILABLE = 'no_available',
  READY = 'ready',
}

export interface WalletStatusInitializing {
  type: WalletStatusType.INITIALIZING;
}

export interface WalletStatusNoAvailable {
  type: WalletStatusType.NO_AVAILABLE;
  isConnectorExists: boolean;
  isSupportBrowser?: boolean;
  isInstalled?: boolean;
  isApproved?: boolean;
  installLink?: string;
}

export interface WalletStatusReady {
  type: WalletStatusType.READY;
}

export type WalletStatus =
  | WalletStatusInitializing
  | WalletStatusNoAvailable
  | WalletStatusReady;
