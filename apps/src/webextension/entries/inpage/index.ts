import {
  createTxErrorFromJson,
  serializeTx,
  TerraWebExtensionConnector,
  TerraWebExtensionFeatures,
  WebExtensionNetworkInfo,
  WebExtensionPostPayload,
  WebExtensionSignBytesPayload,
  WebExtensionSignPayload,
  WebExtensionStates,
  WebExtensionStatus,
  WebExtensionTxProgress,
  WebExtensionTxResult,
  WebExtensionTxStatus,
  WebExtensionTxSucceed,
  WebExtensionUserDenied,
} from '@terra-dev/web-extension-interface';
import { AccAddress, CreateTxOptions } from '@terra-money/terra.js';
import {
  BehaviorSubject,
  filter,
  Observable,
  Observer,
  Subscribable,
  Subscription,
} from 'rxjs';
import {
  AddCW20Tokens,
  AddNetwork,
  ExecuteExtensionPost,
  ExecuteExtensionSign,
  ExecuteExtensionSignBytes,
  FromContentScriptToWebMessage,
  FromWebToContentScriptMessage,
  HasCW20Tokens,
  HasNetwork,
  isWebExtensionMessage,
  RefetchExtensionStates,
  RequestApproval,
} from '../../models/WebExtensionMessage';

function canRequestApproval(states: WebExtensionStates): boolean {
  return (
    states.type === WebExtensionStatus.NO_AVAILABLE &&
    states.isApproved === false
  );
}

const supportFeatures: TerraWebExtensionFeatures[] = [
  'post',
  'sign',
  'cw20-token',
  'network',
];

class TerraStationConnector implements TerraWebExtensionConnector {
  private _states: BehaviorSubject<WebExtensionStates>;
  private hostWindow: Window | null = null;
  private statesSubscription: Subscription | null = null;

  supportFeatures() {
    return supportFeatures;
  }

  constructor() {
    this._states = new BehaviorSubject<WebExtensionStates>({
      type: WebExtensionStatus.INITIALIZING,
    });
  }

  open = (hostWindow: Window, statesObserver: Observer<WebExtensionStates>) => {
    this.hostWindow = hostWindow;
    this.statesSubscription = this._states.subscribe(statesObserver);

    hostWindow.addEventListener('message', this.onMessage);

    const init = this._states
      .pipe(filter(({ type }) => type !== WebExtensionStatus.INITIALIZING))
      .subscribe({
        next: (states) => {
          if (
            states.type === WebExtensionStatus.NO_AVAILABLE &&
            states.isApproved === false
          ) {
            this.requestApproval();
          }
          init.unsubscribe();
        },
      });

    this.refetchStates();
  };

  close = () => {
    this.hostWindow?.removeEventListener('message', this.onMessage);
    this.statesSubscription?.unsubscribe();
  };

  refetchStates = () => {
    const msg: RefetchExtensionStates = {
      type: FromWebToContentScriptMessage.REFETCH_STATES,
    };

    this.hostWindow?.postMessage(msg, '*');
  };

  requestApproval = () => {
    const currentStates = this._states.getValue();

    if (canRequestApproval(currentStates)) {
      const msg: RequestApproval = {
        type: FromWebToContentScriptMessage.REQUEST_APPROVAL,
      };

      this.hostWindow?.postMessage(msg, '*');
    } else {
      console.warn(
        `requestApproval() is ignored. do not call at this status is "${JSON.stringify(
          currentStates,
        )}"`,
      );
    }
  };

  post = (
    terraAddress: string,
    tx: CreateTxOptions,
  ): Subscribable<WebExtensionTxResult<WebExtensionPostPayload>> => {
    return new Observable<
      WebExtensionTxProgress | WebExtensionTxSucceed<WebExtensionPostPayload>
    >((subscriber) => {
      subscriber.next({
        status: WebExtensionTxStatus.PROGRESS,
      });

      const id = Date.now();

      const msg: ExecuteExtensionPost = {
        type: FromWebToContentScriptMessage.EXECUTE_POST,
        id,
        terraAddress,
        payload: serializeTx(tx),
      };

      this.hostWindow?.postMessage(msg, '*');

      const callback = (event: MessageEvent) => {
        if (
          !isWebExtensionMessage(event.data) ||
          event.data.type !== FromContentScriptToWebMessage.POST_RESPONSE ||
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

          this.hostWindow?.removeEventListener('message', callback);
        }
      };

      this.hostWindow?.addEventListener('message', callback);

      return () => {
        this.hostWindow?.removeEventListener('message', callback);
      };
    });
  };

  sign = (
    terraAddress: string,
    tx: CreateTxOptions,
  ): Subscribable<WebExtensionTxResult<WebExtensionSignPayload>> => {
    return new Observable<WebExtensionTxResult<WebExtensionSignPayload>>(
      (subscriber) => {
        subscriber.next({
          status: WebExtensionTxStatus.PROGRESS,
        });

        const id = Date.now();

        const msg: ExecuteExtensionSign = {
          type: FromWebToContentScriptMessage.EXECUTE_SIGN,
          id,
          terraAddress,
          payload: serializeTx(tx),
        };

        this.hostWindow?.postMessage(msg, '*');

        const callback = (event: MessageEvent) => {
          if (
            !isWebExtensionMessage(event.data) ||
            event.data.type !== FromContentScriptToWebMessage.SIGN_RESPONSE ||
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

            this.hostWindow?.removeEventListener('message', callback);
          }
        };

        this.hostWindow?.addEventListener('message', callback);

        return () => {
          this.hostWindow?.removeEventListener('message', callback);
        };
      },
    );
  };

