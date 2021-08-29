import { validateMnemonic } from '@terra-money/key-utils';
import { useEffect, useMemo, useState } from 'react';
import { EncryptedWallet } from '../models/InternalWallet';
import { LedgerWallet } from '../models/LedgerWallet';
import { readWalletsStorage } from '../storages/wallets';

export enum WalletNameInvalid {
  SAME_NAME_EXISTS = 'SAME_NAME_EXISTS',
}

export function useValidateWalletName(name: string): WalletNameInvalid | null {
  const [currentWallets, setCurrentWallets] = useState<
    (EncryptedWallet | LedgerWallet)[]
  >([]);

  useEffect(() => {
    readWalletsStorage().then(({ wallets }) => setCurrentWallets(wallets));
  }, []);

  return useMemo<WalletNameInvalid | null>(() => {
    if (name.length === 0) {
      return null;
    }

    return currentWallets.length > 0 &&
      currentWallets.some((itemWallet) => itemWallet.name === name)
      ? WalletNameInvalid.SAME_NAME_EXISTS
      : null;
  }, [currentWallets, name]);
}

export enum WalletPasswordInvalid {
  TOO_SHORT = 'TOO_SHORT',
}

export function useValidateWalletPassword(
  password: string,
): WalletPasswordInvalid | null {
  return useMemo<WalletPasswordInvalid | null>(() => {
    if (password.length === 0) {
      return null;
    }

    return password.length < 10 ? WalletPasswordInvalid.TOO_SHORT : null;
  }, [password.length]);
}

export enum MnemonicKeyInvalid {
  INVALID_MNEMONIC_KEY = 'INVALID_MNEMONIC_KEY',
}

export function useValidateMnemonicKey(
  mnemonic: string,
): MnemonicKeyInvalid | null {
  return useMemo<MnemonicKeyInvalid | null>(() => {
    if (mnemonic.length === 0) {
      return null;
    }

    return !validateMnemonic(mnemonic)
      ? MnemonicKeyInvalid.INVALID_MNEMONIC_KEY
      : null;
  }, [mnemonic]);
}