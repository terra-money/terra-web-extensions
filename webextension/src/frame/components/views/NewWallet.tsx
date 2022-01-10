import {
  Button,
  SingleLineFormContainer,
  WalletCard,
  WalletCardSelector,
} from '@station/ui';
import {
  EncryptedWallet,
  LedgerWallet,
  validatePasswordConfirm,
  validateWalletName,
  validateWalletPassword,
} from '@terra-dev/web-extension-backend';
import React, { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { PasswordStrength } from 'frame/components/form/PasswordStrength';
import { FormFooter } from 'frame/components/layouts/FormFooter';
import { CARD_DESIGNS } from 'frame/env';
import { FormMain } from '../layouts/FormMain';

export interface NewWalletResult {
  name: string;
  design: string;
  password: string;
}

export interface NewWalletProps {
  className?: string;
  wallets: (EncryptedWallet | LedgerWallet)[];
  onConfirm: (result: NewWalletResult) => void;
}

export function NewWallet({ className, wallets, onConfirm }: NewWalletProps) {
  // ---------------------------------------------
  // states
  // ---------------------------------------------
  const [name, setName] = useState<string>('');

  const [designIndex, setDesignIndex] = useState(() =>
    Math.floor(Math.random() * CARD_DESIGNS.length),
  );

  const [password, setPassword] = useState<string>('');

  const [passwordConfirm, setPasswordConfirm] = useState<string>('');

  // ---------------------------------------------
  // logics
  // ---------------------------------------------
  const invalidName = useMemo(() => {
    return validateWalletName(name, wallets);
  }, [name, wallets]);

  const invalidPassword = useMemo(() => {
    return validateWalletPassword(password);
  }, [password]);

  const invalidPasswordConfirm = useMemo(() => {
    return validatePasswordConfirm(password, passwordConfirm);
  }, [password, passwordConfirm]);

  // ---------------------------------------------
  // callbacks
  // ---------------------------------------------
  const proceed = useCallback(() => {
    onConfirm({
      name,
      design: CARD_DESIGNS[designIndex],
      password,
    });
  }, [onConfirm, name, designIndex, password]);

  // ---------------------------------------------
  // presentation
  // ---------------------------------------------
  return (
    <div className={className}>
      <WalletCardSelector
        cardWidth={280}
        cardHeight={140}
        selectedIndex={designIndex}
        onSelect={setDesignIndex}
        translateY={-10}
        style={{
          height: 168,
          backgroundColor: 'var(--color-header-background)',
        }}
      >
        {CARD_DESIGNS.map((design) => (
          <WalletCard
            key={'card-' + design}
            name={name.length > 0 ? name : 'Type your wallet name'}
            terraAddress="XXXXXXXXXXXXXXXXXXXXX"
            design={design}
          />
        ))}
      </WalletCardSelector>

      <FormMain>
        <SingleLineFormContainer label="Wallet name" invalid={invalidName}>
          <input
            type="text"
            placeholder="Enter 5-20 alphanumeric characters"
            value={name}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
              setName(target.value)
            }
          />
        </SingleLineFormContainer>

        <SingleLineFormContainer
          label="Password"
          invalid={invalidPassword}
          suggest={
            <PasswordStrength
              password={password}
              style={{ fontSize: 11, color: 'var(--desaturated-800)' }}
            />
          }
        >
          <input
            type="password"
            placeholder="Must be at least 10 characters"
            value={password}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
              setPassword(target.value)
            }
          />
        </SingleLineFormContainer>

        <SingleLineFormContainer
          label="Confirm password"
          invalid={invalidPasswordConfirm}
        >
          <input
            type="password"
            placeholder="Confirm your password"
            value={passwordConfirm}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
              setPasswordConfirm(target.value)
            }
          />
        </SingleLineFormContainer>
      </FormMain>

      <FormFooter>
        <Button
          variant="primary"
          size="large"
          disabled={
            name.length === 0 ||
            password.length === 0 ||
            passwordConfirm.length === 0 ||
            !!invalidName ||
            !!invalidPassword ||
            !!invalidPasswordConfirm
          }
          onClick={proceed}
        >
          Next
        </Button>
      </FormFooter>
    </div>
  );
}
