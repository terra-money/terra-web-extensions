import { FormLayout } from '@libs/station-ui/components/FormLayout';
import { FormSection } from '@libs/station-ui/components/FormSection';
import { Button, TextField } from '@material-ui/core';
import {
  decryptWallet,
  EncryptedWallet,
  encryptWallet,
  findWallet,
  updateWallet,
  validateWalletPassword,
  Wallet,
} from '@terra-dev/web-extension-backend';
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';

export function WalletChangePassword({
  match,
  history,
}: RouteComponentProps<{ terraAddress: string }>) {
  // ---------------------------------------------
  // states
  // ---------------------------------------------
  const [
    encryptedWallet,
    setEncryptedWallet,
  ] = useState<EncryptedWallet | null>(null);

  const [undefinedWallet, setUndefinedWallet] = useState<boolean>(false);

  const [currentPassword, setCurrentPassword] = useState<string>('');

  const [newPassword, setNewPassword] = useState<string>('');

  // ---------------------------------------------
  // logics
  // ---------------------------------------------
  const invalidPassword = useMemo(() => {
    return validateWalletPassword(newPassword);
  }, [newPassword]);

  // ---------------------------------------------
  // effects
  // ---------------------------------------------
  useEffect(() => {
    if (!match) {
      setEncryptedWallet(null);
    } else {
      const { terraAddress } = match.params;
      findWallet(terraAddress).then((wallet) => {
        if (wallet && 'encryptedWallet' in wallet) {
          setEncryptedWallet(wallet);
        } else {
          setUndefinedWallet(true);
        }
      });
    }
  }, [match]);

  // ---------------------------------------------
  // callbacks
  // ---------------------------------------------
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

  // ---------------------------------------------
  // presentation
  // ---------------------------------------------
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
