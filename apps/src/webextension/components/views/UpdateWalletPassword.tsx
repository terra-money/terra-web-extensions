import { vibrate } from '@libs/ui';
import { WalletCard } from '@station/wallet-card';
import { Button } from '@material-ui/core';
import { FormLabel, FormLayout, Layout, TextInput } from '@station/ui';
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
import { PasswordStrength } from 'webextension/components/form/PasswordStrength';

export interface UpdateWalletPasswordResult {
  encryptedWallet: EncryptedWallet;
}

export interface UpdateWalletPasswordProps {
  className?: string;
  encryptedWallet: EncryptedWallet;
  onCancel: () => void;
  onUpdate: (result: UpdateWalletPasswordResult) => void;
  children?: ReactNode;
}

export function UpdateWalletPassword({
  className,
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
      <Layout className={className}>
        <FormLayout>
          <p>비밀번호를 5회 이상 틀렸습니다. 비밀번호 변경이 취소됩니다.</p>
        </FormLayout>

        <footer>
          <Button variant="contained" color="primary" onClick={onCancel}>
            Confirm
          </Button>
        </footer>
      </Layout>
    );
  }

  return (
    <Layout ref={containerRef} className={className}>
      {children}

      <WalletCard
        name={encryptedWallet.name}
        terraAddress={encryptedWallet.terraAddress}
        design={encryptedWallet.design}
        style={{ display: 'block', width: 270, margin: '0 auto 25px auto' }}
      />

      <FormLayout>
        <FormLabel label="Current password">
          <TextInput
            fullWidth
            type="password"
            placeholder="Must be at least 10 characters"
            value={currentPassword}
            error={!!invalidCurrentPassword}
            helperText={invalidCurrentPassword}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) => {
              setInvalidCurrentPassword(null);
              setCurrentPassword(target.value);
            }}
          />
        </FormLabel>

        <FormLabel label="New password">
          <TextInput
            fullWidth
            type="password"
            placeholder="Must be at least 10 characters"
            value={nextPassword}
            error={!!invalidNextPassword}
            helperText={invalidNextPassword}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
              setNextPassword(target.value)
            }
          />
        </FormLabel>

        <PasswordStrength password={nextPassword} />

        <FormLabel label="Confirm new password">
          <TextInput
            fullWidth
            type="password"
            placeholder="Confirm your password"
            value={nextPasswordConfirm}
            error={!!invalidNextPasswordConfirm}
            helperText={invalidNextPasswordConfirm}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
              setNextPasswordConfirm(target.value)
            }
          />
        </FormLabel>
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
    </Layout>
  );
}
