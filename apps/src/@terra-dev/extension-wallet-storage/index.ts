import { EncryptedWallet } from '@terra-dev/wallet';
import { Observable } from 'rxjs';
import { browser, Storage } from 'webextension-polyfill-ts';

export interface StoredWallet {
  name: string;
  accAddress: string;
  encrypedWallet: EncryptedWallet;
}

export interface WalletStorage {
  readWalletStorage: () => Promise<StoredWallet[]>;
  writeWalletStorage: (wallets: StoredWallet[]) => Promise<void>;
  addWallet: (wallet: StoredWallet) => Promise<void>;
  removeWallet: (wallet: StoredWallet) => Promise<void>;
  observeWalletStorage: () => Observable<StoredWallet[]>;
}

export function createWalletStorageVersion1(storageKey: string): WalletStorage {
  async function readWalletStorage(): Promise<StoredWallet[]> {
    const values = await browser.storage.local.get(storageKey);
    return values[storageKey] ?? [];
  }

  async function writeWalletStorage(wallets: StoredWallet[]): Promise<void> {
    await browser.storage.local.set({
      [storageKey]: wallets,
    });
  }

  async function addWallet(wallet: StoredWallet): Promise<void> {
    const wallets = await readWalletStorage();
    const nextWallets = [...wallets, wallet];
    await writeWalletStorage(nextWallets);
  }

  async function removeWallet(wallet: StoredWallet): Promise<void> {
    const wallets = await readWalletStorage();
    const nextWallets = wallets.filter(
      ({ accAddress }) => accAddress !== wallet.accAddress,
    );
    await writeWalletStorage(nextWallets);
  }

  function observeWalletStorage(): Observable<StoredWallet[]> {
    return new Observable<StoredWallet[]>((subscriber) => {
      function callback(
        changes: Record<string, Storage.StorageChange>,
        areaName: string,
      ) {
        if (areaName === 'local' && changes[storageKey]) {
          const { newValue } = changes[storageKey];
          subscriber.next(newValue);
        }
      }

      browser.storage.onChanged.addListener(callback);

      readWalletStorage().then((wallets) => {
        console.log('index.ts..()', wallets);
        subscriber.next(wallets);
      });

      return () => {
        browser.storage.onChanged.removeListener(callback);
      };
    });
  }

  return {
    readWalletStorage,
    writeWalletStorage,
    addWallet,
    removeWallet,
    observeWalletStorage,
  };
}

export const {
  readWalletStorage,
  writeWalletStorage,
  observeWalletStorage,
  addWallet,
  removeWallet,
} = createWalletStorageVersion1('terra_wallet_storage_v1');
