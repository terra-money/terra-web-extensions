import {
  TerraWebConnector,
  WebConnectorPostPayload,
  WebConnectorSignPayload,
  WebConnectorStates,
  WebConnectorStatus,
  WebConnectorStatusType,
  WebConnectorTxResult,
} from '@terra-dev/web-connector-interface';
import { CreateTxOptions } from '@terra-money/terra.js';
import bowser from 'bowser';
import { BehaviorSubject, Observable } from 'rxjs';

async function getConnector(hostWindow: {
  terraWebConnectors: TerraWebConnector[] | undefined;
}): Promise<TerraWebConnector | undefined> {
  return new Promise((resolve) => {
    let count = 20;

    function task() {
      if (--count > 0) {
        if (
          typeof hostWindow.terraWebConnectors !== 'undefined' &&
          Array.isArray(hostWindow.terraWebConnectors) &&
          hostWindow.terraWebConnectors.length > 0
        ) {
          console.log(
            `TerraWebConnector: `,
            JSON.stringify(hostWindow.terraWebConnectors[0].getInfo()),
          );
          resolve(hostWindow.terraWebConnectors[0]);
        } else {
          console.warn(`Can't find window.terraWebConnectors. wait 500ms...`);
          setTimeout(task, 500);
        }
      } else {
        resolve(undefined);
      }
    }

    task();
  });
}

export class WebConnectorController {
  private readonly _status: BehaviorSubject<WebConnectorStatus>;
  private readonly _states: BehaviorSubject<WebConnectorStates | null>;
  private _connector: TerraWebConnector | null = null;

  constructor(private hostWindow: Window) {
    this._status = new BehaviorSubject<WebConnectorStatus>({
      type: WebConnectorStatusType.INITIALIZING,
    });

    this._states = new BehaviorSubject<WebConnectorStates | null>(null);

    const browser = bowser.getParser(navigator.userAgent);

    //@ts-ignore
    getConnector(hostWindow).then((connector) => {
      if (!connector) {
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
          type: WebConnectorStatusType.NO_AVAILABLE,
          isConnectorExists: false,
          installLink,
        });

        return;
      }

      if (!connector.checkBrowserAvailability(navigator.userAgent)) {
        this._status.next({
          type: WebConnectorStatusType.NO_AVAILABLE,
          isConnectorExists: true,
          isSupportBrowser: false,
        });

        return;
      }

      connector.open(hostWindow, this._status, this._states);

      this._connector = connector;
    });
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
    this._connector?.refetchStates();
  };

  /**
   * Request approval connection to the Extension. (Connect)
   */
  requestApproval = () => {
    this._connector?.requestApproval();
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
   * client.post(terraAddress, tx: CreateTxOptions)
   *       .subscribe({
   *          next: (result: WebConnectorTxProgress | WebConnectorTxSucceed) => {
   *            switch (result.status) {
   *              case WebConnectorTxStatus.PROGRESS:
   *                console.log('in progress', result.payload)
   *                break;
   *              case WebConnectorTxStatus.SUCCEED:
   *                console.log('succeed', result.payload)
   *                break;
   *            }
   *          },
   *          error: (error) => {
   *            if (error instanceof WebConnectorUserDenied) {
   *              console.log('user denied')
   *            } else if (error instanceof WebConnectorCreateTxFailed) {
   *              console.log('create tx failed', error.message)
   *            } else if (error instanceof WebConnectorTxFailed) {
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
  post = (
    terraAddress: string,
    tx: CreateTxOptions,
  ): Observable<WebConnectorTxResult<WebConnectorPostPayload>> => {
    return this._connector!.post(terraAddress, tx);
  };

  sign = (
    terraAddress: string,
    tx: CreateTxOptions,
  ): Observable<WebConnectorTxResult<WebConnectorSignPayload>> => {
    return this._connector!.sign(terraAddress, tx);
  };

  hasCW20Tokens = (chainID: string, ...tokenAddrs: string[]) => {
    return this._connector!.hasCW20Tokens(chainID, ...tokenAddrs);
  };

  /**
   * Add CW20 Token to extension dashboard
   */
  addCW20Tokens = (chainID: string, ...tokenAddrs: string[]) => {
    return this._connector!.addCW20Tokens(chainID, ...tokenAddrs);
  };

  hasNetwork = (chainID: string, lcd: string) => {
    return this._connector!.hasNetwork({
      chainID,
      lcd,
    });
  };

  addNetwork = (name: string | undefined, chainID: string, lcd: string) => {
    return this._connector!.addNetwork({
      name: name ?? '',
      chainID,
      lcd,
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
    this._connector?.close();
    this._connector = null;
  };
}
