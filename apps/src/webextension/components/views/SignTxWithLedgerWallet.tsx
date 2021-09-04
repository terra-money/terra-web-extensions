import { vibrate } from '@libs/ui';
import { WalletCard } from '@libs/wallet-card';
import { Button } from '@material-ui/core';
import { WebExtensionNetworkInfo } from '@terra-dev/web-extension';
import {
  createLedgerKey,
  LedgerKey,
  LedgerWallet,
} from '@terra-dev/web-extension-backend';
import { CreateTxOptions } from '@terra-money/terra.js';
import React, { useCallback, useRef, useState } from 'react';
import styled from 'styled-components';
import { PrintCreateTxOptions } from 'webextension/components/tx/PrintCreateTxOptions';
import { PrintTxRequest } from 'webextension/components/tx/PrintTxRequest';

export interface SignTxWithLedgerWalletProps {
  className?: string;
  wallet: LedgerWallet;
  network: WebExtensionNetworkInfo;
  tx: CreateTxOptions;
  hostname: string;
  date: Date;
  onDeny: () => void;
  onProceed: (ledgerKey: LedgerKey) => void;
}

export function SignTxWithLedgerWallet({
  className,
  wallet,
  network,
  tx,
  hostname,
  date,
  onDeny,
  onProceed,
}: SignTxWithLedgerWalletProps) {
  const containerRef = useRef<HTMLElement>(null);

  const [error, setError] = useState<unknown | null>(null);

  const proceed = useCallback(async () => {
    try {
      const ledgerKey = await createLedgerKey();
      onProceed(ledgerKey);
    } catch (e) {
      containerRef.current?.animate(vibrate, { duration: 1000 });

      setError(e);
    }
  }, [onProceed]);

  return (
    <Section className={className}>
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

      {error && <pre>{String(error)}</pre>}

      <footer>
        <Button variant="contained" color="secondary" onClick={onDeny}>
          Deny
        </Button>

        <Button
          variant="contained"
          color="primary"
          disabled={false}
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
