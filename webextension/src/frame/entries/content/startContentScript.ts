import {
  findSimilarNetwork,
  hasCW20Tokens,
  observeHostnamesStorage,
  observeNetworkStorage,
  observeWalletsStorage,
} from '@terra-dev/web-extension-backend';
import {
  SerializedCreateTxOptions,
  WebExtensionNetworkInfo,
  WebExtensionPostPayload,
  WebExtensionSignBytesPayload,
  WebExtensionSignPayload,
  WebExtensionTxResult,
  WebExtensionTxStatus,
  WebExtensionWalletInfo,
} from '@terra-dev/web-extension-interface';
//@ts-ignore
import LocalMessageDuplexStream from 'post-message-stream';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { browser } from 'webextension-polyfill-ts';
import { WHITELIST_HOSTNAMES } from 'frame/env';
import {
  ExtensionStates,
  FromContentScriptToWebMessage,
  FromWebToContentScriptMessage,
  isWebExtensionMessage,
  WebExtensionAddCW20TokenResponse,
  WebExtensionAddNetworkResponse,
  WebExtensionHasCW20TokensResponse,
  WebExtensionHasNetworkResponse,
  WebExtensionPostResponse,
  WebExtensionSignBytesResponse,
  WebExtensionSignResponse,
  WebExtensionStatesUpdated,
} from '../../models/WebExtensionMessage';
import { getDefaultNetworks } from '../../queries/useDefaultNetworks';

export interface ContentScriptOptions {
  startPost: (
    id: string,
    terraAddress: string,
    tx: SerializedCreateTxOptions,
  ) => Observable<WebExtensionTxResult<WebExtensionPostPayload>>;
  startSign: (
    id: string,
    terraAddress: string,
    tx: SerializedCreateTxOptions,
  ) => Observable<WebExtensionTxResult<WebExtensionSignPayload>>;
  startSignBytes: (
    id: string,
    terraAddress: string,
    bytes: Buffer,
  ) => Observable<WebExtensionTxResult<WebExtensionSignBytesPayload>>;
  startConnect: (id: string, hostname: string) => Promise<boolean>;
  startAddCW20Tokens: (
    id: string,
    chainID: string,
    ...tokenAddrs: string[]
  ) => Promise<{ [tokenAddr: string]: boolean }>;
  startAddNetwork: (
    id: string,
    network: WebExtensionNetworkInfo,
  ) => Promise<boolean>;
}

//const CONNECT_NAME = 'Terra Station';

