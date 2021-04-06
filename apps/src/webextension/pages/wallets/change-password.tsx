import { Button, TextField } from '@material-ui/core';
import { FormLayout } from '@terra-dev/station-ui/components/FormLayout';
import { FormSection } from '@terra-dev/station-ui/components/FormSection';
import {
  decryptWallet,
  EncryptedWallet,
  encryptWallet,
  Wallet,
} from '@terra-dev/wallet';
import {
  findWallet,
  updateWallet,
} from '@terra-dev/webextension-wallet-storage';
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';

export function WalletChangePassword({
  match,
  history,
}: RouteComponentProps<{ terraAddress: string }>) {
  const [
    encryptedWallet,
    setEncryptedWallet,
  ] = useState<EncryptedWallet | null>(null);
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');

  useEffect(() => {
    if (!match) {
      setEncryptedWallet(null);
    } else {
      const { terraAddress } = match.params;
      findWallet(terraAddress).then((wallet) =>
        setEncryptedWallet(wallet ?? null),
      );
    }
  }, [match]);

  const changePassword = useCallback(async () => {
    if (!encryptedWallet) {
      return;
    }

    const wallet: Wallet = decryptWallet(
      encryptedWallet.encryptedWallet,
      currentPassword,
    );

    const nextWallet: EncryptedWallet = {
      ...encryptedWallet,
      encryptedWallet: encryptWallet(wallet, newPassword),
    };

    await updateWallet(encryptedWallet.terraAddress, nextWallet);

    history.push('/');
  }, [currentPassword, history, newPassword, encryptedWallet]);

  if (!encryptedWallet) {
    return null;
  }

  return (
    <FormSection>
      <header>
        <h1>Change Wallet Password</h1>
      </header>

      <FormLayout>
        <TextField
          type="text"
          size="small"
          label="WALLET NAME"
          InputLabelProps={{ shrink: true }}
          value={encryptedWallet.name}
          readOnly
        />

        <TextField
          type="password"
          size="small"
          label="CURRENT PASSWORD"
          InputLabelProps={{ shrink: true }}
          value={currentPassword}
          onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
            setCurrentPassword(target.value)
          }
        />

        <TextField
          type="password"
          size="small"
          label="NEW PASSWORD"
          InputLabelProps={{ shrink: true }}
          value={newPassword}
          onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
            setNewPassword(target.value)
          }
        />
      </FormLayout>

      <footer>
        <Button variant="contained" color="secondary" component={Link} to="/">
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={changePassword}>
          Change Password
        </Button>
      </footer>
    </FormSection>
  );
}
