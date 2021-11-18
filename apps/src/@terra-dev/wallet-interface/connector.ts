import type { CreateTxOptions } from '@terra-money/terra.js';
import type { Observer, Subscribable } from 'rxjs';
import { WalletNetworkInfo } from './models/network';
import { WalletStates } from './models/states';
import { WalletStatus } from './models/status';
import {
  WalletPostPayload,
  WalletSignPayload,
  WalletTxResult,
} from './models/tx';

export interface TerraWalletConnectorInfo {
  icon: string;
  name: string;
  url: string;
}

export interface TerraWalletConnector {
  getInfo: () => TerraWalletConnectorInfo;

  // ---------------------------------------------
  // open / close
  // ---------------------------------------------
  checkBrowserAvailability: (userAgent: string) => boolean;

  open: (
    hostWindow: Window,
    statusObserver: Observer<WalletStatus>,
    statesObserver: Observer<WalletStates>,
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
  ) => Subscribable<WalletTxResult<WalletPostPayload>>;

  sign: (
    terraAddress: string,
    tx: CreateTxOptions,
  ) => Subscribable<WalletTxResult<WalletSignPayload>>;

  hasCW20Tokens: (
    chainID: string,
    ...tokenAddrs: string[]
  ) => Promise<{ [tokenAddr: string]: boolean }>;

  addCW20Tokens: (
    chainID: string,
    ...tokenAddrs: string[]
  ) => Promise<{ [tokenAddr: string]: boolean }>;

  hasNetwork: (network: Omit<WalletNetworkInfo, 'name'>) => Promise<boolean>;

  addNetwork: (network: WalletNetworkInfo) => Promise<boolean>;
}
