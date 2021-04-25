import { safariWebExtensionStorageChangeListener } from '@terra-dev/safari-webextension-storage-change-listener';
import { EncryptedWallet } from '@terra-dev/wallet';
import { Observable, Subscription } from 'rxjs';
import { browser, Storage } from 'webextension-polyfill-ts';

const storageKey = 'terra_wallet_storage_v1-alpha.1';

export interface WalletStorageData {
  wallets: EncryptedWallet[];

  /**
   * extension focused wallet
   */
  focusedWalletAddress?: string;

  /**
   * approved wallet addresses per hostname
   *
   * Record<hostname, terraAddress[]>
   */
  approvedAddresses: Record<string, string[]>;
}

// ---------------------------------------------
// storage
// ---------------------------------------------
export async function readWalletStorage(): Promise<WalletStorageData> {
  const values = await browser.storage.local.get(storageKey);
  return values[storageKey] ?? { wallets: [], approvedAddresses: {} };
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
    wallets: [...wallets, wallet],
    focusedWalletAddress: wallet.terraAddress,
    ...data,
  };
  await writeWalletStorage(nextData);
}

export async function removeWallet(wallet: EncryptedWallet): Promise<void> {
  const { wallets, approvedAddresses } = await readWalletStorage();
  const removeIndex: number = wallets.findIndex(
    (itemWallet) => itemWallet.terraAddress === wallet.terraAddress,
  );

  if (removeIndex === -1) {
    return;
  }

  const nextWallets = [...wallets].splice(removeIndex, 1);
  const nextFocusedWallet: EncryptedWallet =
    nextWallets[Math.max(0, Math.min(nextWallets.length - 1, removeIndex - 1))];
  const nextApprovedAddresses = Object.keys(approvedAddresses).reduce(
    (addresses, hostname) => {
      const prevAddresses = approvedAddresses[hostname];
      if (prevAddresses.indexOf(wallet.terraAddress) > -1) {
        addresses[hostname] = prevAddresses.filter(
          (itemAddress) => itemAddress !== wallet.terraAddress,
        );
      } else {
        addresses[hostname] = prevAddresses;
      }
      return addresses;
    },
    {} as Record<string, string[]>,
  );
  const nextData: WalletStorageData = {
    wallets: nextWallets,
    focusedWalletAddress: nextFocusedWallet.terraAddress,
    approvedAddresses: nextApprovedAddresses,
  };
  await writeWalletStorage(nextData);
}

export async function updateWallet(
  terraAddress: string,
  wallet: EncryptedWallet,
): Promise<void> {
  const { wallets, ...data } = await readWalletStorage();
  const index = wallets.findIndex(
    (findingWallet) => findingWallet.terraAddress === terraAddress,
  );

  if (index === -1) {
    return;
  }

  const nextWallets = [...wallets];
  nextWallets.splice(index, 1, wallet);

  await writeWalletStorage({ wallets: nextWallets, ...data });
}

export async function focusWallet(terraAddress: string): Promise<void> {
  const data = await readWalletStorage();

  await writeWalletStorage({
    ...data,
    focusedWalletAddress: terraAddress,
  });
}

export async function approveAddresses(
  hostname: string,
  walletTerraAddresses: string[],
): Promise<void> {
  const { approvedAddresses, ...data } = await readWalletStorage();

  const nextApprovedAddresses = {
    ...approvedAddresses,
    [hostname]: walletTerraAddresses,
  };

  await writeWalletStorage({
    ...data,
    approvedAddresses: nextApprovedAddresses,
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
        subscriber.next(newValue ?? []);
      }
    }

    browser.storage.onChanged.addListener(callback);

    const safariChangeSubscription: Subscription = safariWebExtensionStorageChangeListener<WalletStorageData>(
      storageKey,
    ).subscribe((nextValue) => {
      subscriber.next(nextValue ?? []);
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
