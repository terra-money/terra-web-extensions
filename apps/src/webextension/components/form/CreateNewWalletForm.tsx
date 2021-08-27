import { TextField } from '@material-ui/core';
import { FormLayout } from '@libs/station-ui/components/FormLayout';
import { createMnemonicKey } from 'webextension/backend/models/wallet';
import { WalletCardDesignSelector } from '@libs/wallet-card/components/WalletCardDesignSelector';
import { MnemonicKey } from '@terra-money/terra.js';
import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { cardDesigns } from '../../env';
import {
  useValidateWalletName,
  useValidateWalletPassword,
} from 'webextension/backend/logics/wallet';

export interface CreateNewWalletResult {
  name: string;
  design: string;
  password: string;
  mk: MnemonicKey;
}

export interface CreateNewWalletFormProps {
  onChange: (_: CreateNewWalletResult | null) => void;
}

export function CreateNewWalletForm({ onChange }: CreateNewWalletFormProps) {
  const [name, setName] = useState<string>('');

  const [design, setDesign] = useState<string>(
    () => cardDesigns[Math.floor(Math.random() * cardDesigns.length)],
  );

  const [password, setPassword] = useState<string>('');

  const mk = useMemo(() => {
    return createMnemonicKey();
  }, []);

  const invalidName = useValidateWalletName(name);

  const invalidPassword = useValidateWalletPassword(password);

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
