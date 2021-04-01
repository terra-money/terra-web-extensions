import { safariWebExtensionStorageChangeListener } from '@terra-dev/safari-webextension-storage-change-listener';
import { EncryptedWallet } from '@terra-dev/wallet';
import { Observable, Subscription } from 'rxjs';
import { browser, Storage } from 'webextension-polyfill-ts';

const storageKey = 'terra_wallet_storage_v1';

export async function readWalletStorage(): Promise<EncryptedWallet[]> {
  const values = await browser.storage.local.get(storageKey);
  return values[storageKey] ?? [];
}

export async function writeWalletStorage(
  wallets: EncryptedWallet[],
): Promise<void> {
  await browser.storage.local.set({
    [storageKey]: wallets,
  });
}

export async function findWallet(
  terraAddress: string,
): Promise<EncryptedWallet | undefined> {
  const wallets = await readWalletStorage();
  return wallets.find((wallet) => wallet.terraAddress === terraAddress);
}

export async function addWallet(wallet: EncryptedWallet): Promise<void> {
  const wallets = await readWalletStorage();
  const nextWallets = [...wallets, wallet];
  await writeWalletStorage(nextWallets);
}

export async function removeWallet(wallet: EncryptedWallet): Promise<void> {
  const wallets = await readWalletStorage();
  const nextWallets = wallets.filter(
    ({ terraAddress }) => terraAddress !== wallet.terraAddress,
  );
  await writeWalletStorage(nextWallets);
}

export async function updateWallet(
  terraAddress: string,
  wallet: EncryptedWallet,
): Promise<void> {
  const wallets = await readWalletStorage();
  const index = wallets.findIndex(
    (wallet) => wallet.terraAddress === terraAddress,
  );

  if (index === -1) {
    return;
  }

  const nextWallets = [...wallets];
  nextWallets.splice(index, 1, wallet);

  await writeWalletStorage(nextWallets);
}

export function observeWalletStorage(): Observable<EncryptedWallet[]> {
  return new Observable<EncryptedWallet[]>((subscriber) => {
    function callback(
      changes: Record<string, Storage.StorageChange>,
      areaName: string,
    ) {
      if (areaName === 'local' && changes[storageKey]) {
        const { newValue } = changes[storageKey];
        subscriber.next(newValue ?? []);
      }
    }

    browser.storage.onChanged.addListener(callback);

    const safariChangeSubscription: Subscription = safariWebExtensionStorageChangeListener<
      EncryptedWallet[]
    >(storageKey).subscribe((nextValue) => {
      subscriber.next(nextValue ?? []);
    });

    readWalletStorage().then((wallets) => {
      subscriber.next(wallets);
    });

    return () => {
      browser.storage.onChanged.removeListener(callback);
      safariChangeSubscription.unsubscribe();
    };
  });
}
