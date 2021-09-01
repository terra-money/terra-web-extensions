import { Observable, Subscription } from 'rxjs';
import { browser, Storage } from 'webextension-polyfill-ts';
import { safariWebExtensionStorageChangeListener } from '../../../utils/safariWebExtensionStorageChangeListener';

const storageKey = 'terra_hostnames_storage_v1';

export interface HostnamesStorageData {
  /**
   * approved hostnames
   *
   * hostname[]
   */
  approvedHostnames: string[];
}

// ---------------------------------------------
// storage
// ---------------------------------------------
export async function readHostnamesStorage(): Promise<HostnamesStorageData> {
  const values = await browser.storage.local.get(storageKey);
  return (
    values[storageKey] ?? ({ approvedHostnames: [] } as HostnamesStorageData)
  );
}

export async function writeHostnamesStorage(
  data: HostnamesStorageData,
): Promise<void> {
  await browser.storage.local.set({
    [storageKey]: data,
  });
}

export async function approveHostnames(...hostnames: string[]): Promise<void> {
  const { approvedHostnames } = await readHostnamesStorage();

  const nextApprovedHostnames = new Set<string>([
    ...approvedHostnames,
    ...hostnames,
  ]);

  await writeHostnamesStorage({
    approvedHostnames: Array.from(nextApprovedHostnames),
  });
}

export async function disapproveHostname(
  ...hostnames: string[]
): Promise<void> {
  const { approvedHostnames } = await readHostnamesStorage();

  const removeIndex = new Set(hostnames);

  const nextApprovedHostnames = approvedHostnames.filter(
    (itemHostname) => !removeIndex.has(itemHostname),
  );

  await writeHostnamesStorage({
    approvedHostnames: nextApprovedHostnames,
  });
}

export function observeHostnamesStorage(): Observable<HostnamesStorageData> {
  return new Observable<HostnamesStorageData>((subscriber) => {
    function callback(
      changes: Record<string, Storage.StorageChange>,
      areaName: string,
    ) {
      if (areaName === 'local' && changes[storageKey]) {
        const { newValue } = changes[storageKey];
        subscriber.next(
          newValue ?? ({ approvedHostnames: [] } as HostnamesStorageData),
        );
      }
    }

    browser.storage.onChanged.addListener(callback);

    const safariChangeSubscription: Subscription = safariWebExtensionStorageChangeListener<HostnamesStorageData>(
      storageKey,
    ).subscribe((nextValue) => {
      subscriber.next(
        nextValue ?? ({ approvedHostnames: [] } as HostnamesStorageData),
      );
    });

    readHostnamesStorage().then((data) => {
      subscriber.next(data);
    });

    return () => {
      browser.storage.onChanged.removeListener(callback);
      safariChangeSubscription.unsubscribe();
    };
  });
}
