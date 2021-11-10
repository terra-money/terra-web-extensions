import { WebConnectorNetworkInfo } from '@terra-dev/web-connector-interface';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { browser, Storage } from 'webextension-polyfill-ts';
import { safariWebExtensionStorageChangeListener } from '../../utils/safariWebExtensionStorageChangeListener';

const storageKey = 'terra_network_storage_v1';

export interface NetworkStorageData {
  networks: WebConnectorNetworkInfo[];
  selectedNetwork: WebConnectorNetworkInfo | undefined;
}

export async function readNetworkStorage(): Promise<NetworkStorageData> {
  const values = await browser.storage.local.get(storageKey);
  return (
    values[storageKey] ?? {
      networks: [],
      selectedNetwork: undefined,
    }
  );
}

export async function writeNetworkStorage(
  data: NetworkStorageData,
): Promise<void> {
  await browser.storage.local.set({
    [storageKey]: data,
  });
}

export async function findNetwork(
  name: string,
): Promise<WebConnectorNetworkInfo | undefined> {
  const { networks } = await readNetworkStorage();
  return networks.find((network) => network.name === name);
}

export async function findSimilarNetwork(
  defaultNetworks: WebConnectorNetworkInfo[],
  chainID: string,
  lcd: string,
): Promise<WebConnectorNetworkInfo | undefined> {
  const { networks } = await readNetworkStorage();
  return [...defaultNetworks, ...networks].find((targetNetwork) => {
    return targetNetwork.chainID === chainID && targetNetwork.lcd === lcd;
  });
}

export async function addNetwork(
  network: WebConnectorNetworkInfo,
): Promise<void> {
  const { networks } = await readNetworkStorage();
  const nextNetworks = [...networks, network];
  await writeNetworkStorage({
    networks: nextNetworks,
    selectedNetwork: network,
  });
}

export async function removeNetwork(
  network: WebConnectorNetworkInfo,
): Promise<void> {
  const { networks, selectedNetwork } = await readNetworkStorage();
  const nextNetworks = networks.filter(({ name }) => network.name !== name);
  const nextSelectedNetwork =
    network.name === selectedNetwork?.name ? undefined : selectedNetwork;

  await writeNetworkStorage({
    networks: nextNetworks,
    selectedNetwork: nextSelectedNetwork,
  });
}

export async function updateNetwork(
  name: string,
  network: WebConnectorNetworkInfo,
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

export function observeNetworkStorage(): Observable<NetworkStorageData> {
  return new Observable<NetworkStorageData>((subscriber) => {
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

    const safariChangeSubscription: Subscription =
      safariWebExtensionStorageChangeListener<NetworkStorageData>(
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

export async function selectNetwork(
  network: WebConnectorNetworkInfo,
): Promise<void> {
  const { selectedNetwork, ...storage } = await readNetworkStorage();
  await writeNetworkStorage({
    selectedNetwork: network,
    ...storage,
  });
}

export type NetworksData = {
  networks: WebConnectorNetworkInfo[];
  selectedNetwork: WebConnectorNetworkInfo | undefined;
};

export function observeNetworks(
  defaultNetworks: WebConnectorNetworkInfo[],
): Observable<NetworksData> {
  return observeNetworkStorage().pipe(
    map(({ networks, selectedNetwork }) => {
      return {
        networks: [...defaultNetworks, ...networks],
        selectedNetwork: selectedNetwork ?? defaultNetworks[0],
      };
    }),
  );
}

export async function readSelectedNetwork(
  defaultNetworks: WebConnectorNetworkInfo[],
): Promise<WebConnectorNetworkInfo> {
  return readNetworkStorage().then(({ selectedNetwork }) => {
    return selectedNetwork ?? defaultNetworks[0];
  });
}
