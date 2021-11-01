import { vibrate } from '@libs/ui';
import { Button, SingleLineFormContainer } from '@station/ui';
import {
  EncryptedWallet,
  LedgerWallet,
  restoreMnemonicKey,
  validateMnemonicKey,
} from '@terra-dev/web-extension-backend';
import { MnemonicKey } from '@terra-money/terra.js';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FormMain } from 'webextension/components/layouts/FormMain';
import { FormFooter } from '../layouts/FormFooter';

export interface RecoverWalletProps {
  className?: string;
  wallets: (EncryptedWallet | LedgerWallet)[];
  onConfirm: (mk: MnemonicKey) => void;
}

export function RecoverWallet({
  className,
  wallets,
  onConfirm,
}: RecoverWalletProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [mnemonic, setMnemonic] = useState<string>('');

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
      const mk = restoreMnemonicKey(mnemonic);

      if (wallets.some(({ terraAddress }) => terraAddress === mk.accAddress)) {
        containerRef.current?.animate(vibrate, { duration: 100 });
        setError('Same address exists');
      } else {
        onConfirm(mk);
      }
    } catch (err) {
      containerRef.current?.animate(vibrate, { duration: 100 });

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    }
  }, [mnemonic, onConfirm, wallets]);

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
