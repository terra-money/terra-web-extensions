import { FormLayout, FormSection } from '@libs/station-ui';
import { vibrate } from '@libs/ui';
import { WalletCard } from '@libs/wallet-card';
import { Button, TextField } from '@material-ui/core';
import {
  decryptWallet,
  EncryptedWallet,
  encryptWallet,
  validatePasswordConfirm,
  validateWalletPassword,
  Wallet,
} from '@terra-dev/web-extension-backend';
import React, {
  ChangeEvent,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

export interface UpdateWalletPasswordResult {
  encryptedWallet: EncryptedWallet;
}

export interface UpdateWalletPasswordProps {
  encryptedWallet: EncryptedWallet;
  onCancel: () => void;
  onUpdate: (result: UpdateWalletPasswordResult) => void;
  children?: ReactNode;
}

export function UpdateWalletPassword({
  encryptedWallet,
  onCancel,
  onUpdate,
  children,
}: UpdateWalletPasswordProps) {
  const containerRef = useRef<HTMLElement>(null);

  // ---------------------------------------------
  // states
  // ---------------------------------------------
  const [currentPassword, setCurrentPassword] = useState<string>('');

  const [nextPassword, setNextPassword] = useState<string>('');

  const [nextPasswordConfirm, setNextPasswordConfirm] = useState<string>('');

  const [invalidCurrentPassword, setInvalidCurrentPassword] = useState<
    string | null
  >(null);

  const [failed, setFailed] = useState<number>(0);

  // ---------------------------------------------
  // logics
  // ---------------------------------------------
  const invalidNextPassword = useMemo(() => {
    return validateWalletPassword(nextPassword);
  }, [nextPassword]);

  const invalidNextPasswordConfirm = useMemo(() => {
    return validatePasswordConfirm(nextPassword, nextPasswordConfirm);
  }, [nextPassword, nextPasswordConfirm]);

  // ---------------------------------------------
  // callbacks
  // ---------------------------------------------
  const update = useCallback(() => {
    let wallet: Wallet;

    try {
      wallet = decryptWallet(encryptedWallet.encryptedWallet, currentPassword);
    } catch (err) {
      containerRef.current?.animate(vibrate, { duration: 100 });

      setInvalidCurrentPassword(
        err instanceof Error ? err.message : String(err),
      );
      setFailed((prev) => prev + 1);
      return;
    }

    const nextEncryptedWallet: EncryptedWallet = {
      ...encryptedWallet,
      encryptedWallet: encryptWallet(wallet, nextPassword),
    };

    onUpdate({
      encryptedWallet: nextEncryptedWallet,
    });
  }, [currentPassword, encryptedWallet, nextPassword, onUpdate]);

  // ---------------------------------------------
  // presentation
  // ---------------------------------------------
  if (failed > 5) {
    return (
      <FormSection>
        <FormLayout>
          <p>비밀번호를 5회 이상 틀렸습니다. 비밀번호 변경이 취소됩니다.</p>
        </FormLayout>

        <footer>
          <Button variant="contained" color="primary" onClick={onCancel}>
            Confirm
          </Button>
        </footer>
      </FormSection>
    );
  }

  return (
    <FormSection ref={containerRef}>
      {children}

      <WalletCard
        name={encryptedWallet.name}
        terraAddress={encryptedWallet.terraAddress}
        design={encryptedWallet.design}
        style={{ display: 'block', width: 270, margin: '0 auto 25px auto' }}
      />

      <FormLayout>
        <TextField
          variant="outlined"
          type="password"
          size="small"
          label="Current password"
          InputLabelProps={{ shrink: true }}
          value={currentPassword}
          error={!!invalidCurrentPassword}
          helperText={invalidCurrentPassword}
          onChange={({ target }: ChangeEvent<HTMLInputElement>) => {
            setInvalidCurrentPassword(null);
            setCurrentPassword(target.value);
          }}
        />

        <TextField
          variant="outlined"
          type="password"
          size="small"
          label="New password"
          placeholder="Must be at least 10 characters"
          InputLabelProps={{ shrink: true }}
          value={nextPassword}
          error={!!invalidNextPassword}
          helperText={invalidNextPassword}
          onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
            setNextPassword(target.value)
          }
        />

        <TextField
          variant="outlined"
          type="password"
          size="small"
          label="Confirm new password"
          placeholder="Confirm your password"
          InputLabelProps={{ shrink: true }}
          value={nextPasswordConfirm}
          error={!!invalidNextPasswordConfirm}
          helperText={invalidNextPasswordConfirm}
          onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
            setNextPasswordConfirm(target.value)
          }
        />
      </FormLayout>

      <footer>
        <Button variant="contained" color="secondary" onClick={onCancel}>
          Cancel
        </Button>

        <Button
          variant="contained"
          color="primary"
          disabled={
            currentPassword.length === 0 ||
            nextPassword.length === 0 ||
            nextPasswordConfirm.length === 0 ||
            !!invalidCurrentPassword ||
            !!invalidNextPassword ||
            !!invalidNextPasswordConfirm
          }
          onClick={update}
        >
          Change password
        </Button>
      </footer>
    </FormSection>
  );
}
