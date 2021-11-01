import {
  Button,
  SingleLineFormContainer,
  WalletCard,
  WalletCardSelector,
} from '@station/ui';
import { WebConnectorWalletInfo } from '@terra-dev/web-connector-interface';
import {
  validateWalletName,
  WalletNameInvalid,
} from '@terra-dev/web-extension-backend';
import React, { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { FormFooter } from 'webextension/components/layouts/FormFooter';
import { FormMain } from 'webextension/components/layouts/FormMain';
import { useStore } from 'webextension/contexts/store';
import { cardDesigns } from 'webextension/env';

export interface UpdateWalletResult {
  name: string;
  design: string;
}

export interface UpdateWalletProps {
  className?: string;
  wallet: WebConnectorWalletInfo;
  onCancel: () => void;
  onUpdate: (result: UpdateWalletResult) => void;
}

export function UpdateWallet({
  className,
  wallet,
  onCancel,
  onUpdate,
}: UpdateWalletProps) {
  // ---------------------------------------------
  // queries
  // ---------------------------------------------
  const { wallets } = useStore();

  // ---------------------------------------------
  // states
  // ---------------------------------------------
  const [name, setName] = useState<string>(wallet.name);

  const [designIndex, setDesignIndex] = useState<number>(() => {
    const i = cardDesigns.findIndex((design) => wallet.design === design);
    return i > -1 ? i : 0;
  });

  // ---------------------------------------------
  // logics
  // ---------------------------------------------
  const invalidName = useMemo(() => {
    const invalid = validateWalletName(name, wallets);

    return invalid === WalletNameInvalid.SAME_NAME_EXISTS &&
      name === wallet.name
      ? null
      : invalid;
  }, [name, wallet.name, wallets]);

  // ---------------------------------------------
  // callbacks
  // ---------------------------------------------
  const update = useCallback(() => {
    onUpdate({
      name,
      design: cardDesigns[designIndex],
    });
  }, [name, onUpdate, designIndex]);

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
        {cardDesigns.map((design) => (
          <WalletCard
            key={'card-' + design}
            name={name}
            terraAddress={wallet.terraAddress}
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
      </FormMain>

      <FormFooter>
        <Button
          variant="primary"
          size="large"
          disabled={
            name.length === 0 ||
            !!invalidName ||
            (name === wallet.name && cardDesigns[designIndex] === wallet.design)
          }
          onClick={update}
        >
          Update
        </Button>
      </FormFooter>
    </div>
  );
}
