import {
  TerraWebExtensionConnector,
  WebExtensionPostPayload,
  WebExtensionSignBytesPayload,
  WebExtensionSignPayload,
  WebExtensionStates,
  WebExtensionStatus,
  WebExtensionTxResult,
} from '@terra-dev/web-extension-interface';
import { CreateTxOptions } from '@terra-money/terra.js';
import { BehaviorSubject, Subscribable } from 'rxjs';

declare global {
  interface Window {
    terraWallets:
      | Array<{
          name: string;
          identifier: string;
          connector: () =>
            | TerraWebExtensionConnector
            | Promise<TerraWebExtensionConnector>;
          icon: string;
        }>
      | undefined;
  }
}

async function getConnector(
  hostWindow: Window,
): Promise<
  | (() => TerraWebExtensionConnector | Promise<TerraWebExtensionConnector>)
  | undefined
> {
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
  private readonly _states: BehaviorSubject<WebExtensionStates>;
  private _connector: TerraWebExtensionConnector | null = null;

  constructor(private hostWindow: Window) {
    this._states = new BehaviorSubject<WebExtensionStates>({
      type: WebExtensionStatus.INITIALIZING,
    });

    //@ts-ignore
    getConnector(hostWindow).then((factory) => {
      if (!factory) {
        this._states.next({
          type: WebExtensionStatus.NO_AVAILABLE,
          isConnectorExists: false,
        });

        return;
      }

      Promise.resolve(factory()).then((connector) => {
        connector.open(hostWindow, this._states);
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

  signBytes = (
    terraAddress: string,
    bytes: Buffer,
  ): Subscribable<WebExtensionTxResult<WebExtensionSignBytesPayload>> => {
    return this._connector!.signBytes(terraAddress, bytes);
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
