import { WalletCardDesignSelector } from '@station/wallet-card/components/WalletCardDesignSelector';
import { Button } from '@material-ui/core';
import { FormLabel, FormLayout, Layout, TextInput } from '@station/ui';
import {
  restoreMnemonicKey,
  validateMnemonicKey,
  validatePasswordConfirm,
  validateWalletName,
  validateWalletPassword,
} from '@terra-dev/web-extension-backend';
import { MnemonicKey } from '@terra-money/terra.js';
import React, {
  ChangeEvent,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { PasswordStrength } from 'webextension/components/form/PasswordStrength';
import { useStore } from 'webextension/contexts/store';
import { cardDesigns } from 'webextension/env';

export interface RecoverWalletResult {
  name: string;
  design: string;
  password: string;
  mk: MnemonicKey;
}

export interface RecoverWalletProps {
  className?: string;
  onCancel: () => void;
  onCreate: (recoverWallet: RecoverWalletResult) => void;
  children?: ReactNode;
}

export function RecoverWallet({
  className,
  onCancel,
  onCreate,
  children,
}: RecoverWalletProps) {
  // ---------------------------------------------
  // queries
  // ---------------------------------------------
  const { wallets } = useStore();

  // ---------------------------------------------
  // states
  // ---------------------------------------------
  const [name, setName] = useState<string>('');

  const [design, setDesign] = useState<string>(
    () => cardDesigns[Math.floor(Math.random() * cardDesigns.length)],
  );

  const [password, setPassword] = useState<string>('');

  const [passwordConfirm, setPasswordConfirm] = useState<string>('');

  const [mnemonic, setMnemonic] = useState<string>('');

  // ---------------------------------------------
  // logics
  // ---------------------------------------------
  const invalidName = useMemo(() => {
    return validateWalletName(name, wallets);
  }, [name, wallets]);

  const invalidPassword = useMemo(() => {
    return validateWalletPassword(password);
  }, [password]);

  const invalidPasswordConfirm = useMemo(() => {
    return validatePasswordConfirm(password, passwordConfirm);
  }, [password, passwordConfirm]);

  const invalidMnemonic = useMemo(() => {
    return validateMnemonicKey(mnemonic);
  }, [mnemonic]);

  // ---------------------------------------------
  // callbacks
  // ---------------------------------------------
  const create = useCallback(async () => {
    const mk = restoreMnemonicKey(mnemonic);

    onCreate({
      name,
      design,
      password,
      mk,
    });
  }, [mnemonic, onCreate, name, design, password]);

  // ---------------------------------------------
  // presentation
  // ---------------------------------------------
  return (
    <Layout className={className}>
      {children}

      <WalletCardDesignSelector
        style={{ margin: '1em auto 3em auto' }}
        name={name}
        design={design}
        terraAddress="XXXXXXXXXXXXXXXXXXXXXXX"
        designs={cardDesigns}
        onChange={setDesign}
        cardWidth={210}
      />

      <FormLayout>
        <FormLabel label="Wallet name">
          <TextInput
            fullWidth
            placeholder="Enter 5-20 alphanumeric characters"
            value={name}
            error={!!invalidName}
            helperText={invalidName}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
              setName(target.value)
            }
          />
        </FormLabel>

        <FormLabel label="Password">
          <TextInput
            fullWidth
            type="password"
            placeholder="Must be at least 10 characters"
            value={password}
            error={!!invalidPassword}
            helperText={invalidPassword}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
              setPassword(target.value)
            }
          />
        </FormLabel>

        <PasswordStrength password={password} />

        <FormLabel label="Password">
          <TextInput
            fullWidth
            type="password"
            placeholder="Confirm your password"
            value={passwordConfirm}
            error={!!invalidPasswordConfirm}
            helperText={invalidPasswordConfirm}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
              setPasswordConfirm(target.value)
            }
          />
        </FormLabel>

        <FormLabel label="Seed phrase">
          <TextInput
            fullWidth
            multiline
            rows={2}
            value={mnemonic}
            error={!!invalidMnemonic}
            helperText={invalidMnemonic}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
              setMnemonic(target.value)
            }
          />
        </FormLabel>
      </FormLayout>

      <footer>
        <Button variant="contained" color="secondary" onClick={onCancel}>
          Cancel
        </Button>

        <Button
          variant="contained"
          color="primary"
          disabled={
            name.length === 0 ||
            password.length === 0 ||
            passwordConfirm.length === 0 ||
            mnemonic.length === 0 ||
            !!invalidName ||
            !!invalidPassword ||
            !!invalidPasswordConfirm ||
            !!invalidMnemonic
          }
          onClick={create}
        >
          Next
        </Button>
      </footer>
    </Layout>
  );
}
