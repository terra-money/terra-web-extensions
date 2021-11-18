import { useApp } from '@libs/app-provider';
import { HumanAddr } from '@libs/types';
import { vibrate } from '@libs/ui';
import { Switch } from '@mantine/core';
import { Button, SingleLineFormContainer, WalletCard } from '@station/ui';
import { WalletNetworkInfo } from '@terra-dev/wallet-interface';
import {
  decryptWallet,
  EncryptedWallet,
  Wallet,
} from '@terra-dev/web-extension-backend';
import { CreateTxOptions, LCDClient } from '@terra-money/terra.js';
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import { FormMain } from 'webextension/components/layouts/FormMain';
import { MsgsPrint } from 'webextension/components/tx/MsgsPrint';
import { PrintTxRequest } from 'webextension/components/tx/PrintTxRequest';
import { TxFeeGasEditor } from 'webextension/components/tx/TxFeeGasEditor';
import { FormFooter } from '../layouts/FormFooter';

export interface SignTxWithEncryptedWalletProps {
  className?: string;
  wallet: EncryptedWallet;
  network: WalletNetworkInfo;
  tx: CreateTxOptions;
  hostname?: string;
  savedPassword?: string | undefined;
  date: Date;
  onDeny: () => void;
  onProceed: (
    wallet: Wallet,
    resolvedTx: CreateTxOptions,
    password: string | null,
  ) => void;
}

export function TxFee({
  terraAddress,
  originTx,
  tx,
  onChange,
}: {
  terraAddress: HumanAddr;
  originTx: CreateTxOptions;
  tx: CreateTxOptions;
  onChange: (nextTx: CreateTxOptions) => void;
}) {
  const { gasPrice } = useApp();

  const viewType = useMemo(() => {
    if (originTx.fee && originTx.fee.amount.toArray().length === 1) {
      return 'write';
    } else {
      return 'read';
    }
  }, [originTx.fee]);

  if (viewType === 'read') {
    return null;
  }

  return (
    <TxFeeGasEditor
      label="Fees"
      gasPrice={gasPrice}
      terraAddress={terraAddress}
      originTx={originTx}
      tx={tx}
      onChange={onChange}
    />
  );
}

export function useFeeEstimate(
  tx: CreateTxOptions,
  terraAddress: string,
  network: WalletNetworkInfo,
  update: (fn: (prev: CreateTxOptions) => CreateTxOptions) => void,
) {
  useEffect(() => {
    if (!tx.fee) {
      const lcd = new LCDClient({
        chainID: network.chainID,
        URL: network.lcd,
      });

      lcd.tx.create([{ address: terraAddress }], tx).then(({ auth_info }) => {
        update((prev) => {
          return {
            ...prev,
            fee: auth_info.fee,
          };
        });
      });
    }
  }, [network.chainID, network.lcd, terraAddress, tx, update]);
}

export function SignTxWithEncryptedWallet({
  className,
  wallet,
  tx: _originTx,
  network,
  hostname,
  date,
  onDeny,
  onProceed,
  savedPassword,
}: SignTxWithEncryptedWalletProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [tx, setTx] = useState<CreateTxOptions>(_originTx);

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

  useFeeEstimate(_originTx, wallet.terraAddress, network, setTx);

  // ---------------------------------------------
  // callbacks
  // ---------------------------------------------
  const proceed = useCallback(() => {
    try {
      const w = decryptWallet(wallet.encryptedWallet, password);
      onProceed(w, tx, savePassword ? password : null);
    } catch (error) {
      containerRef.current?.animate(vibrate, { duration: 100 });

      if (error instanceof Error) {
        setInvalidPassword(error.message);
      } else {
        setInvalidPassword(String(error));
      }
    }
  }, [onProceed, password, savePassword, tx, wallet.encryptedWallet]);

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
          isEstimatedFee={!_originTx.fee}
          network={network}
          tx={tx}
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
