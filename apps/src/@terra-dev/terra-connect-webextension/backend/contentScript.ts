import { Network } from '@terra-dev/network';
import { ClientStates } from '@terra-dev/terra-connect';
import { SerializedTx, TxResult } from '@terra-dev/tx';
import { observeNetworkStorage } from '@terra-dev/webextension-network-storage';
import { observeWalletStorage } from '@terra-dev/webextension-wallet-storage';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { defaultNetworks } from 'webextension/env';
import {
  FromContentScriptToWebMessage,
  FromWebToContentScriptMessage,
  isWebExtensionMessage,
  WebExtensionClientStatesUpdated,
  WebExtensionTxResponse,
} from '../internal/messages';

export interface ContentScriptOptions {
  startTx: (
    id: string,
    terraAddress: string,
    network: Network,
    tx: SerializedTx,
  ) => Observable<TxResult>;
}

export function initContentScriptAndWebappConnection({
  startTx,
}: ContentScriptOptions) {
  const meta = document.querySelector('head > meta[name="terra-connect"]');

  if (!meta) return;

  const extensionStateLastUpdated = new BehaviorSubject<number>(Date.now());

  window.addEventListener(
    'message',
    (event) => {
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

  const walletInfosObservable = observeWalletStorage().pipe(
    // remove sensitive informations
    map((wallets) =>
      wallets.map(({ name, terraAddress }) => ({
        name,
        terraAddress,
      })),
    ),
  );

  const networkObservable = observeNetworkStorage().pipe(
    map(({ selectedNetwork }) => selectedNetwork ?? defaultNetworks[0]),
  );

  combineLatest([
    extensionStateLastUpdated,
    walletInfosObservable,
    networkObservable,
  ])
    .pipe(
      map(([_, wallets, network]) => {
        return {
          wallets,
          network,
        } as ClientStates;
      }),
    )
    .subscribe((clientStates) => {
      const msg: WebExtensionClientStatesUpdated = {
        type: FromContentScriptToWebMessage.CLIENT_STATES_UPDATED,
        payload: clientStates,
      };
      window.postMessage(msg, '*');
    });
}
