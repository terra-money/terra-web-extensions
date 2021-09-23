import { AccAddress } from '@terra-money/terra.js';
import bowser from 'bowser';
import { BehaviorSubject, Observable } from 'rxjs';
import { createTxErrorFromJson, WebExtensionUserDenied } from './errors';
import {
  AddCW20Tokens,
  ExecuteExtensionTx,
  FromContentScriptToWebMessage,
  FromWebToContentScriptMessage,
  HasCW20Tokens,
  isWebExtensionMessage,
  PostParams,
  RefetchExtensionStates,
  RequestApproval,
  serializeTx,
  WebExtensionStates,
  WebExtensionStatus,
  WebExtensionStatusType,
  WebExtensionTxProgress,
  WebExtensionTxStatus,
  WebExtensionTxSucceed,
} from './models';

export function canRequestApproval(status: WebExtensionStatus): boolean {
  return (
    status.type === WebExtensionStatusType.NO_AVAILABLE &&
    status.isApproved === false
  );
}

export class WebExtensionController {
  private _status: BehaviorSubject<WebExtensionStatus>;
  private _states: BehaviorSubject<WebExtensionStates | null>;

  constructor(private hostWindow: Window) {
    this._status = new BehaviorSubject<WebExtensionStatus>({
      type: WebExtensionStatusType.INITIALIZING,
    });
    this._states = new BehaviorSubject<WebExtensionStates | null>(null);

    const meta = document.querySelector(
      'head > meta[name="terra-webextension"]',
    );

    if (!meta) {
      this._status.next({
        type: WebExtensionStatusType.NO_AVAILABLE,
        isMetaExists: false,
      });
      return;
    }

    const browser = bowser.getParser(navigator.userAgent);

    const isSupportBrowser = browser.satisfies({
      desktop: {
        chrome: '>70',
        edge: '>80',
        // TODO temporary disable before publish extensions
        firefox: '>80',
        safari: '>=14',
      },
    });

    if (!isSupportBrowser) {
      this._status.next({
        type: WebExtensionStatusType.NO_AVAILABLE,
        isMetaExists: true,
        isSupportBrowser: false,
      });
      return;
    }

    hostWindow.addEventListener('message', this.onMessage);

    this.refetchStates();

    // TODO improve first status check
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
          isMetaExists: true,
          isSupportBrowser: true,
          isInstalled: false,
          installLink,
        });
      }
    }, 2000);

    // TODO refetchStates() on visibilitychange event
  }

  /**
   * Refetch the clientsStates
   *
   * You don't need call this method in most cases.
   * Normally, when the clientStates is changed, states() get the new clientStates.
   *
   * @example
   * client.states()
   *       .subscribe(states => {
   *         // 2. will get new clientStates
   *         console.log('Got new states', Date.now())
   *       })
   *
   * function callback() {
   *   // 1. refetch client states
   *   client.refetchStates()
   * }
   */
  refetchStates = () => {
    const msg: RefetchExtensionStates = {
      type: FromWebToContentScriptMessage.REFETCH_STATES,
    };

    this.hostWindow.postMessage(msg, '*');
  };

  /**
   * Request approval connection to the Extension. (Connect)
   */
  requestApproval = () => {
    const currentStatus = this._status.getValue();
    if (canRequestApproval(currentStatus)) {
      const msg: RequestApproval = {
        type: FromWebToContentScriptMessage.REQUEST_APPROVAL,
      };

      this.hostWindow.postMessage(msg, '*');
    } else {
      console.warn(
        `requestApproval() is ignored. do not call at this status is "${JSON.stringify(
          currentStatus,
        )}"`,
      );
    }
  };

  status = () => {
    return this._status.asObservable();
  };

  getLastStatus = () => {
    return this._status.getValue();
  };

  /**
   * Execute transaction
   *
   * @example
   * client.post({ terraAddress, tx: CreateTxOptions })
   *       .subscribe({
   *          next: (result: WebExtensionTxProgress | WebExtensionTxSucceed) => {
   *            switch (result.status) {
   *              case WebExtensionTxStatus.PROGRESS:
   *                console.log('in progress', result.payload)
   *                break;
   *              case WebExtensionTxStatus.SUCCEED:
   *                console.log('succeed', result.payload)
   *                break;
   *            }
   *          },
   *          error: (error) => {
   *            if (error instanceof WebExtensionUserDenied) {
   *              console.log('user denied')
   *            } else if (error instanceof WebExtensionCreateTxFailed) {
   *              console.log('create tx failed', error.message)
   *            } else if (error instanceof WebExtensionTxFailed) {
   *              console.log('tx failed', error.txhash, error.message, error.raw_message)
   *            } else {
   *              console.log('unspecified error', 'message' in error ? error.message : String(error))
   *            }
   *          }
   *       })
   *
   * @description The stream will be
   * TxProgress -> [...TxProgress] -> TxSucceed
   *
   * - Tx is Succeed : TxProgress -> [...TxProgress] -> TxSucceed
   */
  post = ({ terraAddress, tx }: PostParams) => {
    return new Observable<WebExtensionTxProgress | WebExtensionTxSucceed>(
      (subscriber) => {
        subscriber.next({
          status: WebExtensionTxStatus.PROGRESS,
        });

        const id = Date.now();

        const msg: ExecuteExtensionTx = {
          type: FromWebToContentScriptMessage.EXECUTE_TX,
          id,
          terraAddress,
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

          if (event.data.payload.status === WebExtensionTxStatus.PROGRESS) {
            subscriber.next(event.data.payload);
          } else if (
            event.data.payload.status === WebExtensionTxStatus.DENIED ||
            event.data.payload.status === WebExtensionTxStatus.FAIL ||
            event.data.payload.status === WebExtensionTxStatus.SUCCEED
          ) {
            switch (event.data.payload.status) {
              case WebExtensionTxStatus.DENIED:
                subscriber.error(new WebExtensionUserDenied());
                break;
              case WebExtensionTxStatus.FAIL:
                subscriber.error(
                  event.data.payload.error instanceof Error
                    ? event.data.payload.error
                    : createTxErrorFromJson(event.data.payload.error),
                );
                break;
              case WebExtensionTxStatus.SUCCEED:
                subscriber.next(event.data.payload);
                subscriber.complete();
                break;
            }

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

  /**
   * Add CW20 Token to extension dashboard
   */
  addCW20Tokens = (chainID: string, ...tokenAddrs: string[]) => {
    if (!tokenAddrs.every((tokenAddr) => AccAddress.validate(tokenAddr))) {
      console.error(
        `There is invalid CW20 token address "${tokenAddrs.join(', ')}"`,
      );
    }

    const id = Date.now();

    const msg: AddCW20Tokens = {
      type: FromWebToContentScriptMessage.ADD_CW20_TOKENS,
      id,
      chainID,
      tokenAddrs,
    };

    this.hostWindow.postMessage(msg, '*');

    return new Promise<{ [tokenAddr: string]: boolean }>((resolve) => {
      const callback = (event: MessageEvent) => {
        if (
          !isWebExtensionMessage(event.data) ||
          event.data.type !==
            FromContentScriptToWebMessage.ADD_CW20_TOKENS_RESPONSE ||
          event.data.id !== id
        ) {
          return;
        }

        resolve(event.data.payload);

        this.hostWindow.removeEventListener('message', callback);
      };

      this.hostWindow.addEventListener('message', callback);

      return () => {
        this.hostWindow.removeEventListener('message', callback);
      };
    });
  };

  hasCW20Tokens = (chainID: string, ...tokenAddrs: string[]) => {
    if (!tokenAddrs.every((tokenAddr) => AccAddress.validate(tokenAddr))) {
      console.error(
        `There is invalid CW20 token address "${tokenAddrs.join(', ')}"`,
      );
    }

    const id = Date.now();

    const msg: HasCW20Tokens = {
      type: FromWebToContentScriptMessage.HAS_CW20_TOKENS,
      id,
      chainID,
      tokenAddrs,
    };

    this.hostWindow.postMessage(msg, '*');

    return new Promise<{ [tokenAddr: string]: boolean }>((resolve) => {
      const callback = (event: MessageEvent) => {
        if (
          !isWebExtensionMessage(event.data) ||
          event.data.type !==
            FromContentScriptToWebMessage.HAS_CW20_TOKENS_RESPONSE ||
          event.data.id !== id
        ) {
          return;
        }

        resolve(event.data.payload);

        this.hostWindow.removeEventListener('message', callback);
      };

      this.hostWindow.addEventListener('message', callback);

      return () => {
        this.hostWindow.removeEventListener('message', callback);
      };
    });
  };

  /**
   * @example
   * client.states()
   *       .subscribe(states => {
   *         if (!states) {
   *           console.log('client is still not ready')
   *         } else {
   *           console.log('current network is', states.network)
   *           console.log('current wallets are', states.wallets)
   *         }
   *       })
   */
  states = () => {
    return this._states.asObservable();
  };

  getLastStates = () => {
    return this._states.getValue();
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
      case FromContentScriptToWebMessage.STATES_UPDATED:
        const currentStatus = this._status.getValue();
        const { isApproved, ...nextStates } = event.data.payload;

        if (isApproved) {
          if (currentStatus.type !== WebExtensionStatusType.READY) {
            this._status.next({
              type: WebExtensionStatusType.READY,
            });
          }
        } else {
          if (currentStatus.type !== WebExtensionStatusType.NO_AVAILABLE) {
            this._status.next({
              type: WebExtensionStatusType.NO_AVAILABLE,
              isMetaExists: true,
              isSupportBrowser: true,
              isInstalled: true,
              isApproved: false,
            });
          }
        }

        this._states.next(nextStates);
        break;
    }
  };
}
