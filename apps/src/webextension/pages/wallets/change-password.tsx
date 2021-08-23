import { Button, TextField } from '@material-ui/core';
import { FormLayout } from '@packages/station-ui/components/FormLayout';
import { FormSection } from '@packages/station-ui/components/FormSection';
import {
  decryptWallet,
  EncryptedWallet,
  encryptWallet,
  Wallet,
} from '@terra-dev/wallet';
import {
  findWallet,
  updateWallet,
  useValidateWalletPassword,
} from '@terra-dev/web-extension/backend';
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

  const [undefinedWallet, setUndefinedWallet] = useState<boolean>(false);

  const [currentPassword, setCurrentPassword] = useState<string>('');

  const [newPassword, setNewPassword] = useState<string>('');

  const invalidPassword = useValidateWalletPassword(newPassword);

  useEffect(() => {
    if (!match) {
      setEncryptedWallet(null);
    } else {
      const { terraAddress } = match.params;
      findWallet(terraAddress).then((wallet) => {
        if (wallet) {
          setEncryptedWallet(wallet);
        } else {
          setUndefinedWallet(true);
        }
      });
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

  if (undefinedWallet) {
    return (
      <FormSection>
        <p>Undefined Wallet...</p>

        <footer>
          <Button variant="contained" color="secondary" component={Link} to="/">
            Back to Home
          </Button>
        </footer>
      </FormSection>
    );
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
          error={!!invalidPassword}
          helperText={invalidPassword}
          onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
            setNewPassword(target.value)
          }
        />
      </FormLayout>

      <footer>
        <Button variant="contained" color="secondary" component={Link} to="/">
          Cancel
        </Button>

        <Button
          variant="contained"
          color="primary"
          disabled={
            !!invalidPassword ||
            currentPassword.length === 0 ||
            newPassword.length === 0
          }
          onClick={changePassword}
        >
          Change Password
        </Button>
      </footer>
    </FormSection>
  );
}
