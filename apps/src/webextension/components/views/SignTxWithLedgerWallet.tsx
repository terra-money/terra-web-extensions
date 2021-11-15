import { HumanAddr } from '@libs/types';
import { vibrate } from '@libs/ui';
import { Button, WalletCard } from '@station/ui';
import {
  WebConnectorLedgerError,
  WebConnectorNetworkInfo,
} from '@terra-dev/web-connector-interface';
import {
  LedgerKeyResponse,
  LedgerWallet,
} from '@terra-dev/web-extension-backend';
import { CreateTxOptions } from '@terra-money/terra.js';
import React, { ReactNode, useCallback, useRef, useState } from 'react';
import styled from 'styled-components';
import { FormFooter } from 'webextension/components/layouts/FormFooter';
import { FormMain } from 'webextension/components/layouts/FormMain';
import { LedgerGuide } from 'webextension/components/tx/LedgerGuide';
import { MsgsPrint } from 'webextension/components/tx/MsgsPrint';
import { PrintTxRequest } from 'webextension/components/tx/PrintTxRequest';
import { TxFee } from 'webextension/components/views/SignTxWithEncryptedWallet';

export interface SignTxWithLedgerWalletProps {
  className?: string;
  wallet: LedgerWallet;
  network: WebConnectorNetworkInfo;
  tx: CreateTxOptions;
  hostname?: string;
  date: Date;
  createLedgerKey: () => Promise<LedgerKeyResponse>;
  onDeny: () => void;
  onProceed: (
    ledgerKey: LedgerKeyResponse,
    resolvedTx: CreateTxOptions,
  ) => void;
}

export function SignTxWithLedgerWallet({
  className,
  wallet,
  network,
  tx: _originTx,
  hostname,
  date,
  onDeny,
  onProceed,
  createLedgerKey,
}: SignTxWithLedgerWalletProps) {
  const containerRef = useRef<HTMLElement>(null);

  const [tx, setTx] = useState<CreateTxOptions>(_originTx);

  const [ledgerSignStarted, setLedgerSignStarted] = useState<boolean>(false);

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
      const ledgerKeyResponse = await createLedgerKey();

      onProceed(ledgerKeyResponse, tx);

      setGuide(
        <LedgerGuide>
          Ledger 로 승인 요청을 보냈습니다.
          <ul>
            <li>Ledger 를 확인하고, Sign 하십시오.</li>
          </ul>
        </LedgerGuide>,
      );
      setLedgerSignStarted(true);
    } catch (e) {
      containerRef.current?.animate(vibrate, { duration: 100 });

      if (e instanceof WebConnectorLedgerError) {
        setGuide(<LedgerGuide code={e.code}>{e.message}</LedgerGuide>);
      } else {
        setGuide(
          <LedgerGuide>
            {e instanceof Error ? e.message : String(e)}
          </LedgerGuide>,
        );
      }
    }
  }, [createLedgerKey, onProceed, tx]);

  return (
    <Container ref={containerRef} className={className}>
      <header>
        <WalletCard
          className="wallet-card"
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
          tx={_originTx}
          hostname={hostname}
          date={date}
        />

        <MsgsPrint
          className="tx"
          msgs={_originTx.msgs}
          walletAddress={wallet.terraAddress}
          network={network}
        />

        <TxFee
          terraAddress={wallet.terraAddress as HumanAddr}
          originTx={_originTx}
          tx={tx}
          onChange={setTx}
        />

        {guide}
      </FormMain>

      {!ledgerSignStarted && (
        <FormFooter>
          <Button variant="danger" size="large" onClick={onDeny}>
            Deny
          </Button>

          <Button
            variant="primary"
            size="large"
            disabled={false}
            onClick={proceed}
          >
            Submit
          </Button>
        </FormFooter>
      )}
    </Container>
  );
}

export const Container = styled.section`
  > header {
    height: 188px;
    display: grid;
    place-content: center;

    background-color: var(--color-header-background);
  }
`;
