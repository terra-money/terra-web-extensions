import { vibrate } from '@libs/ui';
import { Switch } from '@mantine/core';
import { Button, SingleLineFormContainer, WalletCard } from '@station/ui';
import {
  decryptWallet,
  EncryptedWallet,
  Wallet,
} from '@terra-dev/web-extension-backend';
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import { FormMain } from 'frame/components/layouts/FormMain';
import { FormFooter } from '../layouts/FormFooter';

export interface SignBytesWithEncryptedWalletProps {
  className?: string;
  wallet: EncryptedWallet;
  bytes: Buffer;
  hostname?: string;
  savedPassword?: string | undefined;
  date: Date;
  onDeny: () => void;
  onProceed: (
    decryptedWallet: Wallet,
    bytes: Buffer,
    password: string | null,
  ) => void;
}

export function SignBytesWithEncryptedWallet({
  className,
  wallet,
  bytes,
  hostname,
  date,
  onDeny,
  onProceed,
  savedPassword,
}: SignBytesWithEncryptedWalletProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------------
  // states
  // ---------------------------------------------
  const [savePassword, setSavePassword] = useState<boolean>(() => false);

  const [password, setPassword] = useState<string>('');

  const [invalidPassword, setInvalidPassword] = useState<string | null>(null);

  useEffect(() => {
    if (savedPassword) {
      setSavePassword(true);
      setPassword(savedPassword);
    }
  }, [savedPassword]);

  // ---------------------------------------------
  // callbacks
  // ---------------------------------------------
  const proceed: () => void = useCallback(() => {
    try {
      const w = decryptWallet(wallet.encryptedWallet, password);
      onProceed(w, bytes, savePassword ? password : null);
    } catch (error) {
      containerRef.current?.animate(vibrate, { duration: 100 });

      if (error instanceof Error) {
        setInvalidPassword(error.message);
      } else {
        setInvalidPassword(String(error));
      }
    }
  }, [bytes, onProceed, password, savePassword, wallet.encryptedWallet]);

  return (
    <Container ref={containerRef} className={className}>
      <header>
        <WalletCard
          name={wallet.name}
          terraAddress={wallet.terraAddress}
          design={wallet.design}
          style={{ width: 280, height: 140 }}
        />
      </header>

      <FormMain>
        <pre>{bytes.toString()}</pre>

        <SingleLineFormContainer invalid={invalidPassword}>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) => {
              setPassword(target.value);
              setInvalidPassword(null);
            }}
          />
        </SingleLineFormContainer>

        <div className="save-password-container">
          <Switch
            size="xs"
            label="Save password for 24 hours"
            checked={savePassword}
            onChange={({ currentTarget }) =>
              setSavePassword(currentTarget.checked)
            }
          />
        </div>
      </FormMain>

      <FormFooter>
        <Button variant="danger" size="large" onClick={onDeny}>
          Deny
        </Button>

        <Button
          variant="primary"
          size="large"
          disabled={password.length === 0 || !!invalidPassword}
          onClick={proceed}
        >
          Submit
        </Button>
      </FormFooter>
    </Container>
  );
}

const Container = styled.section`
  > header {
    height: 168px;
    display: flex;
    justify-content: center;

    background-color: var(--color-header-background);
  }

  .save-password-container {
    margin-top: -12px;
    padding-left: 5px;
  }
`;
