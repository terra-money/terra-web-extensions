import { validateMnemonic } from '@terra-money/key-utils';
import { EncryptedWallet } from '../models/InternalWallet';
import { LedgerWallet } from '../models/LedgerWallet';

export enum WalletNameInvalid {
  SAME_NAME_EXISTS = 'SAME_NAME_EXISTS',
}

export function validateWalletName(
  name: string,
  wallets: (EncryptedWallet | LedgerWallet)[],
): WalletNameInvalid | null {
  if (name.length === 0) {
    return null;
  }

  return wallets.length > 0 &&
    wallets.some((itemWallet) => itemWallet.name === name)
    ? WalletNameInvalid.SAME_NAME_EXISTS
    : null;
}

export enum WalletPasswordInvalid {
  TOO_SHORT = 'TOO_SHORT',
}

export function validateWalletPassword(
  password: string,
): WalletPasswordInvalid | null {
  if (password.length === 0) {
    return null;
  }

  return password.length < 10 ? WalletPasswordInvalid.TOO_SHORT : null;
}

export enum MnemonicKeyInvalid {
  INVALID_MNEMONIC_KEY = 'INVALID_MNEMONIC_KEY',
}

export function validateMnemonicKey(
  mnemonic: string,
): MnemonicKeyInvalid | null {
  if (mnemonic.length === 0) {
    return null;
  }

  return !validateMnemonic(mnemonic)
    ? MnemonicKeyInvalid.INVALID_MNEMONIC_KEY
    : null;
}
