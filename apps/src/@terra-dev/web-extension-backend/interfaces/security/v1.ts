import { safariWebExtensionStorageChangeListener } from '@terra-dev/web-extension-backend/utils/safariWebExtensionStorageChangeListener';
import { Observable, Subscription } from 'rxjs';
import { browser, Storage } from 'webextension-polyfill-ts';

const storageKey = 'terra_security_storage_v1';

const EXPIRE = 1000 * 60 * 10;

interface AllowedCommandId {
  id: string;
  expireTime: number;
}

export interface SecurityStorageData {
  allowedCommandIds: AllowedCommandId[];
}

export async function readSecurityStorage(): Promise<SecurityStorageData> {
  const values = await browser.storage.local.get(storageKey);
  return (
    values[storageKey] ?? {
      allowedCommandIds: [],
    }
  );
}

export async function writeSecurityStorage(
  data: SecurityStorageData,
): Promise<void> {
  await browser.storage.local.set({
    [storageKey]: data,
  });
}

export async function registerAllowCommandId(id: string) {
  const { allowedCommandIds, ...data } = await readSecurityStorage();

  const now = Date.now();

  const next: AllowedCommandId[] = [
    ...allowedCommandIds.filter(({ expireTime }) => expireTime > now),
    { id, expireTime: Date.now() + EXPIRE },
  ];

  await writeSecurityStorage({
    ...data,
    allowedCommandIds: next,
  });
}

export async function isAllowedCommandId(id: string): Promise<boolean> {
  const { allowedCommandIds } = await readSecurityStorage();

  if (allowedCommandIds.length === 0) {
    return false;
  }

  const now = Date.now();

  return allowedCommandIds.some(
    (item) => item.id === id && item.expireTime > now,
  );
}

export async function deregisterAllowCommandId(id: string) {
  const { allowedCommandIds, ...data } = await readSecurityStorage();

  if (allowedCommandIds.length === 0) {
    return;
  }

  const now = Date.now();

  const next: AllowedCommandId[] = [
    ...allowedCommandIds.filter(
      (item) => item.expireTime > now && item.id !== id,
    ),
  ];

  await writeSecurityStorage({
    ...data,
    allowedCommandIds: next,
  });
}

export function observeSecurityStorage(): Observable<SecurityStorageData> {
  return new Observable<SecurityStorageData>((subscriber) => {
    function callback(
      changes: Record<string, Storage.StorageChange>,
      areaName: string,
    ) {
      if (areaName === 'local' && changes[storageKey]) {
        const { newValue } = changes[storageKey];
        subscriber.next(
          newValue ?? ({ allowedCommandIds: [] } as SecurityStorageData),
        );
      }
    }

    browser.storage.onChanged.addListener(callback);

    const safariChangeSubscription: Subscription =
      safariWebExtensionStorageChangeListener<SecurityStorageData>(
        storageKey,
      ).subscribe((nextValue) => {
        subscriber.next(
          nextValue ?? ({ allowedCommandIds: [] } as SecurityStorageData),
        );
      });

    readSecurityStorage().then((data) => {
      subscriber.next(data);
    });

    return () => {
      browser.storage.onChanged.removeListener(callback);
      safariChangeSubscription.unsubscribe();
    };
  });
}
