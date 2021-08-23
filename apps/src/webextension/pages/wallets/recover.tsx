import { Button } from '@material-ui/core';
import { FormSection } from '@packages/station-ui/components/FormSection';
import {
  createWallet,
  EncryptedWallet,
  encryptWallet,
  restoreMnemonicKey,
  Wallet,
} from '@terra-dev/wallet';
import { addWallet } from '@terra-dev/web-extension/backend';
import React, { useCallback, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import {
  RecoverMnemonicForm,
  RecoverMnemonicResult,
} from '../../components/form/RecoverMnemonicForm';

export function WalletRecover({ history }: RouteComponentProps<{}>) {
  const [result, setResult] = useState<RecoverMnemonicResult | null>(null);

  const recover = useCallback(async () => {
    if (!result) {
      throw new Error(`Don't call when result is empty!`);
    }

    const mk = restoreMnemonicKey(result.mnemonic);

    const wallet: Wallet = createWallet(mk);

    const encryptedWallet: EncryptedWallet = {
      name: result.name,
      design: result.design,
      terraAddress: mk.accAddress,
      encryptedWallet: encryptWallet(wallet, result.password),
    };

    await addWallet(encryptedWallet);

    history.push('/');
  }, [history, result]);

  return (
    <FormSection>
      <header>
        <h1>Recover Existing Wallet</h1>
      </header>

      <RecoverMnemonicForm onChange={setResult} />

      <footer>
        <Button variant="contained" color="secondary" component={Link} to="/">
          Cancel
        </Button>

        <Button
          variant="contained"
          disabled={!result}
          color="primary"
          onClick={recover}
        >
          Recover Wallet
        </Button>
      </footer>
    </FormSection>
  );
}
