import { getParser } from 'bowser';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  ExecuteExtensionTx,
  FromContentScriptToWebMessage,
  FromWebToContentScriptMessage,
  isWebExtensionMessage,
  RefetchExtensionClientStates,
} from './internal/webapp-contentScripts-messages';
import {
  PostParams,
  serializeTx,
  WebExtensionStates,
  WebExtensionStatus,
  WebExtensionStatusType,
  WebExtensionTxResult,
  WebExtensionTxStatus,
} from './models';

export class WebExtensionController {
  private _status: BehaviorSubject<WebExtensionStatus>;
  private _clientStates: BehaviorSubject<WebExtensionStates | null>;

  constructor(private hostWindow: Window) {
    this._status = new BehaviorSubject<WebExtensionStatus>({
      type: WebExtensionStatusType.INITIALIZING,
    });
    this._clientStates = new BehaviorSubject<WebExtensionStates | null>(null);

    const meta = document.querySelector(
      'head > meta[name="terra-webextension"]',
    );

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
        type: WebExtensionStatusType.NO_AVAILABLE,
        isSupportBrowser: false,
        isInstalled: false,
      });
      return;
    }

    hostWindow.addEventListener('message', this.onMessage);

    this.refetchClientStates();

    setTimeout(() => {
      if (
        this._status.getValue().type === WebExtensionStatusType.INITIALIZING
      ) {
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
          type: WebExtensionStatusType.NO_AVAILABLE,
          isSupportBrowser: true,
          isInstalled: false,
          installLink,
        });
      }
    }, 2000);
  }

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
  refetchClientStates = () => {
    const msg: RefetchExtensionClientStates = {
      type: FromWebToContentScriptMessage.REFETCH_CLIENT_STATES,
    };

    this.hostWindow.postMessage(msg, '*');
  };

  status = () => {
    return this._status.asObservable();
  };

  /**
   * Execute transaction
   *
   * @example
   * client.post({ terraAddress, network, tx: CreateTxOptions })
   *       .subscribe((result: TxResult) => {
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
  post = ({ terraAddress, network, tx }: PostParams) => {
    return new Observable<WebExtensionTxResult>((subscriber) => {
      subscriber.next({
        status: WebExtensionTxStatus.PROGRESS,
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
          event.data.payload.status === WebExtensionTxStatus.SUCCEED ||
          event.data.payload.status === WebExtensionTxStatus.FAIL ||
          event.data.payload.status === WebExtensionTxStatus.DENIED
        ) {
          subscriber.complete();
          this.hostWindow.removeEventListener('message', callback);
        }
      };

      this.hostWindow.addEventListener('message', callback);

      return () => {
        this.hostWindow.removeEventListener('message', callback);
      };
    });
  };

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
  clientStates = () => {
    return this._clientStates.asObservable();
  };

  /**
   * Destroy this client
   *
   * - Unsubscribe all RxJs Subjects (every Observables are stoped)
   */
  destroy = () => {
    this.hostWindow.removeEventListener('message', this.onMessage);
  };

  private onMessage = (event: MessageEvent) => {
    if (!isWebExtensionMessage(event.data)) {
      return;
    }

    switch (event.data.type) {
      case FromContentScriptToWebMessage.CLIENT_STATES_UPDATED:
        if (this._status.getValue().type !== WebExtensionStatusType.READY) {
          this._status.next({
            type: WebExtensionStatusType.READY,
          });
        }
        this._clientStates.next(event.data.payload);
        break;
    }
  };
}
