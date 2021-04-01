import {
  createWallet,
  EncryptedWallet,
  encryptWallet,
  restoreMnemonicKey,
  Wallet,
} from '@terra-dev/wallet';
import { addWallet } from '@terra-dev/webextension-wallet-storage';
import React, { useCallback, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';

export function WalletRespotre({ history }: RouteComponentProps<{}>) {
  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [mnemonic, setMnemonic] = useState<string>('');

  const restore = useCallback(async () => {
    const mk = restoreMnemonicKey(mnemonic);

    const wallet: Wallet = createWallet(mk);

    const encryptedWallet: EncryptedWallet = {
      name,
      terraAddress: mk.accAddress,
      encryptedWallet: encryptWallet(wallet, password),
    };

    await addWallet(encryptedWallet);

    history.push('/');
  }, [history, mnemonic, name, password]);

  return (
    <section>
      <div>
        <Link to="/">Back to Main</Link>

        <h3>Wallet Name</h3>
        <input
          type="text"
          value={name}
          onChange={({ target }) => setName(target.value)}
        />

        <h3>Password</h3>
        <input
          type="text"
          value={password}
          onChange={({ target }) => setPassword(target.value)}
        />

        <h3>Mnemonic</h3>
        <textarea
          style={{ width: '100%' }}
          value={mnemonic}
          onChange={({ target }) => setMnemonic(target.value)}
        />
      </div>

      <div>
        <button onClick={restore}>Restore Wallet</button>
      </div>
    </section>
  );
}
