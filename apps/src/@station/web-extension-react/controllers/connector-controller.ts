import {
  TerraWebExtensionConnector,
  WebExtensionPostPayload,
  WebExtensionSignPayload,
  WebExtensionStates,
  WebExtensionStatus,
  WebExtensionStatusType,
  WebExtensionTxResult,
} from '@terra-dev/web-extension-interface';
import { CreateTxOptions } from '@terra-money/terra.js';
import bowser from 'bowser';
import { BehaviorSubject, Subscribable } from 'rxjs';

declare global {
  interface Window {
    terraWallets:
      | Array<{
          name: string;
          identifier: string;
          connector: () => Promise<TerraWebExtensionConnector>;
          icon: string;
        }>
      | undefined;
  }
}

async function getConnector(
  hostWindow: Window,
): Promise<(() => Promise<TerraWebExtensionConnector>) | undefined> {
  return new Promise((resolve) => {
    let count = 20;

    function task() {
      if (--count > 0) {
        if (
          typeof hostWindow.terraWallets !== 'undefined' &&
          Array.isArray(hostWindow.terraWallets) &&
          hostWindow.terraWallets.length > 0
        ) {
          console.log(`TerraWalletConnector: `, hostWindow.terraWallets[0]);
          resolve(hostWindow.terraWallets[0].connector);
        } else {
          console.warn(`Can't find window.terraWallets. wait 500ms...`);
          setTimeout(task, 500);
        }
      } else {
        resolve(undefined);
      }
    }

    task();
  });
}

export class WebExtensionConnectorController {
  private readonly _status: BehaviorSubject<WebExtensionStatus>;
  private readonly _states: BehaviorSubject<WebExtensionStates | null>;
  private _connector: TerraWebExtensionConnector | null = null;

  constructor(private hostWindow: Window) {
    this._status = new BehaviorSubject<WebExtensionStatus>({
      type: WebExtensionStatusType.INITIALIZING,
    });

    this._states = new BehaviorSubject<WebExtensionStates | null>(null);

    const browser = bowser.getParser(navigator.userAgent);

    //@ts-ignore
    getConnector(hostWindow).then((factory) => {
      if (!factory) {
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
          isConnectorExists: false,
          installLink,
        });

        return;
      }

      factory().then((connector) => {
        if (!connector.checkBrowserAvailability(navigator.userAgent)) {
          this._status.next({
            type: WebExtensionStatusType.NO_AVAILABLE,
            isConnectorExists: true,
            isSupportBrowser: false,
          });

          connector.close();

          return;
        }

        connector.open(hostWindow, this._status, this._states);

        this._connector = connector;
      });
    });
  }

  refetchStates = () => {
    this._connector?.refetchStates();
  };

  requestApproval = () => {
    this._connector?.requestApproval();
  };

  status = () => {
    return this._status.asObservable();
  };

  getLastStatus = () => {
    return this._status.getValue();
  };

  post = (
    terraAddress: string,
    tx: CreateTxOptions,
  ): Subscribable<WebExtensionTxResult<WebExtensionPostPayload>> => {
    return this._connector!.post(terraAddress, tx);
  };

  sign = (
    terraAddress: string,
    tx: CreateTxOptions,
  ): Subscribable<WebExtensionTxResult<WebExtensionSignPayload>> => {
    return this._connector!.sign(terraAddress, tx);
  };

  hasCW20Tokens = (chainID: string, ...tokenAddrs: string[]) => {
    return this._connector!.hasCW20Tokens(chainID, ...tokenAddrs);
  };

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

  states = () => {
    return this._states.asObservable();
  };

  getLastStates = () => {
    return this._states.getValue();
  };

  destroy = () => {
    this._connector?.close();
    this._connector = null;
  };
}
