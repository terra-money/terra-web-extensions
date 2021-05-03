import { Button, TextField } from '@material-ui/core';
import { FormLayout } from '@terra-dev/station-ui/components/FormLayout';
import { FormSection } from '@terra-dev/station-ui/components/FormSection';
import {
  createWallet,
  EncryptedWallet,
  encryptWallet,
  restoreMnemonicKey,
  Wallet,
} from '@terra-dev/wallet';
import { WalletCardDesignSelector } from '@terra-dev/wallet-card/components/WalletCardDesignSelector';
import { addWallet } from '@terra-dev/web-extension/backend';
import React, { ChangeEvent, useCallback, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { cardDesigns } from 'webextension/env';

export function WalletRecover({ history }: RouteComponentProps<{}>) {
  const [name, setName] = useState<string>('');
  const [design, setDesign] = useState<string>(
    () => cardDesigns[Math.floor(Math.random() * cardDesigns.length)],
  );
  const [password, setPassword] = useState<string>('');
  const [mnemonic, setMnemonic] = useState<string>('');

  const restore = useCallback(async () => {
    const mk = restoreMnemonicKey(mnemonic);

    const wallet: Wallet = createWallet(mk);

    const encryptedWallet: EncryptedWallet = {
      name,
      design,
      terraAddress: mk.accAddress,
      encryptedWallet: encryptWallet(wallet, password),
    };

    await addWallet(encryptedWallet);

    history.push('/');
  }, [design, history, mnemonic, name, password]);

  return (
    <FormSection>
      <header>
        <h1>Recover Existing Wallet</h1>

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

        <TextField
          type="text"
          multiline
          size="small"
          label="MNEMONIC KEY"
          InputLabelProps={{ shrink: true }}
          value={mnemonic}
          onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
            setMnemonic(target.value)
          }
        />
      </FormLayout>

      <footer>
        <Button variant="contained" color="secondary" component={Link} to="/">
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={restore}>
          Recover Wallet
        </Button>
      </footer>
    </FormSection>
  );
}
