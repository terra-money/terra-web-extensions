import { addWallet, StoredWallet } from '@terra-dev/extension-wallet-storage';
import {
  createMnemonicKey,
  createWallet,
  encryptWallet,
  Wallet,
} from '@terra-dev/wallet';
import React, { useCallback, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

export function WalletCreate() {
  const history = useHistory();

  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const mk = useMemo(() => {
    return createMnemonicKey();
  }, []);

  const create = useCallback(async () => {
    const wallet: Wallet = createWallet(mk);

    const storedWallet: StoredWallet = {
      name,
      accAddress: mk.accAddress,
      encrypedWallet: encryptWallet(wallet, password),
    };

    await addWallet(storedWallet);

    history.push('/');
  }, [history, mk, name, password]);

  return (
    <section>
      <div>
        <h3>지갑 이름</h3>
        <input
          type="text"
          value={name}
          onChange={({ target }) => setName(target.value)}
        />

        <h3>비밀번호</h3>
        <input
          type="text"
          value={password}
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>

      <div>
        <h3>잃어버리면 골치아프니 적어두시오</h3>
        <p>{mk.mnemonic}</p>
      </div>

      <div>
        <button onClick={create}>Create Wallet</button>
      </div>
    </section>
  );
}
