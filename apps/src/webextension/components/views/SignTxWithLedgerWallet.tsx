import { vibrate } from '@libs/ui';
import { Button } from '@material-ui/core';
import { WalletCard } from '@station/wallet-card';
import {
  WebExtensionLedgerError,
  WebExtensionNetworkInfo,
} from '@terra-dev/web-extension';
import {
  createLedgerKey,
  LedgerKeyResponse,
  LedgerWallet,
} from '@terra-dev/web-extension-backend';
import { CreateTxOptions } from '@terra-money/terra.js';
import React, { ReactNode, useCallback, useRef, useState } from 'react';
import styled from 'styled-components';
import { LedgerGuide } from 'webextension/components/tx/LedgerGuide';
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
  onProceed: (ledgerKey: LedgerKeyResponse) => void;
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

  const [guide, setGuide] = useState<ReactNode>(() => (
    <LedgerGuide>
      Ledger 를 사용해서 Tx 를 승인합니다. 아래 사항들을 먼저 체크해주십시오.
      <ul>
        <li>Ledger 가 USB 에 연결되었습니까?</li>
        <li>Ledger 가 잠금해제 되어있습니까?</li>
        <li>Ledger 에 Terra App 이 열려있습니까?</li>
      </ul>
    </LedgerGuide>
  ));

  const proceed = useCallback(async () => {
    try {
      const ledgerKey = await createLedgerKey();
      onProceed(ledgerKey);

      setGuide(
        <LedgerGuide>
          Ledger 로 승인 요청을 보냈습니다.
          <ul>
            <li>Ledger 를 확인하고, Sign 하십시오.</li>
          </ul>
        </LedgerGuide>,
      );
    } catch (e) {
      containerRef.current?.animate(vibrate, { duration: 100 });

      if (e instanceof WebExtensionLedgerError) {
        setGuide(<LedgerGuide code={e.code}>{e.message}</LedgerGuide>);
      } else {
        setGuide(
          <LedgerGuide>
            {e instanceof Error ? e.message : String(e)}
          </LedgerGuide>,
        );
      }
    }
  }, [onProceed]);

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

      {guide}

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
