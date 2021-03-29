import { Network } from '@terra-dev/network';
import {
  ClientStates,
  ClientStatus,
  TerraConnectClient,
  Tx,
  TxResult,
} from '@terra-dev/terra-connect';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  ExtensionMessageType,
  isExtensionMessage,
  RefetchExtensionClientStates,
} from './internal';

export class TerraConnectWebExtensionClient implements TerraConnectClient {
  private _status: BehaviorSubject<ClientStatus>;
  private _network: BehaviorSubject<Network>;
  private _clientStates: BehaviorSubject<ClientStates | null>;

  constructor(private hostWindow: Window) {
    this._status = new BehaviorSubject<ClientStatus>(ClientStatus.INITIALIZING);
    this._clientStates = new BehaviorSubject<ClientStates | null>(null);
    this._network = new BehaviorSubject<Network>({
      name: 'testnet',
      chainID: 'tequila-004',
      servers: {
        lcd: 'https://lcd.terra.dev',
        fcd: 'https://fcd.terra.dev',
        ws: 'wss://fcd.terra.dev',
        mantle: 'https://mantle.terra.dev',
      },
    });

    const meta = document.querySelector('head > meta[name="terra-connect"]');

    if (!meta) {
      this._status.next(ClientStatus.NO_AVAILABLE);
      return;
    }

    hostWindow.addEventListener('message', this.onMessage);
  }

  refetch = () => {
    const msg: RefetchExtensionClientStates = {
      type: ExtensionMessageType.REFETCH_CLIENT_STATES,
    };
    window.postMessage(msg);
  };

  status = () => {
    return this._status.asObservable();
  };

  network = () => {
    return this._network.asObservable();
  };

  execute = (tx: Tx) => {
    console.log('index.ts..execute()', tx);
    return new Observable<TxResult>((subscriber) => {
      // TODO
    });
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
      case ExtensionMessageType.CLIENT_STATES_UPDATED:
        this._clientStates.next(event.data.payload);
        break;
    }
  };
}
