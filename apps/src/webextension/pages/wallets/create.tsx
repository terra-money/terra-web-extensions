import {
  createMnemonicKey,
  createWallet,
  EncryptedWallet,
  encryptWallet,
  Wallet,
} from '@terra-dev/wallet';
import { addWallet } from '@terra-dev/webextension-wallet-storage';
import React, { useCallback, useMemo, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';

export function WalletCreate({ history }: RouteComponentProps<{}>) {
  const [name, setName] = useState<string>('');
  const [design, setDesign] = useState<string>('');
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
    <section>
      <div>
        <Link to="/">Back to Main</Link>

        <h3>Wallet Neme</h3>
        <input
          type="text"
          value={name}
          onChange={({ target }) => setName(target.value)}
        />

        <h3>Wallet Design</h3>
        <input
          type="text"
          value={design}
          onChange={({ target }) => setDesign(target.value)}
        />

        <h3>Password</h3>
        <input
          type="text"
          value={password}
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>

      <div>
        <h3>Mnemonic</h3>
        <p
          style={{
            maxWidth: 400,
            wordBreak: 'break-all',
            whiteSpace: 'break-spaces',
          }}
        >
          {mk.mnemonic}
        </p>
      </div>

      <div>
        <button onClick={create}>Create Wallet</button>
      </div>
    </section>
  );
}
