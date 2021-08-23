import { Button } from '@material-ui/core';
import { FormSection } from '@packages/station-ui/components/FormSection';
import {
  createWallet,
  EncryptedWallet,
  encryptWallet,
} from '@terra-dev/wallet';
import React, { useCallback, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { addWallet } from 'webextension/backend/wallet-storage';
import {
  CreateNewWalletForm,
  CreateNewWalletResult,
} from '../../components/form/CreateNewWalletForm';

export function WalletCreate({ history }: RouteComponentProps<{}>) {
  const [result, setResult] = useState<CreateNewWalletResult | null>(null);

  const create = useCallback(async () => {
    if (!result) {
      throw new Error(`Don't call when result is empty!`);
    }

    const encryptedWallet: EncryptedWallet = {
      name: result.name,
      design: result.design,
      terraAddress: result.mk.accAddress,
      encryptedWallet: encryptWallet(createWallet(result.mk), result.password),
    };

    await addWallet(encryptedWallet);

    history.push('/');
  }, [result, history]);

  return (
    <FormSection>
      <header>
        <h1>Add New Wallet</h1>
      </header>

      <CreateNewWalletForm onChange={setResult} />

      <footer>
        <Button variant="contained" color="secondary" component={Link} to="/">
          Cancel
        </Button>

        <Button
          variant="contained"
          color="primary"
          disabled={!result}
          onClick={create}
        >
          Create Wallet
        </Button>
      </footer>
    </FormSection>
  );
}