  signBytes = (
    terraAddress: string,
    bytes: Buffer,
  ): Subscribable<WebExtensionTxResult<WebExtensionSignBytesPayload>> => {
    return new Observable<WebExtensionTxResult<WebExtensionSignBytesPayload>>(
      (subscriber) => {
        subscriber.next({
          status: WebExtensionTxStatus.PROGRESS,
        });

        const id = Date.now();

        const msg: ExecuteExtensionSignBytes = {
          type: FromWebToContentScriptMessage.EXECUTE_SIGN_BYTES,
          id,
          terraAddress,
          payload: bytes.toString('base64'),
        };

        this.hostWindow?.postMessage(msg, '*');

        const callback = (event: MessageEvent) => {
          if (
            !isWebExtensionMessage(event.data) ||
            event.data.type !==
              FromContentScriptToWebMessage.SIGN_BYTES_RESPONSE ||
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

            this.hostWindow?.removeEventListener('message', callback);
          }
        };

        this.hostWindow?.addEventListener('message', callback);

        return () => {
          this.hostWindow?.removeEventListener('message', callback);
        };
      },
    );
  };

  hasCW20Tokens = (
    chainID: string,
    ...tokenAddrs: string[]
  ): Promise<{ [tokenAddr: string]: boolean }> => {
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

    this.hostWindow?.postMessage(msg, '*');

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

        this.hostWindow?.removeEventListener('message', callback);
      };

      this.hostWindow?.addEventListener('message', callback);
    });
  };

  addCW20Tokens = (
    chainID: string,
    ...tokenAddrs: string[]
  ): Promise<{ [tokenAddr: string]: boolean }> => {
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

    this.hostWindow?.postMessage(msg, '*');

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

        this.hostWindow?.removeEventListener('message', callback);
      };

      this.hostWindow?.addEventListener('message', callback);
    });
  };

  hasNetwork = (
    network: Omit<WebExtensionNetworkInfo, 'name'>,
  ): Promise<boolean> => {
    const id = Date.now();

    const msg: HasNetwork = {
      type: FromWebToContentScriptMessage.HAS_NETWORK,
      id,
      ...network,
    };

    this.hostWindow?.postMessage(msg, '*');

    return new Promise<boolean>((resolve) => {
      const callback = (event: MessageEvent) => {
        if (
          !isWebExtensionMessage(event.data) ||
          event.data.type !==
            FromContentScriptToWebMessage.HAS_NETWORK_RESPONSE ||
          event.data.id !== id
        ) {
          return;
        }

        resolve(event.data.payload);

        this.hostWindow?.removeEventListener('message', callback);
      };

      this.hostWindow?.addEventListener('message', callback);
    });
  };

  addNetwork = (network: WebExtensionNetworkInfo): Promise<boolean> => {
    const id = Date.now();

    const msg: AddNetwork = {
      type: FromWebToContentScriptMessage.ADD_NETWORK,
      id,
      ...network,
    };

    this.hostWindow?.postMessage(msg, '*');

    return new Promise<boolean>((resolve) => {
      const callback = (event: MessageEvent) => {
        if (
          !isWebExtensionMessage(event.data) ||
          event.data.type !==
            FromContentScriptToWebMessage.ADD_NETWORK_RESPONSE ||
          event.data.id !== id
        ) {
          return;
        }

        resolve(event.data.payload);

        this.hostWindow?.removeEventListener('message', callback);
      };

      this.hostWindow?.addEventListener('message', callback);
    });
  };

  private onMessage = (event: MessageEvent) => {
    if (!isWebExtensionMessage(event.data)) {
      return;
    }

    switch (event.data.type) {
      case FromContentScriptToWebMessage.STATES_UPDATED:
        const currentStates = this._states.getValue();
        const { isApproved, ...nextStates } = event.data.payload;

        if (isApproved) {
          this._states.next({
            type: WebExtensionStatus.READY,
            ...nextStates,
          });
        } else if (currentStates.type !== WebExtensionStatus.NO_AVAILABLE) {
          this._states.next({
            type: WebExtensionStatus.NO_AVAILABLE,
            isConnectorExists: true,
            isApproved: false,
          });
        }
        break;
    }
  };
}

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

const WALLET_INFO = {
  name: 'Terra Station',
  identifier: 'terra-station',
  icon: 'https://assets.terra.money/icon/station-extension/icon.png',
  connector: () => new TerraStationConnector(),
};

window.isTerraExtensionAvailable = true;

if (typeof window.terraWallets === 'undefined') {
  window.terraWallets = [WALLET_INFO];
} else {
  window.terraWallets.push(WALLET_INFO);
}
