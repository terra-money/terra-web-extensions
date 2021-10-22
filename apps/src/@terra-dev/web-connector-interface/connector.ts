import type { CreateTxOptions } from '@terra-money/terra.js';
import type { Observable, Observer } from 'rxjs';
import { WebConnectorStates } from './models/states';
import { WebConnectorStatus } from './models/status';
import { WebConnectorTxResult } from './models/tx';

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

  open: (
    hostWindow: Window,
    statusObserver: Observer<WebConnectorStatus>,
    statesObserver: Observer<WebConnectorStates>,
  ) => void;

  close: () => void;

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
