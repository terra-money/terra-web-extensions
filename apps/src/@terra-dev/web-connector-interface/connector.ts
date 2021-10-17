import type { CreateTxOptions } from '@terra-money/terra.js';
import type { Observable, Observer } from 'rxjs';
import { WebConnectorStates } from './models/WebConnectorStates';
import { WebConnectorStatus } from './models/WebConnectorStatus';
import { WebConnectorTxResult } from './models/WebConnectorTxResult';

export interface TerraWebConnectorInfo {
  icon: string;
  name: string;
  url: string;
}

export interface TerraWebConnector {
  getInfo: () => TerraWebConnectorInfo;

  // ---------------------------------------------
  // open / close
  // ---------------------------------------------
  checkBrowserAvailability: (userAgent: string) => boolean;

  //hasInitialSession: () => boolean;

  open: (
    hostWindow: Window,
    statusObserver: Observer<WebConnectorStatus>,
    statesObserver: Observer<WebConnectorStates>,
  ) => void;

  close: () => void;

  // ---------------------------------------------
  // status
  // ---------------------------------------------
  //status: () => Observable<WebConnectorStatus>;

  // ---------------------------------------------
  // states
  // ---------------------------------------------
  //states: () => Observable<WebConnectorStates | null>;

  // ---------------------------------------------
  // commands
  // ---------------------------------------------
  requestApproval: () => void;

  refetchStates: () => void;

  post: (
    terraAddress: string,
    tx: CreateTxOptions,
  ) => Observable<WebConnectorTxResult>;

  addCW20Tokens: (
    chainID: string,
    ...tokenAddrs: string[]
  ) => Promise<{ [tokenAddr: string]: boolean }>;

  hasCW20Tokens: (
    chainID: string,
    ...tokenAddrs: string[]
  ) => Promise<{ [tokenAddr: string]: boolean }>;
}
