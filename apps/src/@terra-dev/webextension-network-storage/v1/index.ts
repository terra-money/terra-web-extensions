import { Network } from '@terra-dev/network';
import { safariWebExtensionStorageChangeListener } from '@terra-dev/safari-webextension-storage-change-listener';
import { Observable, Subscription } from 'rxjs';
import { browser, Storage } from 'webextension-polyfill-ts';

const storageKey = 'terra_network_storage_v1';

export interface NetworkStorage {
  networks: Network[];
  selectedNetwork: Network | undefined;
}

export async function readNetworkStorage(): Promise<NetworkStorage> {
  const values = await browser.storage.local.get(storageKey);
  return (
    values[storageKey] ?? {
      networks: [],
      selectedNetwork: undefined,
    }
  );
}

export async function writeNetworkStorage(
  storage: NetworkStorage,
): Promise<void> {
  await browser.storage.local.set({
    [storageKey]: storage,
  });
}

export async function findNetwork(name: string): Promise<Network | undefined> {
  const { networks } = await readNetworkStorage();
  return networks.find((network) => network.name === name);
}

export async function addNetwork(network: Network): Promise<void> {
  const { networks, ...storage } = await readNetworkStorage();
  const nextNetworks = [...networks, network];
  await writeNetworkStorage({
    networks: nextNetworks,
    ...storage,
  });
}

export async function removeNetwork(network: Network): Promise<void> {
  const { networks, selectedNetwork } = await readNetworkStorage();
  const nextNetworks = networks.filter(({ name }) => network.name !== name);
  const nextSelectedNetwork =
    network.name === selectedNetwork?.name && nextNetworks.length > 0
      ? nextNetworks[0]
      : selectedNetwork;

  await writeNetworkStorage({
    networks: nextNetworks,
    selectedNetwork: nextSelectedNetwork,
  });
}

export async function updateNetwork(
  name: string,
  network: Network,
): Promise<void> {
  const { networks, selectedNetwork } = await readNetworkStorage();
  const index = networks.findIndex(
    (findingNetwork) => findingNetwork.name === name,
  );

  if (index === -1) {
    return;
  }

  const nextNetworks = [...networks];
  nextNetworks.splice(index, 1, network);

  const nextSelectedNetwork =
    selectedNetwork?.name === name ? network : selectedNetwork;

  await writeNetworkStorage({
    networks: nextNetworks,
    selectedNetwork: nextSelectedNetwork,
  });
}

export function observeNetworkStorage(): Observable<NetworkStorage> {
  return new Observable<NetworkStorage>((subscriber) => {
    function callback(
      changes: Record<string, Storage.StorageChange>,
      areaName: string,
    ) {
      if (areaName === 'local' && changes[storageKey]) {
        const { newValue } = changes[storageKey];
        subscriber.next(
          newValue ?? {
            networks: [],
            selectedNetwork: undefined,
          },
        );
      }
    }

    browser.storage.onChanged.addListener(callback);

    const safariChangeSubscription: Subscription = safariWebExtensionStorageChangeListener<NetworkStorage>(
      storageKey,
    ).subscribe((nextValue) => {
      subscriber.next(
        nextValue ?? {
          networks: [],
          selectedNetwork: undefined,
        },
      );
    });

    readNetworkStorage().then((storage) => {
      subscriber.next(storage);
    });

    return () => {
      browser.storage.onChanged.removeListener(callback);
      safariChangeSubscription.unsubscribe();
    };
  });
}

export async function selectNetwork(network: Network): Promise<void> {
  const { selectedNetwork, ...storage } = await readNetworkStorage();
  await writeNetworkStorage({
    selectedNetwork: network,
    ...storage,
  });
}
