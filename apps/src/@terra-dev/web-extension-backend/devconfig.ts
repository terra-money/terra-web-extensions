import { WebExtensionNetworkInfo } from '@terra-dev/web-extension-interface';
import { browser } from 'webextension-polyfill-ts';
import {
  writeCW20Storage,
  writeHostnamesStorage,
  writeNetworkStorage,
  writeWalletsStorage,
} from './interfaces';
import {
  createWallet,
  EncryptedWallet,
  encryptWallet,
  restoreMnemonicKey,
} from './models';

export interface DevConfigWallet {
  name: string;
  mnemonic: string;
  password?: string;
}

export interface DevConfig {
  networks?: WebExtensionNetworkInfo[];
  selectedNetwork?: string;
  wallets: DevConfigWallet[];
  selectedWallet?: string;
  cw20Tokens?: { [chainID: string]: string[] };
  approvedHostnames?: string[];
}

export async function devconfig() {
  const manifest = browser.runtime.getManifest();

  if (!('terra_test_config' in manifest)) {
    return;
  }

  try {
    //@ts-ignore
    const config: DevConfig = manifest['terra_test_config'];

    console.log('START RESTORE TEST_CONFIG!', config);

    if (Array.isArray(config.networks) || config.selectedWallet) {
      await writeNetworkStorage({
        networks: config.networks ?? [],
        selectedNetwork:
          config.selectedNetwork === 'mainnet'
            ? {
                name: 'mainnet',
                chainID: 'columnbus-5',
                lcd: 'https://lcd.terra.dev',
              }
            : config.selectedNetwork === 'testnet'
            ? {
                name: 'testnet',
                chainID: 'bombay-12',
                lcd: 'https://bombay-lcd.terra.dev',
              }
            : config.networks?.find(
                ({ name }) => name === config.selectedNetwork,
              ),
      });
    }

    const wallets: EncryptedWallet[] = config.wallets.map(
      ({ name, mnemonic, password }) => {
        const mk = restoreMnemonicKey(mnemonic);
        const wallet = createWallet(mk);
        const encryptedWallet = encryptWallet(wallet, password ?? '1234567890');
        return {
          name,
          terraAddress: mk.accAddress,
          encryptedWallet,
          design: 'terra',
        };
      },
    );

    await writeWalletsStorage({
      wallets,
      focusedWalletAddress: config.selectedWallet
        ? wallets.find(({ name }) => name === config.selectedWallet)
            ?.terraAddress
        : undefined,
    });

    if (config.cw20Tokens) {
      await writeCW20Storage({
        cw20Tokens: config.cw20Tokens,
      });
    }

    if (config.approvedHostnames) {
      await writeHostnamesStorage({
        approvedHostnames: config.approvedHostnames,
      });
    }
  } catch (error) {
    console.error(`Failed set test config!`, error);
  }
}
