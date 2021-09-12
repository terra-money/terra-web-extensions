import { FormLayout } from '@station/ui';
import { WalletCardDesignSelector } from '@station/wallet-card/components/WalletCardDesignSelector';
import { TextField } from '@material-ui/core';
import {
  validateMnemonicKey,
  validateWalletName,
  validateWalletPassword,
} from '@terra-dev/web-extension-backend';
import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useStore } from 'webextension/contexts/store';
import { cardDesigns } from '../../env';

export interface RecoverMnemonicResult {
  name: string;
  design: string;
  password: string;
  mnemonic: string;
}

export interface RecoverMnemonicFormProps {
  onChange: (_: RecoverMnemonicResult | null) => void;
}

export function RecoverMnemonicForm({ onChange }: RecoverMnemonicFormProps) {
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

  const invalidMnemonic = useMemo(() => {
    return validateMnemonicKey(mnemonic);
  }, [mnemonic]);

  // ---------------------------------------------
  // effects
  // ---------------------------------------------
  useEffect(() => {
    if (!!invalidName || !!invalidPassword || !!invalidMnemonic) {
      onChange(null);
    } else if (name.length > 0 && password.length > 0 && mnemonic.length > 0) {
      onChange({
        name,
        design,
        password,
        mnemonic,
      });
    } else {
      onChange(null);
    }
  }, [
    design,
    invalidMnemonic,
    invalidName,
    invalidPassword,
    mnemonic,
    name,
    onChange,
    password,
  ]);

  // ---------------------------------------------
  // presentation
  // ---------------------------------------------
  return (
    <>
      <WalletCardDesignSelector
        style={{ margin: '1em auto 3em auto' }}
        name={name}
        design={design}
        terraAddress="XXXXXXXXXXXXXXXXXXXXXXX"
        designs={cardDesigns}
        onChange={setDesign}
        cardWidth={276}
      />

      <FormLayout>
        <TextField
          type="text"
          size="small"
          label="WALLET NAME"
          InputLabelProps={{ shrink: true }}
          value={name}
          error={!!invalidName}
          helperText={invalidName}
          onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
            setName(target.value)
          }
        />

        <TextField
          type="password"
          size="small"
          label="WALLET PASSWORD"
          InputLabelProps={{ shrink: true }}
          value={password}
          error={!!invalidPassword}
          helperText={invalidPassword}
          onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
            setPassword(target.value)
          }
        />

        <TextField
          type="text"
          multiline
          size="small"
          label="MNEMONIC KEY"
          InputLabelProps={{ shrink: true }}
          value={mnemonic}
          error={!!invalidMnemonic}
          helperText={invalidMnemonic}
          onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
            setMnemonic(target.value)
          }
        />
      </FormLayout>
    </>
  );
}
