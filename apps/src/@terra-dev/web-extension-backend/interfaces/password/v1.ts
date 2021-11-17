import { decrypt, encrypt } from '@terra-money/key-utils';
import { Observable, Subscription } from 'rxjs';
import { browser, Storage } from 'webextension-polyfill-ts';
import { safariWebExtensionStorageChangeListener } from '../../utils/safariWebExtensionStorageChangeListener';

const storageKey = 'terra_password_storage_v1';

interface SavedPassword {
  terraAddress: string;
  encryptedPassword: string;
  expireTime: number;
}

export interface PasswordStorageData {
  savedPasswords: SavedPassword[];
}

export interface PublicPasswordStorageData {
  savedPasswords: Pick<SavedPassword, 'terraAddress'>[];
}

async function readPasswordStorage(): Promise<PasswordStorageData> {
  const values = await browser.storage.local.get(storageKey);
  return (
    values[storageKey] ?? {
      savedPasswords: [],
    }
  );
}

async function writePasswordStorage(data: PasswordStorageData): Promise<void> {
  await browser.storage.local.set({
    [storageKey]: data,
  });
}

export async function clearStalePasswords(): Promise<void> {
  const { savedPasswords, ...data } = await readPasswordStorage();

  const now = Date.now();

  const nextSavedPasswords = savedPasswords.filter(({ expireTime }) => {
    return expireTime > now;
  });

  await writePasswordStorage({
    ...data,
    savedPasswords: nextSavedPasswords,
  });
}

export async function savePassword(
  terraAddress: string,
  password: string,
  expireTime: number,
): Promise<void> {
  const { savedPasswords, ...data } = await readPasswordStorage();

  const now = Date.now();

  const nextSavedPasswords = savedPasswords.filter((item) => {
    return item.expireTime > now;
  });

  if (!nextSavedPasswords.some((item) => item.terraAddress === terraAddress)) {
    nextSavedPasswords.push({
      terraAddress,
      encryptedPassword: encrypt(password, expireTime.toString(16)),
      expireTime,
    });
  }

  await writePasswordStorage({
    ...data,
    savedPasswords: nextSavedPasswords,
  });
}

export async function getSavedPassword(
  terraAddress: string,
): Promise<string | undefined> {
  const { savedPasswords } = await readPasswordStorage();

  const now = Date.now();

  const matched = savedPasswords
    .filter(({ expireTime }) => {
      return expireTime > now;
    })
    .find((item) => item.terraAddress === terraAddress);

  try {
    return matched
      ? decrypt(matched.encryptedPassword, matched.expireTime.toString(16))
      : undefined;
  } catch {
    return undefined;
  }
}

export async function removeSavedPassword(terraAddress: string): Promise<void> {
  const { savedPasswords, ...data } = await readPasswordStorage();

  const nextSavedPasswords = savedPasswords.filter((item) => {
    return item.terraAddress !== terraAddress;
  });

  await writePasswordStorage({
    ...data,
    savedPasswords: nextSavedPasswords,
  });
}

export function observePasswordStorage(): Observable<PublicPasswordStorageData> {
  return new Observable<PublicPasswordStorageData>((subscriber) => {
    function callback(
      changes: Record<string, Storage.StorageChange>,
      areaName: string,
    ) {
      if (areaName === 'local' && changes[storageKey]) {
        const { newValue } = changes[storageKey];
        const filteredNewValue: PublicPasswordStorageData = newValue
          ? {
              savedPasswords: (
                newValue as PasswordStorageData
              ).savedPasswords.map(({ terraAddress }) => ({ terraAddress })),
            }
          : {
              savedPasswords: [],
            };
        subscriber.next(filteredNewValue);
      }
    }

    browser.storage.onChanged.addListener(callback);

    const safariChangeSubscription: Subscription =
      safariWebExtensionStorageChangeListener<PasswordStorageData>(
        storageKey,
      ).subscribe((nextValue) => {
        const filteredNextValue: PublicPasswordStorageData = nextValue
          ? {
              savedPasswords: nextValue.savedPasswords.map(
                ({ terraAddress }) => ({ terraAddress }),
              ),
            }
          : {
              savedPasswords: [],
            };
        subscriber.next(filteredNextValue);
      });

    readPasswordStorage().then((data) => {
      const filteredData: PublicPasswordStorageData = {
        savedPasswords: data.savedPasswords.map(({ terraAddress }) => ({
          terraAddress,
        })),
      };
      subscriber.next(filteredData);
    });

    return () => {
      browser.storage.onChanged.removeListener(callback);
      safariChangeSubscription.unsubscribe();
    };
  });
}
