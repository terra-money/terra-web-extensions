import { AccAddress } from '@terra-money/terra.js';
import { EncryptedWallet } from '../../models';
import {
  readWalletsStorage,
  WalletsStorageData,
  writeWalletsStorage,
} from './v1';

const CARD_DESIGNS = [
  'terra',
  'anchor',
  'mirror',
  '#00a9b4',
  '#00ae69',
  '#6c19fe',
  '#f55275',
  '#fea00d',
];

export async function migrateWalletsStorageV0(): Promise<() => void> {
  const keysData = localStorage.getItem('keys');
  const settingsData = localStorage.getItem('settings');
  const storage = await readWalletsStorage();

  if (!keysData || storage.wallets.length > 0) {
    return () => {};
  }

  let prevFocusedWalletAddress: string | undefined = undefined;

  if (settingsData) {
    try {
      const settings = JSON.parse(settingsData);

      if (
        'user' in settings &&
        'address' in settings.user &&
        AccAddress.validate(settings.user.address)
      ) {
        prevFocusedWalletAddress = settings.user.address;
      }
    } catch {}
  }

  try {
    const keys = JSON.parse(keysData);

    if (Array.isArray(keys)) {
      const migratedWallets: EncryptedWallet[] = [];

      for (const item of keys) {
        if (
          'name' in item &&
          'address' in item &&
          AccAddress.validate(item.address) &&
          'wallet' in item
        ) {
          migratedWallets.push({
            name: item.name,
            terraAddress: item.address,
            encryptedWallet: item.wallet,
            design:
              CARD_DESIGNS[Math.floor(Math.random() * CARD_DESIGNS.length)],
          });
        }
      }

      let focusedWalletAddress: string | undefined = migratedWallets.some(
        ({ terraAddress }) => {
          return terraAddress === prevFocusedWalletAddress;
        },
      )
        ? prevFocusedWalletAddress
        : migratedWallets.length > 0
        ? migratedWallets[0].terraAddress
        : undefined;

      const nextStorage: WalletsStorageData = {
        wallets: migratedWallets,
        focusedWalletAddress,
      };

      await writeWalletsStorage(nextStorage);
    }
  } catch (error) {
    console.error(`Failed migration [wallets/v0]`, error);
  }

  return () => {
    localStorage.removeItem('keys');
    localStorage.removeItem('settings');
  };
}
