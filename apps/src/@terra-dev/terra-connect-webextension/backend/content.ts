import { ClientStates } from '@terra-dev/terra-connect';
import { observeNetworkStorage } from '@terra-dev/webextension-network-storage';
import { observeWalletStorage } from '@terra-dev/webextension-wallet-storage';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { defaultNetworks } from 'webextension/env';
import {
  ExtensionClientStatesUpdated,
  FromContentScriptToWebMessage,
  FromWebToContentScriptMessage,
  isExtensionMessage,
} from '../internal';

export function initContentScript() {
  const meta = document.querySelector('head > meta[name="terra-connect"]');

  if (!meta) return;

  const extensionStateLastUpdated = new BehaviorSubject<number>(Date.now());

  window.addEventListener(
    'message',
    (event) => {
      if (!isExtensionMessage(event.data)) {
        return;
      }

      switch (event.data.type) {
        case FromWebToContentScriptMessage.REFETCH_CLIENT_STATES:
          extensionStateLastUpdated.next(Date.now());
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
      const msg: ExtensionClientStatesUpdated = {
        type: FromContentScriptToWebMessage.CLIENT_STATES_UPDATED,
        payload: clientStates,
      };
      window.postMessage(msg, '*');
    });
}
