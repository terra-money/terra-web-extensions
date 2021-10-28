import { vibrate } from '@libs/ui';
import { Button, SingleLineFormContainer, WalletCard } from '@station/ui2';
import { WebConnectorNetworkInfo } from '@terra-dev/web-connector-interface';
import {
  decryptWallet,
  EncryptedWallet,
  Wallet,
} from '@terra-dev/web-extension-backend';
import { CreateTxOptions } from '@terra-money/terra.js';
import React, { ChangeEvent, useCallback, useRef, useState } from 'react';
import styled from 'styled-components';
import { FormMain } from 'webextension/components/layouts/FormMain';
import { PrintCreateTxOptions } from 'webextension/components/tx/PrintCreateTxOptions';
import { PrintTxRequest } from 'webextension/components/tx/PrintTxRequest';
import { FormFooter } from '../layouts/FormFooter';

export interface SignTxWithEncryptedWalletProps {
  className?: string;
  wallet: EncryptedWallet;
  network: WebConnectorNetworkInfo;
  tx: CreateTxOptions;
  hostname: string;
  date: Date;
  onDeny: () => void;
  onProceed: (wallet: Wallet) => void;
}

export function SignTxWithEncryptedWallet({
  className,
  wallet,
  tx,
  network,
  hostname,
  date,
  onDeny,
  onProceed,
}: SignTxWithEncryptedWalletProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------------
  // states
  // ---------------------------------------------
  const [password, setPassword] = useState<string>('');

  const [invalidPassword, setInvalidPassword] = useState<string | null>(null);

  // ---------------------------------------------
  // callbacks
  // ---------------------------------------------
  const proceed = useCallback(() => {
    try {
      const w = decryptWallet(wallet.encryptedWallet, password);
      onProceed(w);
    } catch (error) {
      containerRef.current?.animate(vibrate, { duration: 100 });

      if (error instanceof Error) {
        setInvalidPassword(error.message);
      } else {
        setInvalidPassword(String(error));
      }
    }
  }, [onProceed, password, wallet.encryptedWallet]);

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
        <PrintTxRequest
          className="wallets-actions"
          network={network}
          tx={tx}
          hostname={hostname}
          date={date}
        />

        <PrintCreateTxOptions className="tx" tx={tx} />

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

export const Container = styled.section`
  > header {
    height: 168px;
    display: flex;
    justify-content: center;

    background-color: var(--color-header-background);
  }
`;
