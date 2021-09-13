import { vibrate } from '@libs/ui';
import { WalletCard } from '@station/wallet-card';
import { Button } from '@material-ui/core';
import { FormLabel, TextInput } from '@station/ui';
import { WebExtensionNetworkInfo } from '@terra-dev/web-extension';
import {
  decryptWallet,
  EncryptedWallet,
  Wallet,
} from '@terra-dev/web-extension-backend';
import { CreateTxOptions } from '@terra-money/terra.js';
import React, { ChangeEvent, useCallback, useRef, useState } from 'react';
import styled from 'styled-components';
import { PrintCreateTxOptions } from 'webextension/components/tx/PrintCreateTxOptions';
import { PrintTxRequest } from 'webextension/components/tx/PrintTxRequest';

export interface SignTxWithEncryptedWalletProps {
  className?: string;
  wallet: EncryptedWallet;
  network: WebExtensionNetworkInfo;
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
  const containerRef = useRef<HTMLElement>(null);

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
    <Section ref={containerRef} className={className}>
      <header>
        <WalletCard
          className="wallet-card"
          name={wallet.name}
          terraAddress={wallet.terraAddress}
          design={wallet.design}
        />
      </header>

      <PrintTxRequest
        className="wallets-actions"
        network={network}
        tx={tx}
        hostname={hostname}
        date={date}
      />

      <PrintCreateTxOptions className="tx" tx={tx} />

      <section className="form">
        <FormLabel label="Wallet password">
          <TextInput
            fullWidth
            type="password"
            value={password}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) => {
              setPassword(target.value);
              setInvalidPassword(null);
            }}
            error={!!invalidPassword}
            helperText={invalidPassword}
          />
        </FormLabel>
      </section>

      <footer>
        <Button variant="contained" color="secondary" onClick={onDeny}>
          Deny
        </Button>

        <Button
          variant="contained"
          color="primary"
          disabled={password.length === 0 || !!invalidPassword}
          onClick={proceed}
        >
          Submit
        </Button>
      </footer>
    </Section>
  );
}

export const Section = styled.section`
  header {
    display: flex;
    justify-content: center;

    .wallet-card {
      width: 276px;
    }

    margin-bottom: 30px;
  }

  .tx {
    margin: 30px 0;
  }

  .form {
    margin: 30px 0;
  }

  footer {
    display: flex;

    > * {
      flex: 1;

      &:not(:first-child) {
        margin-left: 10px;
      }
    }
  }
`;
