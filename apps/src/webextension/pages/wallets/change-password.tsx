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
import React, { useCallback, useEffect, useState } from 'react';
import { RouteComponentProps, Link } from 'react-router-dom';

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
    <section>
      <div>
        <Link to="/">Back to Main</Link>
        
        <h3>Wallet Name</h3>
        <input type="text" readOnly value={encryptedWallet.name} />

        <h3>Current Password</h3>
        <input
          type="text"
          value={currentPassword}
          onChange={({ target }) => setCurrentPassword(target.value)}
        />

        <h3>New Password</h3>
        <input
          type="text"
          value={newPassword}
          onChange={({ target }) => setNewPassword(target.value)}
        />
      </div>

      <div>
        <button onClick={changePassword}>Change Password</button>
      </div>
    </section>
  );
}
