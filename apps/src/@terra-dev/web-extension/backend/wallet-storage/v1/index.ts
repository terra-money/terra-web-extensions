import { safariWebExtensionStorageChangeListener } from '@terra-dev/safari-webextension-storage-change-listener';
import { EncryptedWallet } from '@terra-dev/wallet';
import { Observable, Subscription } from 'rxjs';
import { browser, Storage } from 'webextension-polyfill-ts';

const storageKey = 'terra_wallet_storage_v1-alpha.3';

export interface WalletStorageData {
  wallets: EncryptedWallet[];

  /**
   * extension focused wallet
   */
  focusedWalletAddress?: string;

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
export async function readWalletStorage(): Promise<WalletStorageData> {
  const values = await browser.storage.local.get(storageKey);
  return (
    values[storageKey] ??
    ({ wallets: [], approvedHostnames: [] } as WalletStorageData)
  );
}

export async function writeWalletStorage(
  data: WalletStorageData,
): Promise<void> {
  await browser.storage.local.set({
    [storageKey]: data,
  });
}

export async function findWallet(
  terraAddress: string,
): Promise<EncryptedWallet | undefined> {
  const { wallets } = await readWalletStorage();
  return wallets.find((wallet) => wallet.terraAddress === terraAddress);
}

export async function addWallet(wallet: EncryptedWallet): Promise<void> {
  const { wallets, focusedWalletAddress, ...data } = await readWalletStorage();
  const nextData = {
    ...data,
    wallets: [...wallets, wallet],
    focusedWalletAddress: wallet.terraAddress,
  };
  await writeWalletStorage(nextData);
}

export async function removeWallet(wallet: EncryptedWallet): Promise<void> {
  const { wallets, focusedWalletAddress, ...data } = await readWalletStorage();
  const removeIndex: number = wallets.findIndex(
    (itemWallet) => itemWallet.terraAddress === wallet.terraAddress,
  );

  if (removeIndex === -1) {
    return;
  }

  const nextWallets = [...wallets];
  nextWallets.splice(removeIndex, 1);

  const nextFocusedWallet: EncryptedWallet | undefined =
    nextWallets.length > 0
      ? nextWallets.find(
          (itemWallet) => itemWallet.terraAddress === focusedWalletAddress,
        ) ??
        nextWallets[
          Math.max(0, Math.min(nextWallets.length - 1, removeIndex - 1))
        ]
      : undefined;

  const nextData: WalletStorageData = {
    ...data,
    wallets: nextWallets,
    focusedWalletAddress: nextFocusedWallet?.terraAddress,
  };

  await writeWalletStorage(nextData);
}

export async function updateWallet(
  terraAddress: string,
  wallet: EncryptedWallet,
): Promise<void> {
  const { wallets, ...data } = await readWalletStorage();
  const updateIndex = wallets.findIndex(
    (findingWallet) => findingWallet.terraAddress === terraAddress,
  );

  if (updateIndex === -1) {
    return;
  }

  const nextWallets = [...wallets];
  nextWallets.splice(updateIndex, 1, wallet);

  await writeWalletStorage({ ...data, wallets: nextWallets });
}

export async function focusWallet(terraAddress: string): Promise<void> {
  const data = await readWalletStorage();

  await writeWalletStorage({
    ...data,
    focusedWalletAddress: terraAddress,
  });
}

export async function approveHostnames(...hostnames: string[]): Promise<void> {
  const { approvedHostnames, ...data } = await readWalletStorage();

  const nextApprovedHostnames = new Set<string>([
    ...approvedHostnames,
    ...hostnames,
  ]);

  await writeWalletStorage({
    ...data,
    approvedHostnames: Array.from(nextApprovedHostnames),
  });
}

export async function disapproveHostname(
  ...hostnames: string[]
): Promise<void> {
  const { approvedHostnames, ...data } = await readWalletStorage();

  const removeIndex = new Set(hostnames);

  const nextApprovedHostnames = approvedHostnames.filter(
    (itemHostname) => !removeIndex.has(itemHostname),
  );

  await writeWalletStorage({
    ...data,
    approvedHostnames: nextApprovedHostnames,
  });
}

export function observeWalletStorage(): Observable<WalletStorageData> {
  return new Observable<WalletStorageData>((subscriber) => {
    function callback(
      changes: Record<string, Storage.StorageChange>,
      areaName: string,
    ) {
      if (areaName === 'local' && changes[storageKey]) {
        const { newValue } = changes[storageKey];
        subscriber.next(
          newValue ??
            ({ wallets: [], approvedHostnames: [] } as WalletStorageData),
        );
      }
    }

    browser.storage.onChanged.addListener(callback);

    const safariChangeSubscription: Subscription = safariWebExtensionStorageChangeListener<WalletStorageData>(
      storageKey,
    ).subscribe((nextValue) => {
      subscriber.next(
        nextValue ??
          ({ wallets: [], approvedHostnames: [] } as WalletStorageData),
      );
    });

    readWalletStorage().then((data) => {
      subscriber.next(data);
    });

    return () => {
      browser.storage.onChanged.removeListener(callback);
      safariChangeSubscription.unsubscribe();
    };
  });
}
