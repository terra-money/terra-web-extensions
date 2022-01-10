import { WebExtensionLedgerError } from '@terra-dev/web-extension-interface';
import {
  addWallet,
  connectLedger,
  findWallet,
} from '@terra-dev/web-extension-backend';
import React, { useCallback } from 'react';
import { ConnectLedger } from 'frame/components/views/ConnectLedger';
import { useStore } from 'frame/contexts/store';

export function ConnectLedgerPopup() {
  const { wallets } = useStore();

  // ---------------------------------------------
  // callbacks
  // ---------------------------------------------
  const connect = useCallback(async (name: string, design: string) => {
    const ledgerWallet = await connectLedger();

    if (ledgerWallet) {
      const existsWallet = await findWallet(ledgerWallet.terraAddress);

      if (!existsWallet) {
        const wallet = {
          ...ledgerWallet,
          name,
          design,
        };

        await addWallet(wallet);

        window.close();
      } else {
        throw new WebExtensionLedgerError(
          99999,
          `${ledgerWallet.terraAddress}는 이미 추가된 Wallet 입니다.`,
        );
      }
    }
  }, []);

  const cancel = useCallback(() => {
    window.close();
  }, []);

  return (
    <ConnectLedger wallets={wallets} onConnect={connect} onCancel={cancel} />
  );
}
