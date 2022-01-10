import { vibrate } from '@libs/ui';
import { Button, Message, SingleLineFormContainer } from '@station/ui';
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
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { PasswordStrength } from 'frame/components/form/PasswordStrength';
import { FormFooter } from 'frame/components/layouts/FormFooter';
import { FormMain } from 'frame/components/layouts/FormMain';

export interface UpdateWalletPasswordResult {
  encryptedWallet: EncryptedWallet;
}

export interface UpdateWalletPasswordProps {
  className?: string;
  encryptedWallet: EncryptedWallet;
  onCancel: () => void;
  onUpdate: (result: UpdateWalletPasswordResult) => void;
}

export function UpdateWalletPassword({
  className,
  encryptedWallet,
  onCancel,
  onUpdate,
}: UpdateWalletPasswordProps) {
  const containerRef = useRef<HTMLDivElement>(null);

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
      <div className={className}>
        <FormMain>
          <Message variant="warning">
            비밀번호를 5회 이상 틀렸습니다. 비밀번호 변경이 취소됩니다.
          </Message>
        </FormMain>

        <FormFooter>
          <Button variant="primary" size="large" onClick={onCancel}>
            Confirm
          </Button>
        </FormFooter>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className}>
      <FormMain>
        <SingleLineFormContainer
          label="Current password"
          invalid={invalidCurrentPassword}
        >
          <input
            type="password"
            placeholder="Must be at least 10 characters"
            value={currentPassword}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) => {
              setInvalidCurrentPassword(null);
              setCurrentPassword(target.value);
            }}
          />
        </SingleLineFormContainer>

        <SingleLineFormContainer
          label="New password"
          invalid={invalidNextPassword}
          suggest={<PasswordStrength password={nextPassword} />}
        >
          <input
            type="password"
            placeholder="Must be at least 10 characters"
            value={nextPassword}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
              setNextPassword(target.value)
            }
          />
        </SingleLineFormContainer>

        <SingleLineFormContainer
          label="Confirm new password"
          invalid={invalidNextPasswordConfirm}
        >
          <input
            type="password"
            placeholder="Confirm your password"
            value={nextPasswordConfirm}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
              setNextPasswordConfirm(target.value)
            }
          />
        </SingleLineFormContainer>
      </FormMain>

      <FormFooter>
        <Button
          variant="primary"
          size="large"
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
      </FormFooter>
    </div>
  );
}
