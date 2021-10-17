export enum WebConnectorStatusType {
  INITIALIZING = 'initializing',
  NO_AVAILABLE = 'no_available',
  READY = 'ready',
}

export interface WebConnectorStatusInitializing {
  type: WebConnectorStatusType.INITIALIZING;
}

export interface WebConnectorStatusNoAvailable {
  type: WebConnectorStatusType.NO_AVAILABLE;
  isConnectorExists: boolean;
  isSupportBrowser?: boolean;
  isInstalled?: boolean;
  isApproved?: boolean;
  installLink?: string;
}

export interface WebConnectorStatusReady {
  type: WebConnectorStatusType.READY;
}

export type WebConnectorStatus =
  | WebConnectorStatusInitializing
  | WebConnectorStatusNoAvailable
  | WebConnectorStatusReady;