export function startContentScript({
  startPost,
  startSign,
  startSignBytes,
  startConnect,
  startAddCW20Tokens,
  startAddNetwork,
}: ContentScriptOptions) {
  // ---------------------------------------------
  // only enable the site has <meta name="terra-wallet" legacy="terra.js">
  // ---------------------------------------------
  const meta = document.querySelector('head > meta[name="terra-wallet"]');
  if (!meta) return;

  // ---------------------------------------------
  // check dApp is legacy mode
  // ---------------------------------------------
  const legacy: Set<string> = new Set(
    meta.getAttribute('legacy')?.split(',') ?? [],
  );

  // ---------------------------------------------
  // set the attribute <meta name="terra-wallet" connected="Terra Station">
  // ---------------------------------------------
  // TODO move control this part to wallet-provider
  //meta.setAttribute('connected', CONNECT_NAME);

  // ---------------------------------------------
  // inject inpage scripts
  // TODO remove if every dapps migrated to newer api
  // ---------------------------------------------
  if (legacy.has('terra.js')) {
    const inpage = document.createElement('script');
    inpage.innerText = 'window.isTerraExtensionAvailable = true;';

    const head = document.querySelector('head');
    head?.appendChild(inpage);
  } else {
    const inpage = document.createElement('script');
    inpage.src = browser.runtime.getURL('inpage.js');

    const head = document.querySelector('head');
    head?.appendChild(inpage);
  }

  // ---------------------------------------------
  // states
  // ---------------------------------------------
  const extensionStateLastUpdated = new BehaviorSubject<number>(Date.now());

  // ---------------------------------------------
  // listen extension storage states
  // ---------------------------------------------
  type WalletsStates = {
    wallets: WebExtensionWalletInfo[];
    focusedWalletAddress: string | undefined;
    isApproved: boolean;
  };

  const walletsObservable: Observable<WalletsStates> = combineLatest([
    observeHostnamesStorage(),
    observeWalletsStorage(),
  ]).pipe(
    map(([{ approvedHostnames }, { wallets, focusedWalletAddress }]) => {
      const hostname: string = window.location.hostname;

      return approvedHostnames.includes(hostname) ||
        WHITELIST_HOSTNAMES.includes(hostname)
        ? {
            // remove sensitive information (e.g. encryptedWallet)
            wallets: wallets.map(({ name, terraAddress, design }) => ({
              name,
              terraAddress,
              design,
            })),
            focusedWalletAddress,
            isApproved: true,
          }
        : { wallets: [], focusedWalletAddress: undefined, isApproved: false };
    }),
  );

  const networkObservable = combineLatest([
    observeNetworkStorage(),
    getDefaultNetworks(),
  ]).pipe(
    map(
      ([{ selectedNetwork }, defaultNetworks]) =>
        selectedNetwork ?? defaultNetworks[0],
    ),
  );

  const extensionStates = combineLatest([
    extensionStateLastUpdated,
    walletsObservable,
    networkObservable,
  ]).pipe(
    map(([_, { wallets, focusedWalletAddress, isApproved }, network]) => {
      return {
        wallets,
        network,
        focusedWalletAddress,
        isApproved,
      } as ExtensionStates;
    }),
  );

  // ================================================================
  // legacy="terra.js"
  // legacy extension support
  // TODO remove if every dapps migrated to newer api
  // ================================================================
  if (legacy.has('terra.js')) {
    // ---------------------------------------------
    // listen web messages
    // ---------------------------------------------
    const pageStream = new LocalMessageDuplexStream({
      name: 'station:content',
      target: 'station:inpage',
    });

    let _states: ExtensionStates | null = null;
    let _statesResolvers: Set<(_: ExtensionStates) => void> = new Set();

    function resolveStates(callback: (_: ExtensionStates) => void) {
      if (_states) {
        callback(_states);
      } else {
        _statesResolvers.add(callback);
      }
    }

    function getFocusedWallet({
      wallets,
      focusedWalletAddress,
    }: ExtensionStates): WebExtensionWalletInfo {
      if (wallets.length === 0) {
        throw new Error('the wallets should have at least one more wallet!!!');
      }

      const focusedWalletIndex: number = focusedWalletAddress
        ? wallets.findIndex(
            (itemWallet) => itemWallet.terraAddress === focusedWalletAddress,
          ) ?? 0
        : 0;
      return wallets[focusedWalletIndex];
    }

    extensionStates.subscribe((nextStates) => {
      _states = nextStates;

      if (_statesResolvers.size > 0) {
        for (const clientStatesResolver of _statesResolvers) {
          clientStatesResolver(nextStates);
        }
        _statesResolvers.clear();
      }
    });

    type Info = {
      id: number;
      type: 'info';
    };

    type Connect = {
      id: number;
      type: 'connect';
    };

    type Post = {
      id: number;
      type: 'post';
    } & SerializedCreateTxOptions;

    type Sign = {
      id: number;
      type: 'sign';
    } & SerializedCreateTxOptions;

    pageStream.on('data', async (data: Info | Connect | Post | Sign) => {
      switch (data.type) {
        // ---------------------------------------------
        // info
        // ---------------------------------------------
        case 'info':
          resolveStates(({ network }) => {
            pageStream.write({
              name: 'onInfo',
              id: data.id,
              payload: {
                chainID: network.chainID,
                name: network.name,
                lcd: network.lcd,
              },
            });
          });
          break;
        // ---------------------------------------------
        // connect
        // ---------------------------------------------
        case 'connect':
          function approveConnect(states: ExtensionStates) {
            const focusedWallet = getFocusedWallet(states);

            pageStream.write({
              name: 'onConnect',
              id: data.id,
              payload: {
                address: focusedWallet.terraAddress,
              },
            });
          }

          function denyConnect() {
            pageStream.write({
              name: 'onConnect',
              id: data.id,
              payload: {},
            });
          }

          resolveStates((states) => {
            if (states.wallets.length > 0) {
              approveConnect(states);
            } else {
              startConnect(data.id.toString(), window.location.hostname).then(
                (approvingConnection: boolean) => {
                  if (approvingConnection) {
                    resolveStates((updatedClientStates) => {
                      approveConnect(updatedClientStates);
                    });
                  } else {
                    denyConnect();
                  }
                },
              );
            }
          });
          break;
        // ---------------------------------------------
        // post
        // ---------------------------------------------
        case 'post':
          resolveStates((states) => {
            if (states.wallets.length > 0) {
              const focusedWallet = getFocusedWallet(states);
              startPost(
                data.id.toString(),
                focusedWallet.terraAddress,
                data,
              ).subscribe((txResult) => {
                switch (txResult.status) {
                  case WebExtensionTxStatus.DENIED:
                    pageStream.write({
                      name: 'onPost',
                      id: data.id,
                      payload: {
                        ...data,
                        success: false,
                        error: {
                          code: 1, // user denied
                        },
                      },
                    });
                    break;
                  case WebExtensionTxStatus.FAIL:
                    pageStream.write({
                      name: 'onPost',
                      id: data.id,
                      payload: {
                        ...data,
                        success: false,
                        error: {
                          code: 3, // error before make txhash
                          message: String(txResult.error),
                        },
                      },
                    });
                    break;
                  case WebExtensionTxStatus.SUCCEED:
                    pageStream.write({
                      name: 'onPost',
                      id: data.id,
                      payload: {
                        ...data,
                        success: true,
                        result: txResult.payload,
                      },
                    });
                    break;
                }
              });
            } else {
              pageStream.write({
                name: 'onPost',
                id: data.id,
                payload: {
                  ...data,
                  success: false,
                  error: {
                    code: 3, // error before make txhash
                    message: 'no wallets',
                  },
                },
              });
            }
          });
          break;
        // ---------------------------------------------
        // sign
        // ---------------------------------------------
        case 'sign':
          resolveStates((states) => {
            if (states.wallets.length > 0) {
              const focusedWallet = getFocusedWallet(states);
              startSign(
                data.id.toString(),
                focusedWallet.terraAddress,
                data,
              ).subscribe((txResult) => {
                switch (txResult.status) {
                  case WebExtensionTxStatus.DENIED:
                    pageStream.write({
                      name: 'onSign',
                      id: data.id,
                      payload: {
                        ...data,
                        success: false,
                        error: {
                          code: 1, // user denied
                        },
                      },
                    });
                    break;
                  case WebExtensionTxStatus.FAIL:
                    pageStream.write({
                      name: 'onSign',
                      id: data.id,
                      payload: {
                        ...data,
                        success: false,
                        error: {
                          code: 3, // error before make txhash
                          message: String(txResult.error),
                        },
                      },
                    });
                    break;
                  case WebExtensionTxStatus.SUCCEED:
                    pageStream.write({
                      name: 'onSign',
                      id: data.id,
                      payload: {
                        ...data,
                        success: true,
                        result: txResult.payload,
                      },
                    });
                    break;
                }
              });
            } else {
              pageStream.write({
                name: 'onSign',
                id: data.id,
                payload: {
                  ...data,
                  success: false,
                  error: {
                    code: 3, // error before make txhash
                    message: 'no wallets',
                  },
                },
              });
            }
          });
          break;
        // ---------------------------------------------
        // TODO implement signBytes command
        // ---------------------------------------------
        default:
          console.log('initContentScriptAndWebappConnection.ts..()', data);
          break;
      }
    });
  }
  // ================================================================
  // new extension api
  // ================================================================
  else {
    let lastStates: ExtensionStates | null = null;

    // ---------------------------------------------
    // listen web messages
    // ---------------------------------------------
    window.addEventListener(
      'message',
      (event: MessageEvent<any>) => {
        if (!isWebExtensionMessage(event.data)) {
          return;
        }

        switch (event.data.type) {
          case FromWebToContentScriptMessage.REFETCH_STATES:
            extensionStateLastUpdated.next(Date.now());
            break;
          case FromWebToContentScriptMessage.REQUEST_APPROVAL:
            if (lastStates?.isApproved === true) {
              extensionStateLastUpdated.next(Date.now());
              break;
            }

            startConnect(Date.now().toString(), window.location.hostname).then(
              () => {
                extensionStateLastUpdated.next(Date.now());
              },
            );
            break;
          case FromWebToContentScriptMessage.EXECUTE_POST:
            startPost(
              event.data.id.toString(),
              event.data.terraAddress,
              event.data.payload,
            ).subscribe((txResult) => {
              const msg: WebExtensionPostResponse = {
                type: FromContentScriptToWebMessage.POST_RESPONSE,
                id: +event.data.id,
                payload: txResult,
              };

              window.postMessage(msg, '*');
            });
            break;
          case FromWebToContentScriptMessage.EXECUTE_SIGN:
            startSign(
              event.data.id.toString(),
              event.data.terraAddress,
              event.data.payload,
            ).subscribe((txResult) => {
              const msg: WebExtensionSignResponse = {
                type: FromContentScriptToWebMessage.SIGN_RESPONSE,
                id: +event.data.id,
                payload: txResult,
              };

              window.postMessage(msg, '*');
            });
            break;
          case FromWebToContentScriptMessage.EXECUTE_SIGN_BYTES:
            startSignBytes(
              event.data.id.toString(),
              event.data.terraAddress,
              Buffer.from(event.data.payload, 'base64'),
            ).subscribe((txResult) => {
              const msg: WebExtensionSignBytesResponse = {
                type: FromContentScriptToWebMessage.SIGN_BYTES_RESPONSE,
                id: +event.data.id,
                payload: txResult,
              };

              window.postMessage(msg, '*');
            });
            break;
          case FromWebToContentScriptMessage.HAS_CW20_TOKENS:
            hasCW20Tokens(event.data.chainID, event.data.tokenAddrs).then(
              (result) => {
                const msg: WebExtensionHasCW20TokensResponse = {
                  type: FromContentScriptToWebMessage.HAS_CW20_TOKENS_RESPONSE,
                  id: +event.data.id,
                  chainID: event.data.chainID,
                  payload: result,
                };

                window.postMessage(msg, '*');
              },
            );
            break;
          case FromWebToContentScriptMessage.ADD_CW20_TOKENS:
            startAddCW20Tokens(
              Date.now().toString(),
              event.data.chainID,
              ...event.data.tokenAddrs,
            ).then((result) => {
              const msg: WebExtensionAddCW20TokenResponse = {
                type: FromContentScriptToWebMessage.ADD_CW20_TOKENS_RESPONSE,
                id: +event.data.id,
                chainID: event.data.chainID,
                payload: result,
              };

              window.postMessage(msg, '*');
            });
            break;
          case FromWebToContentScriptMessage.HAS_NETWORK:
            getDefaultNetworks()
              .then((defaultNetworks) =>
                findSimilarNetwork(
                  defaultNetworks,
                  event.data.chainID,
                  event.data.lcd,
                ),
              )
              .then((foundNetwork) => {
                const msg: WebExtensionHasNetworkResponse = {
                  type: FromContentScriptToWebMessage.HAS_NETWORK_RESPONSE,
                  id: +event.data.id,
                  payload: !!foundNetwork,
                };

                window.postMessage(msg, '*');
              });
            break;
          case FromWebToContentScriptMessage.ADD_NETWORK:
            startAddNetwork(Date.now().toString(), {
              name: event.data.name ?? '',
              chainID: event.data.chainID,
              lcd: event.data.lcd,
            }).then((result) => {
              const msg: WebExtensionAddNetworkResponse = {
                type: FromContentScriptToWebMessage.ADD_NETWORK_RESPONSE,
                id: +event.data.id,
                payload: result,
              };

              window.postMessage(msg, '*');
            });
            break;
        }
      },
      false,
    );

    extensionStates.subscribe((states: ExtensionStates) => {
      lastStates = states;

      const msg: WebExtensionStatesUpdated = {
        type: FromContentScriptToWebMessage.STATES_UPDATED,
        payload: states,
      };
      window.postMessage(msg, '*');
    });
  }
}
