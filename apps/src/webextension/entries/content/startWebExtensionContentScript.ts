import {
  SerializedCreateTxOptions,
  WebConnectorNetworkInfo,
  WebConnectorStates,
  WebConnectorTxResult,
  WebConnectorTxStatus,
  WebConnectorWalletInfo,
} from '@terra-dev/web-connector-interface';
import {
  findSimilarNetwork,
  hasCW20Tokens,
  observeHostnamesStorage,
  observeNetworkStorage,
  observeWalletsStorage,
} from '@terra-dev/web-extension-backend';
//@ts-ignore
import LocalMessageDuplexStream from 'post-message-stream';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { browser } from 'webextension-polyfill-ts';
import { WHITELIST_HOSTNAMES } from 'webextension/env';
import {
  FromContentScriptToWebMessage,
  FromWebToContentScriptMessage,
  isWebExtensionMessage,
  WebExtensionAddCW20TokenResponse,
  WebExtensionAddNetworkResponse,
  WebExtensionHasCW20TokensResponse,
  WebExtensionHasNetworkResponse,
  WebExtensionStatesUpdated,
  WebExtensionTxResponse,
} from '../../models/WebExtensionMessage';
import { getDefaultNetworks } from '../../queries/useDefaultNetworks';

export interface ContentScriptOptions {
  startTx: (
    id: string,
    terraAddress: string,
    tx: SerializedCreateTxOptions,
  ) => Observable<WebConnectorTxResult>;
  startConnect: (id: string, hostname: string) => Promise<boolean>;
  startAddCW20Tokens: (
    id: string,
    chainID: string,
    ...tokenAddrs: string[]
  ) => Promise<{ [tokenAddr: string]: boolean }>;
  startAddNetwork: (
    id: string,
    network: WebConnectorNetworkInfo,
  ) => Promise<boolean>;
}

const CONNECT_NAME = 'Terra Station';

export function startWebExtensionContentScript({
  startTx,
  startConnect,
  startAddCW20Tokens,
  startAddNetwork,
}: ContentScriptOptions) {
  // ---------------------------------------------
  // only enable the site has <meta name="terra-web-connect" legacy="terra.js">
  // ---------------------------------------------
  const meta = document.querySelector('head > meta[name="terra-web-connect"]');
  if (!meta) return;

  // ---------------------------------------------
  // check dApp is legacy mode
  // ---------------------------------------------
  const legacy: Set<string> = new Set(
    meta.getAttribute('legacy')?.split(',') ?? [],
  );

  // ---------------------------------------------
  // set the attribute <meta name="terra-web-connect" connected="Terra Station">
  // ---------------------------------------------
  meta.setAttribute('connected', CONNECT_NAME);

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
    wallets: WebConnectorWalletInfo[];
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

  type ExtensionStates = WebConnectorStates & { isApproved: boolean };

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

    let _states: WebConnectorStates | null = null;
    let _statesResolvers: Set<(_: WebConnectorStates) => void> = new Set();

    function resolveStates(callback: (_: WebConnectorStates) => void) {
      if (_states) {
        callback(_states);
      } else {
        _statesResolvers.add(callback);
      }
    }

    function getFocusedWallet({
      wallets,
      focusedWalletAddress,
    }: WebConnectorStates): WebConnectorWalletInfo {
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

    pageStream.on('data', async (data: Info | Connect | Post) => {
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
          function approveConnect(states: WebConnectorStates) {
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
              startTx(
                data.id.toString(),
                focusedWallet.terraAddress,
                data,
              ).subscribe((txResult) => {
                switch (txResult.status) {
                  case WebConnectorTxStatus.DENIED:
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
                  case WebConnectorTxStatus.FAIL:
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
                  case WebConnectorTxStatus.SUCCEED:
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
        // TODO implement sign command
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
              console.warn(`${window.location.hostname} is already approved!`);
              break;
            }

            startConnect(Date.now().toString(), window.location.hostname).then(
              () => {
                extensionStateLastUpdated.next(Date.now());
              },
            );
            break;
          case FromWebToContentScriptMessage.EXECUTE_TX:
            startTx(
              event.data.id.toString(),
              event.data.terraAddress,
              event.data.payload,
            ).subscribe((txResult) => {
              const msg: WebExtensionTxResponse = {
                type: FromContentScriptToWebMessage.TX_RESPONSE,
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
