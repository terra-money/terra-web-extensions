import { EmptyNumberInput, vibrate } from '@libs/ui';
import { Button, SingleLineFormContainer } from '@station/ui';
import {
  EncryptedWallet,
  LedgerWallet,
  validateMnemonicKey,
} from '@terra-dev/web-extension-backend';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { getAvailableBIPWallets } from 'webextension/queries/getAvailableBIPWallets';
import { BIPWalletInfo } from '../../models/BIPWalletInfo';
import { FormFooter } from '../layouts/FormFooter';
import { FormMain } from '../layouts/FormMain';

export interface RecoverWalletProps {
  className?: string;
  wallets: (EncryptedWallet | LedgerWallet)[];
  onConfirm: (availableBipWallets: BIPWalletInfo[]) => void;
}

export function RecoverWallet({
  className,
  wallets,
  onConfirm,
}: RecoverWalletProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [mnemonic, setMnemonic] = useState<string>('');
  const [addressIndex, setAddressIndex] = useState<string>('');

  const invalidMnemonic = useMemo(() => {
    return validateMnemonicKey(mnemonic);
  }, [mnemonic]);

  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------
  // callbacks
  // ---------------------------------------------
  const updateMnemonic = useCallback(({ currentTarget }) => {
    setError(null);
    setMnemonic(currentTarget.value);
  }, []);

  const create = useCallback(async () => {
    try {
      const availableBipWallets = await getAvailableBIPWallets(
        mnemonic,
        addressIndex.length > 0 ? parseInt(addressIndex) : undefined,
      );

      const accAddresses = new Set<string>(
        availableBipWallets.map(({ mk }) => mk.accAddress),
      );

      if (
        availableBipWallets.length === 1 &&
        wallets.some(({ terraAddress }) => accAddresses.has(terraAddress))
      ) {
        containerRef.current?.animate(vibrate, { duration: 100 });
        setError('Same address exists');
      } else {
        onConfirm(availableBipWallets);
      }
    } catch (err) {
      containerRef.current?.animate(vibrate, { duration: 100 });

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    }
  }, [addressIndex, mnemonic, onConfirm, wallets]);

  // ---------------------------------------------
  // presentation
  // ---------------------------------------------
  return (
    <div ref={containerRef} className={className}>
      <FormMain>
        <SingleLineFormContainer
          label="Seed phrase"
          invalid={invalidMnemonic ?? error}
        >
          <textarea
            placeholder="word1 word2 word3 word4..."
            value={mnemonic}
            onChange={updateMnemonic}
            style={{
              resize: 'none',
              height: 80,
            }}
          />
        </SingleLineFormContainer>

        <SingleLineFormContainer label="Address Index">
          <EmptyNumberInput
            type="integer"
            maxIntegerPoints={7}
            value={addressIndex}
            onChange={setAddressIndex}
          />
        </SingleLineFormContainer>
      </FormMain>

      <FormFooter>
        <Button
          variant="primary"
          size="large"
          onClick={create}
          disabled={mnemonic.length === 0 || !!invalidMnemonic}
        >
          Recover
        </Button>
      </FormFooter>
    </div>
  );
}
