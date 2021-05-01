import { Network } from '@terra-dev/network';
import { ClientStates } from '@terra-dev/terra-connect';
import { SerializedTx, TxResult } from '@terra-dev/tx';
import { WalletInfo } from '@terra-dev/wallet';
import { observeNetworkStorage } from '@terra-dev/webextension-network-storage';
import { observeWalletStorage } from '@terra-dev/webextension-wallet-storage';
//@ts-ignore
import LocalMessageDuplexStream from 'post-message-stream';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  FromContentScriptToWebMessage,
  FromWebToContentScriptMessage,
  isWebExtensionMessage,
  WebExtensionClientStatesUpdated,
  WebExtensionTxResponse,
} from './messages';

export interface ContentScriptOptions {
  defaultNetworks: Network[];
  startTx: (
    id: string,
    terraAddress: string,
    network: Network,
    tx: SerializedTx,
  ) => Observable<TxResult>;
  startConnect: (id: string, hostname: string) => Promise<boolean>;
}

export function initContentScriptAndWebappConnection({
  startTx,
  startConnect,
  defaultNetworks,
}: ContentScriptOptions) {
  // ---------------------------------------------
  // only enable the site has <meta name="terra-webextension" legacy="terra.js">
  // ---------------------------------------------
  const meta = document.querySelector('head > meta[name="terra-webextension"]');
  if (!meta) return;

  const legacy: Set<string> = new Set(
    meta.getAttribute('legacy')?.split(',') ?? [],
  );

  // ---------------------------------------------
  // inject inpage scripts
  // TODO remove if every dapps migrated to newer api
  // ---------------------------------------------
  if (legacy.has('terra.js')) {
    const inpage = document.createElement('script');
    inpage.innerText = 'window.isTerraExtensionAvailable = true;';

    const head = document.querySelector('head');
    head?.appendChild(inpage);
  }

  // ---------------------------------------------
  // set the attribute <meta name="terra" connected="true">
  // ---------------------------------------------
  meta.setAttribute('connected', 'true');

  // ---------------------------------------------
  // states
  // ---------------------------------------------
  const extensionStateLastUpdated = new BehaviorSubject<number>(Date.now());

  // ---------------------------------------------
  // listen extension storage states
  // ---------------------------------------------
  const walletsObservable: Observable<{
    wallets: WalletInfo[];
    focusedWalletAddress: string | undefined;
  }> = observeWalletStorage().pipe(
    map(({ wallets, focusedWalletAddress, approvedHostnames }) => {
      const hostname: string = window.location.hostname;

      return approvedHostnames.includes(hostname)
        ? { wallets, focusedWalletAddress }
        : { wallets: [], focusedWalletAddress: undefined };
    }),
  );

  const networkObservable = observeNetworkStorage().pipe(
    map(({ selectedNetwork }) => selectedNetwork ?? defaultNetworks[0]),
  );

  const extensionStates = combineLatest([
    extensionStateLastUpdated,
    walletsObservable,
    networkObservable,
  ]).pipe(
    map(([_, { wallets, focusedWalletAddress }, network]) => {
      return {
        wallets,
        network,
        focusedWalletAddress,
      } as ClientStates;
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

    let _clientStates: ClientStates | null = null;
    let _clientStatesResolvers: Set<(_: ClientStates) => void> = new Set();

    function resolveClientStates(callback: (_: ClientStates) => void) {
      if (_clientStates) {
        callback(_clientStates);
      } else {
        _clientStatesResolvers.add(callback);
      }
    }

    extensionStates.subscribe((nextClientStates) => {
      _clientStates = nextClientStates;

      if (_clientStatesResolvers.size > 0) {
        for (const clientStatesResolver of _clientStatesResolvers) {
          clientStatesResolver(nextClientStates);
        }
        _clientStatesResolvers.clear();
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

    pageStream.on('data', async (data: Info | Connect) => {
      switch (data.type) {
        // ---------------------------------------------
        // info
        // ---------------------------------------------
        case 'info':
          resolveClientStates(({ network }) => {
            pageStream.write({
              name: 'onInfo',
              id: data.id,
              payload: {
                chainID: network.chainID,
                name: network.name,
                fcd: network.servers.fcd,
                lcd: network.servers.lcd,
                ws: network.servers.ws,
              },
            });
          });
          break;
        // ---------------------------------------------
        // connect
        // ---------------------------------------------
        case 'connect':
          function approveConnect({
            focusedWalletAddress,
            wallets,
          }: ClientStates) {
            const focusedWalletIndex: number = focusedWalletAddress
              ? wallets.findIndex(
                  (itemWallet) =>
                    itemWallet.terraAddress === focusedWalletAddress,
                ) ?? 0
              : 0;

            pageStream.write({
              name: 'onConnect',
              id: data.id,
              payload: {
                name: wallets[focusedWalletIndex].name,
                address: wallets[focusedWalletIndex].terraAddress,
                design: wallets[focusedWalletIndex].design,
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

          resolveClientStates((clientStates) => {
            if (clientStates.wallets.length > 0) {
              approveConnect(clientStates);
            } else {
              startConnect(data.id.toString(), window.location.hostname).then(
                (approvingConnection: boolean) => {
                  if (approvingConnection) {
                    resolveClientStates((updatedClientStates) => {
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
          case FromWebToContentScriptMessage.REFETCH_CLIENT_STATES:
            extensionStateLastUpdated.next(Date.now());
            break;
          case FromWebToContentScriptMessage.EXECUTE_TX:
            startTx(
              event.data.id.toString(),
              event.data.terraAddress,
              event.data.network,
              event.data.payload,
            ).subscribe((txResult) => {
              const msg: WebExtensionTxResponse = {
                type: FromContentScriptToWebMessage.TX_RESPONSE,
                id: event.data.id,
                payload: txResult,
              };

              window.postMessage(msg, '*');
            });
            break;
        }
      },
      false,
    );

    extensionStates.subscribe((clientStates) => {
      const msg: WebExtensionClientStatesUpdated = {
        type: FromContentScriptToWebMessage.CLIENT_STATES_UPDATED,
        payload: clientStates,
      };
      window.postMessage(msg, '*');
    });
  }
}