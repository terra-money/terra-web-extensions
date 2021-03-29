import { Network } from '@terra-dev/network';
import { WalletInfo } from '@terra-dev/wallet';
import { Observable } from 'rxjs';

export enum ClientStatus {
  INITIALIZING = 'initializing',
  NO_AVAILABLE = 'no_available',
  READY = 'ready',
}

export interface ClientStates {
  wallets: WalletInfo[];
  network: Network;
}

export interface Tx {}

export interface TxResult {}

export interface TerraConnectClient {
  status: () => Observable<ClientStatus>;
  network: () => Observable<Network>;
  states: () => Observable<ClientStates | null>;
  refetch: () => void;
  execute: (tx: Tx) => Observable<TxResult>;
  destroy: () => void;
}

export interface TerraConnectBackend {
  refetch: Observable<{}>;
  execute: Observable<Tx>;
  updateNetwork: (network: Network) => void;
  updateStates: (clientStates: ClientStates) => void;
}
