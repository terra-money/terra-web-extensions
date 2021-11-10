import { browser } from 'webextension-polyfill-ts';

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
