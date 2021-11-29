import { NativeBalances } from '@libs/app-fns';
import { formatUToken } from '@libs/formatter';
import { Button } from '@station/ui';
import {
  EncryptedWallet,
  LedgerWallet,
} from '@terra-dev/web-extension-backend';
import { MnemonicKey } from '@terra-money/terra.js';
import big from 'big.js';
import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { FormFooter } from 'webextension/components/layouts/FormFooter';
import { FormMain } from 'webextension/components/layouts/FormMain';
import type { BIPWalletInfo } from 'webextension/models/BIPWalletInfo';

export interface SelectAvailableBIPWalletProps {
  className?: string;
  wallets: (EncryptedWallet | LedgerWallet)[];
  availableBipWallets: BIPWalletInfo[];
  onSelect: (mk: MnemonicKey) => void;
}

export function SelectAvailableBIPWallet({
  className,
  wallets,
  availableBipWallets,
  onSelect,
}: SelectAvailableBIPWalletProps) {
  const [selectedItem, setSelectedItem] = useState<BIPWalletInfo | null>(null);

  const existsTerraAddresses = useMemo(() => {
    return new Set<string>(wallets.map(({ terraAddress }) => terraAddress));
  }, [wallets]);

  return (
    <div className={className}>
      <FormMain>
        <List>
          {availableBipWallets.map((item) => {
            const exists = existsTerraAddresses.has(item.mk.accAddress);
            const selected = item === selectedItem;

            return (
              <li
                role="radio"
                key={item.coinType}
                aria-checked={selected}
                aria-disabled={(!!selectedItem && !selected) || exists}
                onClick={exists ? undefined : () => setSelectedItem(item)}
              >
                <ul className="status">
                  <li>BIP {item.coinType}</li>
                </ul>
                <div className="address">{item.mk.accAddress}</div>
                <hr />
                <Balances
                  className="balances"
                  balances={item.balances}
                  alreadyExists={exists}
                />
              </li>
            );
          })}
        </List>
      </FormMain>

      <FormFooter>
        <Button
          variant="primary"
          size="large"
          onClick={() => selectedItem && onSelect(selectedItem.mk)}
          disabled={!selectedItem}
        >
          Recover
        </Button>
      </FormFooter>
    </div>
  );
}

function Balances({
  className,
  balances,
  alreadyExists,
}: {
  className: string;
  balances: NativeBalances;
  alreadyExists: boolean;
}) {
  const filteredBalances = useMemo(() => {
    const keys = Object.keys(balances) as (keyof NativeBalances)[];
    return keys
      .map((key) => {
        return {
          name: key.substr(1),
          amount: balances[key],
        };
      })
      .filter(({ amount }) => big(amount).gt(0));
  }, [balances]);

  if (alreadyExists) {
    return <div className={className}>Already added address</div>;
  }

  return filteredBalances.length > 0 ? (
    <ul className={className}>
      {filteredBalances.map(({ name, amount }) => (
        <li key={name}>
          {formatUToken(amount)} {name}
        </li>
      ))}
    </ul>
  ) : (
    <div className={className}>No balance</div>
  );
}

const List = styled.ul`
  list-style: none;
  padding: 0;

  display: flex;
  flex-direction: column;
  gap: 20px;

  > li {
    cursor: pointer;

    padding: 20px;

    border: 2px solid #cfd8ea;
    border-radius: 5px;

    &[aria-disabled='true'] {
      opacity: 0.6;
    }

    &[aria-checked='true'] {
      border-color: #2043b5;
    }

    display: flex;
    flex-direction: column;
    gap: 10px;

    ul.status {
      list-style: none;
      padding: 0;

      display: flex;
      gap: 5px;

      li {
        border-radius: 9.5px;

        background-color: #459cf4;
        padding: 5px 10px;

        color: #ffffff;
        font-size: 10px;
        font-weight: 500;
      }
    }

    .address {
      text-decoration: none;
      font-size: 10px;
      font-weight: 500;
      color: #2043b5;
      line-height: 15px;
    }

    hr {
      border: 0;
      border-top: 1px solid #ebeff8;
    }

    .balances {
      list-style: none;
      padding: 0;

      display: grid;
      grid-template-columns: 1fr 1fr;
      row-gap: 5px;

      font-size: 14px;
      line-height: 1.5;
      font-weight: normal;

      color: #2043b5;
    }
  }
`;
