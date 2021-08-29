import { Observable, Subscription } from 'rxjs';
import { browser, Storage } from 'webextension-polyfill-ts';
import { EncryptedWallet } from '../../../models/InternalWallet';
import { LedgerWallet } from '../../../models/LedgerWallet';
import { safariWebExtensionStorageChangeListener } from '../../../utils/safariWebExtensionStorageChangeListener';

const storageKey = 'terra_wallet_storage_v1-alpha.3';

export interface WalletsStorageData {
  wallets: (EncryptedWallet | LedgerWallet)[];

  /**
   * extension focused wallet
   */
  focusedWalletAddress?: string;
}

// ---------------------------------------------
// storage
// ---------------------------------------------
export async function readWalletsStorage(): Promise<WalletsStorageData> {
  const values = await browser.storage.local.get(storageKey);
  return (
    values[storageKey] ??
    ({ wallets: [], approvedHostnames: [] } as WalletsStorageData)
  );
}

export async function writeWalletsStorage(
  data: WalletsStorageData,
): Promise<void> {
  await browser.storage.local.set({
    [storageKey]: data,
  });
}

export async function findWallet(
  terraAddress: string,
): Promise<EncryptedWallet | LedgerWallet | undefined> {
  const { wallets } = await readWalletsStorage();
  return wallets.find((wallet) => wallet.terraAddress === terraAddress);
}

export async function addWallet(
  wallet: EncryptedWallet | LedgerWallet,
): Promise<void> {
  const { wallets, focusedWalletAddress, ...data } = await readWalletsStorage();
  const nextData = {
    ...data,
    wallets: [...wallets, wallet],
    focusedWalletAddress: wallet.terraAddress,
  };
  await writeWalletsStorage(nextData);
}

export async function removeWallet(
  wallet: EncryptedWallet | LedgerWallet,
): Promise<void> {
  const { wallets, focusedWalletAddress, ...data } = await readWalletsStorage();
  const removeIndex: number = wallets.findIndex(
    (itemWallet) => itemWallet.terraAddress === wallet.terraAddress,
  );

  if (removeIndex === -1) {
    return;
  }

  const nextWallets = [...wallets];
  nextWallets.splice(removeIndex, 1);

  const nextFocusedWallet: EncryptedWallet | LedgerWallet | undefined =
    nextWallets.length > 0
      ? nextWallets.find(
          (itemWallet) => itemWallet.terraAddress === focusedWalletAddress,
        ) ??
        nextWallets[
          Math.max(0, Math.min(nextWallets.length - 1, removeIndex - 1))
        ]
      : undefined;

  const nextData: WalletsStorageData = {
    ...data,
    wallets: nextWallets,
    focusedWalletAddress: nextFocusedWallet?.terraAddress,
  };

  await writeWalletsStorage(nextData);
}

export async function updateWallet(
  terraAddress: string,
  wallet: EncryptedWallet,
): Promise<void> {
  const { wallets, ...data } = await readWalletsStorage();
  const updateIndex = wallets.findIndex(
    (findingWallet) => findingWallet.terraAddress === terraAddress,
  );

  if (updateIndex === -1) {
    return;
  }

  const nextWallets = [...wallets];
  nextWallets.splice(updateIndex, 1, wallet);

  await writeWalletsStorage({ ...data, wallets: nextWallets });
}

export async function focusWallet(terraAddress: string): Promise<void> {
  const data = await readWalletsStorage();

  await writeWalletsStorage({
    ...data,
    focusedWalletAddress: terraAddress,
  });
}

export function observeWalletsStorage(): Observable<WalletsStorageData> {
  return new Observable<WalletsStorageData>((subscriber) => {
    function callback(
      changes: Record<string, Storage.StorageChange>,
      areaName: string,
    ) {
      if (areaName === 'local' && changes[storageKey]) {
        const { newValue } = changes[storageKey];
        subscriber.next(
          newValue ??
            ({ wallets: [], approvedHostnames: [] } as WalletsStorageData),
        );
      }
    }

    browser.storage.onChanged.addListener(callback);

    const safariChangeSubscription: Subscription = safariWebExtensionStorageChangeListener<WalletsStorageData>(
      storageKey,
    ).subscribe((nextValue) => {
      subscriber.next(
        nextValue ??
          ({ wallets: [], approvedHostnames: [] } as WalletsStorageData),
      );
    });

    readWalletsStorage().then((data) => {
      subscriber.next(data);
    });

    return () => {
      browser.storage.onChanged.removeListener(callback);
      safariChangeSubscription.unsubscribe();
    };
  });
}
