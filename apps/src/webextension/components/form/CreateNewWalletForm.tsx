import { FormLayout } from '@libs/station-ui/components/FormLayout';
import { WalletCardDesignSelector } from '@libs/wallet-card/components/WalletCardDesignSelector';
import { TextField } from '@material-ui/core';
import {
  createMnemonicKey,
  validatePasswordConfirm,
  validateWalletName,
  validateWalletPassword,
} from '@terra-dev/web-extension-backend';
import { MnemonicKey } from '@terra-money/terra.js';
import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useStore } from 'webextension/contexts/store';
import { cardDesigns } from '../../env';

/** @deprecated */
export interface CreateNewWalletResult {
  name: string;
  design: string;
  password: string;
  mk: MnemonicKey;
}

/** @deprecated */
export interface CreateNewWalletFormProps {
  onChange: (_: CreateNewWalletResult | null) => void;
}

/** @deprecated */
export function CreateNewWalletForm({ onChange }: CreateNewWalletFormProps) {
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

  const mk = useMemo(() => {
    return createMnemonicKey();
  }, []);

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

  // ---------------------------------------------
  // effects
  // ---------------------------------------------
  useEffect(() => {
    if (!!invalidName || !!invalidPassword) {
      onChange(null);
    } else if (name.length > 0 && password.length > 0) {
      onChange({
        name,
        design,
        password,
        mk,
      });
    } else {
      onChange(null);
    }
  }, [design, invalidName, invalidPassword, mk, name, onChange, password]);

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
        cardWidth={210}
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
          type="password"
          size="small"
          label="WALLET PASSWORD CONFIRM"
          InputLabelProps={{ shrink: true }}
          value={passwordConfirm}
          error={!!invalidPasswordConfirm}
          helperText={invalidPasswordConfirm}
          onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
            setPasswordConfirm(target.value)
          }
        />
      </FormLayout>

      <MnemonicSection style={{ margin: '1em 0' }}>
        {mk.mnemonic}
      </MnemonicSection>
    </>
  );
}

const MnemonicSection = styled.section`
  border: 1px solid red;
  border-radius: 12px;

  padding: 1em;
`;
