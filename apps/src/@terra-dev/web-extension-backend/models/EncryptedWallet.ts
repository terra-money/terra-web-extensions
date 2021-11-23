import { WebExtensionWalletInfo } from '@terra-dev/web-extension-interface';
import { decrypt, encrypt, validateMnemonic } from '@terra-money/key-utils';
import { MnemonicKey } from '@terra-money/terra.js';

export interface Wallet {
  privateKey: string;
  publicKey: string;
  terraAddress: string;
}

/**
 * EncryptedWalletString = encrypt(JSON.stringify(Wallet))
 */
export type EncryptedWalletString = string & { __nominal: 'encrypted-wallet' };

export interface EncryptedWallet extends WebExtensionWalletInfo {
  encryptedWallet: EncryptedWalletString;
}

export function createMnemonicKey(): MnemonicKey {
  return new MnemonicKey({ coinType: 330 });
}

export function restoreMnemonicKey(mnemonic: string): MnemonicKey {
  if (!validateMnemonic(mnemonic)) {
    throw new Error(`mnemonic key is invalid!`);
  }
  return new MnemonicKey({ mnemonic, coinType: 330 });
}

export function createWallet(mk: MnemonicKey): Wallet {
  if (!mk.publicKey) {
    throw new Error(`Can't find publicKey from this MnemonicKey`);
  }

  return {
    privateKey: mk.privateKey.toString('hex'),
    //publicKey: mk.publicKey?.toString('hex') ?? '',
    publicKey: Buffer.from(mk.publicKey.encodeAminoPubkey()).toString('hex'),
    terraAddress: mk.accAddress,
  };
}

export function encryptWallet(
  wallet: Wallet,
  password: string,
): EncryptedWalletString {
  return encrypt(JSON.stringify(wallet), password) as EncryptedWalletString;
}

export function decryptWallet(
  encrypedWallet: EncryptedWalletString,
  password: string,
): Wallet {
  try {
    return JSON.parse(decrypt(encrypedWallet, password));
  } catch {
    throw new Error('Password is wrong');
  }
}
