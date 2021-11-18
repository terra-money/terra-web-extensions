import { WalletNetworkInfo } from '@terra-dev/wallet-interface';
import { NetworkStorageData, writeNetworkStorage } from './v1';

export async function migrateNetworkStorageV0(
  defaultNetworks: WalletNetworkInfo[],
): Promise<() => void> {
  const settingsData = localStorage.getItem('settings');

  if (!settingsData) {
    return () => {};
  }

  try {
    const settings = JSON.parse(settingsData);
    const nextStorage: NetworkStorageData = {
      networks: [],
      selectedNetwork: undefined,
    };

    if (
      'customNetworks' in settings &&
      Array.isArray(settings.customNetworks)
    ) {
      for (const item of settings.customNetworks) {
        if ('name' in item && 'chainID' in item && 'lcd' in item) {
          nextStorage.networks.push({
            name: item.name,
            chainID: item.chainID,
            lcd: item.lcd,
          });
        }
      }
    }

    if ('chain' in settings) {
      nextStorage.selectedNetwork = [
        ...defaultNetworks,
        ...nextStorage.networks,
      ].find(({ name }) => name === settings.chain);
    }

    await writeNetworkStorage(nextStorage);
  } catch (error) {
    console.error(`Failed migration [network/v0]`, error);
  }

  return () => {
    localStorage.removeItem('settings');
  };
}
