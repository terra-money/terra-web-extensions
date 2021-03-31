import { Network } from '@terra-dev/network';
import {
  ClientStates,
  ClientStatus,
  TerraConnectClient,
} from '@terra-dev/terra-connect';
import {
  serializeTx,
  Tx,
  TxDenied,
  TxFail,
  TxProgress,
  TxStatus,
  TxSucceed,
} from '@terra-dev/tx';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  ExecuteExtensionTx,
  FromContentScriptToWebMessage,
  FromWebToContentScriptMessage,
  isExtensionMessage,
  RefetchExtensionClientStates,
} from './internal';

export class TerraConnectWebExtensionClient implements TerraConnectClient {
  private _status: BehaviorSubject<ClientStatus>;
  private _clientStates: BehaviorSubject<ClientStates | null>;

  constructor(private hostWindow: Window) {
    this._status = new BehaviorSubject<ClientStatus>(ClientStatus.INITIALIZING);
    this._clientStates = new BehaviorSubject<ClientStates | null>(null);

    const meta = document.querySelector('head > meta[name="terra-connect"]');

    if (!meta) {
      this._status.next(ClientStatus.NO_AVAILABLE);
      return;
    }

    hostWindow.addEventListener('message', this.onMessage);
  }

  refetch = () => {
    const msg: RefetchExtensionClientStates = {
      type: FromWebToContentScriptMessage.REFETCH_CLIENT_STATES,
    };

    this.hostWindow.postMessage(msg, '*');
  };

  status = () => {
    return this._status.asObservable();
  };

  execute = (terraAddress: string, network: Network, tx: Tx) => {
    return new Observable<TxProgress | TxSucceed | TxFail | TxDenied>(
      (subscriber) => {
        subscriber.next({
          status: TxStatus.PROGRESS,
        });

        const id = Date.now();

        const msg: ExecuteExtensionTx = {
          type: FromWebToContentScriptMessage.EXECUTE_TX,
          id,
          terraAddress,
          network,
          payload: serializeTx(tx),
        };

        this.hostWindow.postMessage(msg, '*');

        const callback = (event: MessageEvent) => {
          if (
            !isExtensionMessage(event.data) ||
            event.data.type !== FromContentScriptToWebMessage.TX_RESPONSE ||
            event.data.id !== id
          ) {
            return;
          }

          subscriber.next(event.data.payload);

          if (
            event.data.payload.status === TxStatus.SUCCEED ||
            event.data.payload.status === TxStatus.FAIL ||
            event.data.payload.status === TxStatus.DENIED
          ) {
            subscriber.complete();
            this.hostWindow.removeEventListener('message', callback);
          }
        };

        this.hostWindow.addEventListener('message', callback);

        return () => {
          this.hostWindow.removeEventListener('message', callback);
        };
      },
    );
  };

  states = () => {
    return this._clientStates.asObservable();
  };

  destroy = () => {
    this.hostWindow.removeEventListener('message', this.onMessage);
  };

  private onMessage = (event: MessageEvent) => {
    if (!isExtensionMessage(event.data)) {
      return;
    }

    switch (event.data.type) {
      case FromContentScriptToWebMessage.CLIENT_STATES_UPDATED:
        this._clientStates.next(event.data.payload);

        if (this._status.getValue() !== ClientStatus.READY) {
          this._status.next(ClientStatus.READY);
        }
        break;
    }
  };
}
