import {
  createTxErrorFromJson,
  serializeTx,
  TerraWebConnector,
  TerraWebConnectorInfo,
  WebConnectorStates,
  WebConnectorStatus,
  WebConnectorStatusType,
  WebConnectorTxProgress,
  WebConnectorTxResult,
  WebConnectorTxStatus,
  WebConnectorTxSucceed,
  WebConnectorUserDenied,
} from '@terra-dev/web-connector-interface';
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
  ExecuteExtensionTx,
  FromContentScriptToWebMessage,
  FromWebToContentScriptMessage,
  HasCW20Tokens,
  isWebExtensionMessage,
  RefetchExtensionStates,
  RequestApproval,
} from 'webextension/models/WebExtensionMessage';

function canRequestApproval(status: WebConnectorStatus): boolean {
  return (
    status.type === WebConnectorStatusType.NO_AVAILABLE &&
    status.isApproved === false
  );
}

const INFO = {
  name: 'Terra Station',
  url: 'https://google.com',
  icon: 'https://assets.terra.money/station.png',
};

class WebExtensionController implements TerraWebConnector {
  private _status: BehaviorSubject<WebConnectorStatus>;
  private _states: BehaviorSubject<WebConnectorStates | null>;
  private hostWindow: Window | null = null;
  private statusSubscription: Subscription | null = null;
  private statesSubscription: Subscription | null = null;

  constructor() {
    this._status = new BehaviorSubject<WebConnectorStatus>({
      type: WebConnectorStatusType.INITIALIZING,
    });

    this._states = new BehaviorSubject<WebConnectorStates | null>(null);
  }

  getInfo = (): TerraWebConnectorInfo => {
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
    statusObserver: Observer<WebConnectorStatus>,
    statesObserver: Observer<WebConnectorStates>,
  ) => {
    this.hostWindow = hostWindow;
    this.statusSubscription = this._status.subscribe(statusObserver);
    this.statesSubscription = this._states
      .pipe(
        filter(
          (state: WebConnectorStates | null): state is WebConnectorStates =>
            !!state,
        ),
      )
      .subscribe(statesObserver);

    hostWindow.addEventListener('message', this.onMessage);

    this.refetchStates();
  };

  close = () => {
    this.hostWindow?.removeEventListener('message', this.onMessage);
    this.statusSubscription?.unsubscribe();
    this.statesSubscription?.unsubscribe();

    this.hostWindow = null;
    this.statusSubscription = null;
    this.statesSubscription = null;
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
  ): Observable<WebConnectorTxResult> => {
    return new Observable<WebConnectorTxProgress | WebConnectorTxSucceed>(
      (subscriber) => {
        subscriber.next({
          status: WebConnectorTxStatus.PROGRESS,
        });

        const id = Date.now();

        const msg: ExecuteExtensionTx = {
          type: FromWebToContentScriptMessage.EXECUTE_TX,
          id,
          terraAddress,
          payload: serializeTx(tx),
        };

        this.hostWindow?.postMessage(msg, '*');

        const callback = (event: MessageEvent) => {
          if (
            !isWebExtensionMessage(event.data) ||
            event.data.type !== FromContentScriptToWebMessage.TX_RESPONSE ||
            event.data.id !== id
          ) {
            return;
          }

          if (event.data.payload.status === WebConnectorTxStatus.PROGRESS) {
            subscriber.next(event.data.payload);
          } else if (
            event.data.payload.status === WebConnectorTxStatus.DENIED ||
            event.data.payload.status === WebConnectorTxStatus.FAIL ||
            event.data.payload.status === WebConnectorTxStatus.SUCCEED
          ) {
            switch (event.data.payload.status) {
              case WebConnectorTxStatus.DENIED:
                subscriber.error(new WebConnectorUserDenied());
                break;
              case WebConnectorTxStatus.FAIL:
                subscriber.error(
                  event.data.payload.error instanceof Error
                    ? event.data.payload.error
                    : createTxErrorFromJson(event.data.payload.error),
                );
                break;
              case WebConnectorTxStatus.SUCCEED:
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

      return () => {
        this.hostWindow?.removeEventListener('message', callback);
      };
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
          if (currentStatus.type !== WebConnectorStatusType.READY) {
            this._status.next({
              type: WebConnectorStatusType.READY,
            });
          }
        } else {
          if (currentStatus.type !== WebConnectorStatusType.NO_AVAILABLE) {
            this._status.next({
              type: WebConnectorStatusType.NO_AVAILABLE,
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

const instance = new WebExtensionController();

//@ts-ignore
if (typeof window.terraWebConnectors === 'undefined') {
  //@ts-ignore
  window.terraWebConnectors = [instance];
} else {
  //@ts-ignore
  window.terraWebConnectors.push(instance);
}
