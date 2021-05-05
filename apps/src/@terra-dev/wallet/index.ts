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

/**
 * Data type for storage and UI
 * This information is not protected (someone access)
 */
export interface WalletInfo {
  /**
   * Wallet display name
   * This should be primary key
   */
  name: string;

  /**
   * Wallet address
   */
  terraAddress: string;

  /**
   * Wallet design
   * 1. some theme name (terra, anchor...)
   * 2. color hex (#ffffff, #000000...)
   */
  design: string;
}

export interface EncryptedWallet extends WalletInfo {
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
  return {
    privateKey: mk.privateKey.toString('hex'),
    publicKey: mk.publicKey?.toString('hex') ?? '',
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
  return JSON.parse(decrypt(encrypedWallet, password));
}
