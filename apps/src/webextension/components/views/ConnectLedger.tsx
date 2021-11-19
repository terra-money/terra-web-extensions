import { vibrate } from '@libs/ui';
import {
  Button,
  SingleLineFormContainer,
  WalletCard,
  WalletCardSelector,
} from '@station/ui';
import { WebExtensionLedgerError } from '@terra-dev/web-extension-interface';
import {
  EncryptedWallet,
  LedgerWallet,
  validateWalletName,
} from '@terra-dev/web-extension-backend';
import React, {
  ChangeEvent,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FormFooter } from 'webextension/components/layouts/FormFooter';
import { FormMain } from 'webextension/components/layouts/FormMain';
import { LedgerGuide } from 'webextension/components/tx/LedgerGuide';
import { CARD_DESIGNS } from 'webextension/env';

export interface ConnectLedgerProps {
  className?: string;
  wallets: (LedgerWallet | EncryptedWallet)[];
  onConnect: (name: string, design: string) => Promise<void>;
  onCancel: () => void;
}

export function ConnectLedger({
  className,
  wallets,
  onConnect,
  onCancel,
}: ConnectLedgerProps) {
  const containerRef = useRef<HTMLElement>(null);

  // ---------------------------------------------
  // states
  // ---------------------------------------------
  const [name, setName] = useState<string>('');

  const [designIndex, setDesignIndex] = useState(() =>
    Math.floor(Math.random() * CARD_DESIGNS.length),
  );

  const [guide, setGuide] = useState<ReactNode>(() => (
    <LedgerGuide>
      Ledger 를 연결합니다. 아래 사항들을 먼저 체크해주십시오.
      <ul>
        <li>Ledger 가 USB 에 연결되었습니까?</li>
        <li>Ledger 가 잠금해제 되어있습니까?</li>
        <li>Ledger 에 Terra App 이 열려있습니까?</li>
      </ul>
    </LedgerGuide>
  ));

  // ---------------------------------------------
  // logics
  // ---------------------------------------------
  const invalidName = useMemo(() => {
    return validateWalletName(name, wallets);
  }, [name, wallets]);

  // ---------------------------------------------
  // callbacks
  // ---------------------------------------------
  const connect = useCallback(async () => {
    if (wallets.some((itemWallet) => name === itemWallet.name)) {
      return;
    }

    try {
      await onConnect(name, CARD_DESIGNS[designIndex]);
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
  }, [designIndex, name, onConnect, wallets]);

  return (
    <section ref={containerRef} className={className}>
      <WalletCardSelector
        cardWidth={280}
        cardHeight={140}
        selectedIndex={designIndex}
        onSelect={setDesignIndex}
        style={{
          height: 188,
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

        {guide}
      </FormMain>

      <FormFooter>
        <Button variant="danger" size="large" onClick={onCancel}>
          Cancel
        </Button>

        <Button
          variant="primary"
          size="large"
          disabled={false}
          onClick={connect}
        >
          Connect
        </Button>
      </FormFooter>
    </section>
  );
}
