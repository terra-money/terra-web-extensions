import { Button, TextField } from '@material-ui/core';
import { FormLayout } from '@terra-dev/station-ui/components/FormLayout';
import { FormSection } from '@terra-dev/station-ui/components/FormSection';
import {
  createMnemonicKey,
  createWallet,
  EncryptedWallet,
  encryptWallet,
  Wallet,
} from '@terra-dev/wallet';
import { WalletCardDesignSelector } from '@terra-dev/wallet-card/components/WalletCardDesignSelector';
import { addWallet } from '@terra-dev/web-extension/backend';
import React, { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import styled from 'styled-components';
import { cardDesigns } from 'webextension/env';

export function WalletCreate({ history }: RouteComponentProps<{}>) {
  const [name, setName] = useState<string>('');
  const [design, setDesign] = useState<string>(
    () => cardDesigns[Math.floor(Math.random() * cardDesigns.length)],
  );
  const [password, setPassword] = useState<string>('');

  const mk = useMemo(() => {
    return createMnemonicKey();
  }, []);

  const create = useCallback(async () => {
    const wallet: Wallet = createWallet(mk);

    const encryptedWallet: EncryptedWallet = {
      name,
      design,
      terraAddress: mk.accAddress,
      encryptedWallet: encryptWallet(wallet, password),
    };

    await addWallet(encryptedWallet);

    history.push('/');
  }, [design, history, mk, name, password]);

  return (
    <FormSection>
      <header>
        <h1>Add New Wallet</h1>

        <WalletCardDesignSelector
          style={{ margin: '1em auto 3em auto' }}
          name={name}
          design={design}
          terraAddress="XXXXXXXXXXXXXXXXXXXXXXX"
          designs={cardDesigns}
          onChange={setDesign}
          cardWidth={276}
        />
      </header>

      <FormLayout>
        <TextField
          type="text"
          size="small"
          label="WALLET NAME"
          InputLabelProps={{ shrink: true }}
          value={name}
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
          onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
            setPassword(target.value)
          }
        />
      </FormLayout>

      <MnemonicSection style={{ margin: '1em 0' }}>
        {mk.mnemonic}
      </MnemonicSection>

      <footer>
        <Button variant="contained" color="secondary" component={Link} to="/">
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={create}>
          Create Wallet
        </Button>
      </footer>
    </FormSection>
  );
}

const MnemonicSection = styled.section`
  border: 1px solid red;
  border-radius: 12px;

  padding: 1em;
`;
