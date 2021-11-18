import {
  createTxErrorFromJson,
  serializeTx,
  TerraWalletConnector,
  TerraWalletConnectorInfo,
  WalletNetworkInfo,
  WalletPostPayload,
  WalletSignPayload,
  WalletStates,
  WalletStatus,
  WalletStatusType,
  WalletTxProgress,
  WalletTxResult,
  WalletTxStatus,
  WalletTxSucceed,
  WalletUserDenied,
} from '@terra-dev/wallet-interface';
import { AccAddress, CreateTxOptions } from '@terra-money/terra.js';
import bowser from 'bowser';
import {
  BehaviorSubject,
  filter,
  Observable,
  Observer,
  Subscription,
} from 'rxjs';
import {
  AddCW20Tokens,
  AddNetwork,
  ExecuteExtensionPost,
  ExecuteExtensionSign,
  FromContentScriptToWebMessage,
  FromWebToContentScriptMessage,
  HasCW20Tokens,
  HasNetwork,
  isWebExtensionMessage,
  RefetchExtensionStates,
  RequestApproval,
} from '../../models/WebExtensionMessage';

function canRequestApproval(status: WalletStatus): boolean {
  return (
    status.type === WalletStatusType.NO_AVAILABLE && status.isApproved === false
  );
}

const INFO = {
  name: 'Terra Station',
  url: 'https://google.com',
  icon: 'https://assets.terra.money/station.png',
};

class WebExtensionController implements TerraWalletConnector {
  private _status: BehaviorSubject<WalletStatus>;
  private _states: BehaviorSubject<WalletStates | null>;
  private hostWindow: Window | null = null;
  private statusSubscription: Subscription | null = null;
  private statesSubscription: Subscription | null = null;

  constructor() {
    this._status = new BehaviorSubject<WalletStatus>({
      type: WalletStatusType.INITIALIZING,
    });

    this._states = new BehaviorSubject<WalletStates | null>(null);
  }

  getInfo = (): TerraWalletConnectorInfo => {
    return INFO;
  };

  checkBrowserAvailability = (userAgent: string): boolean => {
    const browser = bowser.getParser(userAgent);

    const isSupportBrowser = browser.satisfies({
      desktop: {
        chrome: '>70',
        edge: '>80',
        // TODO temporary disable before publish extensions
        firefox: '>80',
        safari: '>=14',
      },
    });

    return isSupportBrowser === true;
  };

  open = (
    hostWindow: Window,
    statusObserver: Observer<WalletStatus>,
    statesObserver: Observer<WalletStates>,
  ) => {
    this.hostWindow = hostWindow;
    this.statusSubscription = this._status.subscribe(statusObserver);
    this.statesSubscription = this._states
      .pipe(
        filter((state: WalletStates | null): state is WalletStates => !!state),
      )
      .subscribe(statesObserver);

    hostWindow.addEventListener('message', this.onMessage);

    this.refetchStates();
  };

  close = () => {
    this.hostWindow?.removeEventListener('message', this.onMessage);
    this.statusSubscription?.unsubscribe();
    this.statesSubscription?.unsubscribe();
  };

  refetchStates = () => {
    const msg: RefetchExtensionStates = {
      type: FromWebToContentScriptMessage.REFETCH_STATES,
    };

    this.hostWindow?.postMessage(msg, '*');
  };

  requestApproval = () => {
    const currentStatus = this._status.getValue();

    if (canRequestApproval(currentStatus)) {
      const msg: RequestApproval = {
        type: FromWebToContentScriptMessage.REQUEST_APPROVAL,
      };

      this.hostWindow?.postMessage(msg, '*');
    } else {
      console.warn(
        `requestApproval() is ignored. do not call at this status is "${JSON.stringify(
          currentStatus,
        )}"`,
      );
    }
  };

  post = (
    terraAddress: string,
    tx: CreateTxOptions,
  ): Observable<WalletTxResult<WalletPostPayload>> => {
    return new Observable<
      WalletTxProgress | WalletTxSucceed<WalletPostPayload>
    >((subscriber) => {
      subscriber.next({
        status: WalletTxStatus.PROGRESS,
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

        if (event.data.payload.status === WalletTxStatus.PROGRESS) {
          subscriber.next(event.data.payload);
        } else if (
          event.data.payload.status === WalletTxStatus.DENIED ||
          event.data.payload.status === WalletTxStatus.FAIL ||
          event.data.payload.status === WalletTxStatus.SUCCEED
        ) {
          switch (event.data.payload.status) {
            case WalletTxStatus.DENIED:
              subscriber.error(new WalletUserDenied());
              break;
            case WalletTxStatus.FAIL:
              subscriber.error(
                event.data.payload.error instanceof Error
                  ? event.data.payload.error
                  : createTxErrorFromJson(event.data.payload.error),
              );
              break;
            case WalletTxStatus.SUCCEED:
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
  ): Observable<WalletTxResult<WalletSignPayload>> => {
    return new Observable<WalletTxResult<WalletSignPayload>>((subscriber) => {
      subscriber.next({
        status: WalletTxStatus.PROGRESS,
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

        if (event.data.payload.status === WalletTxStatus.PROGRESS) {
          subscriber.next(event.data.payload);
        } else if (
          event.data.payload.status === WalletTxStatus.DENIED ||
          event.data.payload.status === WalletTxStatus.FAIL ||
          event.data.payload.status === WalletTxStatus.SUCCEED
        ) {
          switch (event.data.payload.status) {
            case WalletTxStatus.DENIED:
              subscriber.error(new WalletUserDenied());
              break;
            case WalletTxStatus.FAIL:
              subscriber.error(
                event.data.payload.error instanceof Error
                  ? event.data.payload.error
                  : createTxErrorFromJson(event.data.payload.error),
              );
              break;
            case WalletTxStatus.SUCCEED:
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

  hasNetwork = (network: Omit<WalletNetworkInfo, 'name'>): Promise<boolean> => {
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

  addNetwork = (network: WalletNetworkInfo): Promise<boolean> => {
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
        const currentStatus = this._status.getValue();
        const { isApproved, ...nextStates } = event.data.payload;

        if (isApproved) {
          if (currentStatus.type !== WalletStatusType.READY) {
            this._status.next({
              type: WalletStatusType.READY,
            });
          }
        } else {
          if (currentStatus.type !== WalletStatusType.NO_AVAILABLE) {
            this._status.next({
              type: WalletStatusType.NO_AVAILABLE,
              isConnectorExists: true,
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

declare global {
  interface Window {
    terraWallets:
      | Array<{
          name: string;
          identifier: string;
          connector: () => TerraWalletConnector;
          icon: string;
        }>
      | undefined;
  }
}

const WALLET_INFO = {
  name: 'Terra Station',
  identifier: 'terra-station',
  connector: () => new WebExtensionController(),
  icon: '',
};

if (typeof window.terraWallets === 'undefined') {
  window.terraWallets = [WALLET_INFO];
} else {
  window.terraWallets.push(WALLET_INFO);
}
