import { validateMnemonic } from '@terra-money/key-utils';
import { EncryptedWallet } from '../models/EncryptedWallet';
import { LedgerWallet } from '../models/LedgerWallet';

export enum WalletNameInvalid {
  SAME_NAME_EXISTS = 'SAME_NAME_EXISTS',
  TOO_SHORT = 'TOO_SHORT',
  TOO_LONG = 'TOO_LONG',
}

export const ignoreInvalid =
  (...ignoringInvalids: string[]) =>
  (invalid: string | null): string | null => {
    if (!invalid) return null;
    return ignoringInvalids.some((ignore) => invalid === ignore)
      ? null
      : invalid;
  };

export function validateWalletName(
  name: string,
  wallets: (EncryptedWallet | LedgerWallet)[],
): WalletNameInvalid | null {
  if (name.length === 0) {
    return null;
  }

  if (name.length < 4) {
    return WalletNameInvalid.TOO_SHORT;
  } else if (name.length > 20) {
    return WalletNameInvalid.TOO_LONG;
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

export enum PasswordConfirmInvalid {
  NOT_SAME = 'NOT_SAME',
}

export function validatePasswordConfirm(
  password: string,
  confirm: string,
): PasswordConfirmInvalid | null {
  if (password.length === 0 || confirm.length === 0) {
    return null;
  }

  return password !== confirm ? PasswordConfirmInvalid.NOT_SAME : null;
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
