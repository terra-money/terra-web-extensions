import type { CreateTxOptions } from '@terra-money/terra.js';
import type { Observer, Subscribable } from 'rxjs';
import type { WebExtensionNetworkInfo } from './models/network';
import type { WebExtensionStates } from './models/states';
import type { WebExtensionStatus } from './models/status';
import type {
  WebExtensionPostPayload,
  WebExtensionSignPayload,
  WebExtensionTxResult,
} from './models/tx';

export interface TerraWebExtensionConnectorInfo {
  icon: string;
  name: string;
  url: string;
}

export interface TerraWebExtensionConnector {
  getInfo: () => TerraWebExtensionConnectorInfo;

  // ---------------------------------------------
  // open / close
  // ---------------------------------------------
  checkBrowserAvailability: (userAgent: string) => boolean;

  open: (
    hostWindow: Window,
    statusObserver: Observer<WebExtensionStatus>,
    statesObserver: Observer<WebExtensionStates>,
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
  ) => Subscribable<WebExtensionTxResult<WebExtensionPostPayload>>;

  sign: (
    terraAddress: string,
    tx: CreateTxOptions,
  ) => Subscribable<WebExtensionTxResult<WebExtensionSignPayload>>;

  hasCW20Tokens: (
    chainID: string,
    ...tokenAddrs: string[]
  ) => Promise<{ [tokenAddr: string]: boolean }>;

  addCW20Tokens: (
    chainID: string,
    ...tokenAddrs: string[]
  ) => Promise<{ [tokenAddr: string]: boolean }>;

  hasNetwork: (
    network: Omit<WebExtensionNetworkInfo, 'name'>,
  ) => Promise<boolean>;

  addNetwork: (network: WebExtensionNetworkInfo) => Promise<boolean>;
}
