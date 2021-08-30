import { Observable, Subscription } from 'rxjs';
import { browser, Storage } from 'webextension-polyfill-ts';
import { safariWebExtensionStorageChangeListener } from '../../../utils/safariWebExtensionStorageChangeListener';

const storageKey = 'terra_cw20_storage_v1';

export interface CW20StorageData {
  cw20Tokens: { [chainId: string]: string[] };
}

export async function readCW20Storage(): Promise<CW20StorageData> {
  const values = await browser.storage.local.get(storageKey);
  return (
    values[storageKey] ?? {
      cw20Tokens: {},
    }
  );
}

export async function writeCW20Storage(data: CW20StorageData): Promise<void> {
  await browser.storage.local.set({
    [storageKey]: data,
  });
}

export async function getCW20Tokens(chainId: string): Promise<string[]> {
  const { cw20Tokens } = await readCW20Storage();
  return cw20Tokens[chainId] ?? [];
}

export async function addCW20Tokens(
  chainId: string,
  tokenAddrs: string[],
): Promise<void> {
  const { cw20Tokens } = await readCW20Storage();
  const prevCW20Tokens = cw20Tokens[chainId] ?? [];
  const nextCW20Tokens = new Set([...prevCW20Tokens, ...tokenAddrs]);
  const nextData: CW20StorageData = {
    cw20Tokens: {
      ...cw20Tokens,
      [chainId]: Array.from(nextCW20Tokens),
    },
  };
  await writeCW20Storage(nextData);
}

export async function removeCW20Tokens(
  chainId: string,
  tokenAddrs: string[],
): Promise<void> {
  const removeTokens = new Set(tokenAddrs);
  const { cw20Tokens } = await readCW20Storage();
  const prevCW20Tokens = cw20Tokens[chainId] ?? [];
  const nextCW20Tokens = prevCW20Tokens.filter(
    (token) => !removeTokens.has(token),
  );
  const nextData: CW20StorageData = {
    cw20Tokens: {
      ...cw20Tokens,
      [chainId]: Array.from(nextCW20Tokens),
    },
  };
  await writeCW20Storage(nextData);
}

export function observeCW20Storage(): Observable<CW20StorageData> {
  return new Observable<CW20StorageData>((subscriber) => {
    function callback(
      changes: Record<string, Storage.StorageChange>,
      areaName: string,
    ) {
      if (areaName === 'local' && changes[storageKey]) {
        const { newValue } = changes[storageKey];
        subscriber.next(
          newValue ?? {
            cw20Tokens: {},
          },
        );
      }
    }

    browser.storage.onChanged.addListener(callback);

    const safariChangeSubscription: Subscription = safariWebExtensionStorageChangeListener<CW20StorageData>(
      storageKey,
    ).subscribe((nextValue) => {
      subscriber.next(
        nextValue ?? {
          cw20Tokens: {},
        },
      );
    });

    readCW20Storage().then((storage) => {
      subscriber.next(storage);
    });

    return () => {
      browser.storage.onChanged.removeListener(callback);
      safariChangeSubscription.unsubscribe();
    };
  });
}
