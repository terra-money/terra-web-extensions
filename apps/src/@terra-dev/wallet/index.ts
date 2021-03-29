import { decrypt, encrypt } from '@terra-dev/crypto';
import { MnemonicKey } from '@terra-money/terra.js';

export type EncryptedWalletString = string & { __nominal: 'encrypted-wallet' };

export interface Wallet {
  privateKey: string;
  publicKey: string;
  terraAddress: string;
}

export interface WalletInfo {
  name: string;
  terraAddress: string;
}

export interface EncryptedWallet extends WalletInfo {
  encryptedWallet: EncryptedWalletString;
}

export function createMnemonicKey(): MnemonicKey {
  return new MnemonicKey({ coinType: 330 });
}

export function restoreMnemonicKey(mnemonic: string): MnemonicKey {
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