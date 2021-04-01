import { Network } from '@terra-dev/network';
import { Tx, TxDenied, TxFail, TxProgress, TxSucceed } from '@terra-dev/tx';
import { WalletInfo } from '@terra-dev/wallet';
import { Observable } from 'rxjs';

export enum ClientStatus {
  INITIALIZING = 'initializing',
  NO_AVAILABLE = 'no_available',
  READY = 'ready',
}

export interface StatusInitializing {
  type: ClientStatus.INITIALIZING;
}

export interface StatusNoAvailable {
  type: ClientStatus.NO_AVAILABLE;
  isSupportBrowser: boolean;
  isInstalled: boolean;
  installLink?: string;
}

export interface StatusReady {
  type: ClientStatus.READY;
}

export type Status = StatusInitializing | StatusNoAvailable | StatusReady;

export interface ClientStates {
  wallets: WalletInfo[];
  network: Network;
}

export interface Message<T> {
  type: string;
  payload: T;
}

export interface ExecuteParams {
  terraAddress: string;
  network: Network;
  tx: Tx;
}

export interface TerraConnectClient {
  status: () => Observable<Status>;

  message: () => Observable<Message<unknown>>;

  /**
   * @example
   * client.clientStates()
   *       .subscribe(states => {
   *         if (!states) {
   *           console.log('client is still not ready')
   *         } else {
   *           console.log('current network is', states.network)
   *           console.log('current wallets are', states.wallets)
   *         }
   *       })
   */
  clientStates: () => Observable<ClientStates | null>;

  /**
   * Refetch the clientsStates
   *
   * You don't need call this method in most cases.
   * Normally, when the clientStates is changed, states() get the new clientStates.
   *
   * @example
   * client.clientStates()
   *       .subscribe(states => {
   *         // 2. will get new clientStates
   *         console.log('Got new states', Date.now())
   *       })
   *
   * function callback() {
   *   // 1. refetch client states
   *   client.refetchClientStates()
   * }
   */
  refetchClientStates: () => void;

  /**
   * Execute transaction
   *
   * @example
   * client.execute(your_terraAddress, {...your_tx})
   *       .subscribe((result: TxProgress | TxSucceed | TxFail | TxDenied) => {
   *          switch (result.status) {
   *            case TxStatus.PROGRESS:
   *              console.log('in progress', result.payload)
   *              break;
   *            case TxStatus.SUCCEED:
   *              console.log('succeed', result.payload)
   *              break;
   *            case TxStatus.FAIL:
   *              console.log('fail', result.error)
   *              break;
   *            case TxStatus.DENIED:
   *              console.log('user denied');
   *              break;
   *          }
   *       })
   *
   * @description The stream will be
   * TxProgress -> [...TxProgress] -> TxSucceed | TxFail | TxDenied
   *
   * - User Denied : TxProgress -> [...TxProgress] -> TxDenied
   * - Tx is Failed : TxProgress -> [...TxProgress] -> TxFail
   * - Tx is Succeed : TxProgress -> [...TxProgress] -> TxSucceed
   */
  execute: (
    params: ExecuteParams,
  ) => Observable<TxProgress | TxSucceed | TxFail | TxDenied>;

  /**
   * Destroy this client
   *
   * - Unsubscribe all RxJs Subjects (every Observables are stoped)
   */
  destroy: () => void;
}
