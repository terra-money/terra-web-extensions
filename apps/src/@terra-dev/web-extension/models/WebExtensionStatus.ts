export enum WebExtensionStatusType {
  INITIALIZING = 'initializing',
  NO_AVAILABLE = 'no_available',
  READY = 'ready',
}

export interface WebExtensionStatusInitializing {
  type: WebExtensionStatusType.INITIALIZING;
}

export interface WebExtensionStatusNoAvailable {
  type: WebExtensionStatusType.NO_AVAILABLE;
  isMetaExists: boolean;
  isSupportBrowser?: boolean;
  isInstalled?: boolean;
  isApproved?: boolean;
  installLink?: string;
}

export interface WebExtensionStatusReady {
  type: WebExtensionStatusType.READY;
}

export type WebExtensionStatus =
  | WebExtensionStatusInitializing
  | WebExtensionStatusNoAvailable
  | WebExtensionStatusReady;
