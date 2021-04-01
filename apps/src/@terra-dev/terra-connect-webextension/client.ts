import {
  ClientStates,
  ClientStatus,
  ExecuteParams,
  Message,
  Status,
  TerraConnectClient,
} from '@terra-dev/terra-connect';
import {
  serializeTx,
  TxDenied,
  TxFail,
  TxProgress,
  TxStatus,
  TxSucceed,
} from '@terra-dev/tx';
import { getParser } from 'bowser';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import {
  ExecuteExtensionTx,
  FromContentScriptToWebMessage,
  FromWebToContentScriptMessage,
  isWebExtensionMessage,
  RefetchExtensionClientStates,
} from './internal/messages';

export class TerraConnectWebExtensionClient implements TerraConnectClient {
  private _status: BehaviorSubject<Status>;
  private _message: Subject<Message<unknown>>;
  private _clientStates: BehaviorSubject<ClientStates | null>;

  constructor(private hostWindow: Window) {
    this._status = new BehaviorSubject<Status>({
      type: ClientStatus.INITIALIZING,
    });
    this._message = new Subject<Message<unknown>>();
    this._clientStates = new BehaviorSubject<ClientStates | null>(null);

    const meta = document.querySelector('head > meta[name="terra-connect"]');

    if (!meta) {
      return;
    }

    const browser = getParser(navigator.userAgent);

    const isSupportBrowser = browser.satisfies({
      desktop: {
        chrome: '>70',
        edge: '>80',
        firefox: '>80',
        safari: '>=14',
      },
    });

    if (!isSupportBrowser) {
      this._status.next({
        type: ClientStatus.NO_AVAILABLE,
        isSupportBrowser: false,
        isInstalled: false,
      });
      return;
    }

    hostWindow.addEventListener('message', this.onMessage);

    this.refetchClientStates();

    setTimeout(() => {
      if (this._status.getValue().type === ClientStatus.INITIALIZING) {
        const name = browser.getBrowserName(true);

        let installLink: string;

        switch (name) {
          case 'chrome':
          case 'microsoft edge':
            installLink = 'https://google.com/chrome';
            break;
          case 'firefox':
            installLink = 'https://google.com/firefox';
            break;
          case 'safari':
            installLink = 'https://google.com/safari';
            break;
          default:
            installLink = 'https://google.com/chrome';
            break;
        }

        this._status.next({
          type: ClientStatus.NO_AVAILABLE,
          isSupportBrowser: true,
          isInstalled: false,
          installLink,
        });
      }
    }, 5000);
  }

  refetchClientStates = () => {
    const msg: RefetchExtensionClientStates = {
      type: FromWebToContentScriptMessage.REFETCH_CLIENT_STATES,
    };

    this.hostWindow.postMessage(msg, '*');
  };

  status = () => {
    return this._status.asObservable();
  };

  message = () => {
    return this._message.asObservable();
  };

  execute = ({ terraAddress, network, tx }: ExecuteParams) => {
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
            !isWebExtensionMessage(event.data) ||
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

  clientStates = () => {
    return this._clientStates.asObservable();
  };

  destroy = () => {
    this.hostWindow.removeEventListener('message', this.onMessage);
  };

  private onMessage = (event: MessageEvent) => {
    if (!isWebExtensionMessage(event.data)) {
      return;
    }

    switch (event.data.type) {
      case FromContentScriptToWebMessage.CLIENT_STATES_UPDATED:
        if (this._status.getValue().type !== ClientStatus.READY) {
          this._status.next({
            type: ClientStatus.READY,
          });
        }
        this._clientStates.next(event.data.payload);
        break;
    }
  };
}
