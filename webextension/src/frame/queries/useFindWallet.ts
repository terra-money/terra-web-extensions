import {
  EncryptedWallet,
  findWallet,
  LedgerWallet,
} from '@terra-dev/web-extension-backend';
import { useEffect, useState } from 'react';

export enum FindWalletStatus {
  IN_PROGRESS,
  NOT_FOUND,
}

export function useFindWallet(
  terraAddress: string,
): LedgerWallet | EncryptedWallet | FindWalletStatus {
  const [wallet, setWallet] = useState<
    LedgerWallet | EncryptedWallet | FindWalletStatus
  >(FindWalletStatus.IN_PROGRESS);

  useEffect(() => {
    setWallet(FindWalletStatus.IN_PROGRESS);

    findWallet(terraAddress).then((foundWallet) => {
      setWallet(foundWallet ?? FindWalletStatus.NOT_FOUND);
    });
  }, [terraAddress]);

  return wallet;
}
