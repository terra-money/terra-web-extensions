import { WalletCardDesignSelector } from '@station/wallet-card/components/WalletCardDesignSelector';
import { Button } from '@material-ui/core';
import { FormLabel, FormLayout, Layout, TextInput } from '@station/ui';
import { WebExtensionWalletInfo } from '@terra-dev/web-extension';
import {
  validateWalletName,
  WalletNameInvalid,
} from '@terra-dev/web-extension-backend';
import React, {
  ChangeEvent,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { useStore } from 'webextension/contexts/store';
import { cardDesigns } from 'webextension/env';

export interface UpdateWalletResult {
  name: string;
  design: string;
}

export interface UpdateWalletProps {
  className?: string;
  wallet: WebExtensionWalletInfo;
  onCancel: () => void;
  onUpdate: (result: UpdateWalletResult) => void;
  children?: ReactNode;
}

export function UpdateWallet({
  className,
  wallet,
  onCancel,
  onUpdate,
  children,
}: UpdateWalletProps) {
  // ---------------------------------------------
  // queries
  // ---------------------------------------------
  const { wallets } = useStore();

  // ---------------------------------------------
  // states
  // ---------------------------------------------
  const [name, setName] = useState<string>(wallet.name);

  const [design, setDesign] = useState<string>(wallet.design);

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
      design,
    });
  }, [design, name, onUpdate]);

  // ---------------------------------------------
  // presentation
  // ---------------------------------------------
  return (
    <Layout className={className}>
      {children}

      <WalletCardDesignSelector
        style={{ margin: '1em auto 3em auto' }}
        name={name}
        design={design}
        terraAddress={wallet.terraAddress}
        designs={cardDesigns}
        onChange={setDesign}
        cardWidth={210}
      />

      <FormLayout>
        <FormLabel label="Wallet name">
          <TextInput
            fullWidth
            placeholder="Enter 5-20 alphanumeric characters"
            value={name}
            error={!!invalidName}
            helperText={invalidName}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
              setName(target.value)
            }
          />
        </FormLabel>
      </FormLayout>

      <footer>
        <Button variant="contained" color="secondary" onClick={onCancel}>
          Cancel
        </Button>

        <Button
          variant="contained"
          color="primary"
          disabled={
            name.length === 0 ||
            !!invalidName ||
            (name === wallet.name && design === wallet.design)
          }
          onClick={update}
        >
          Update
        </Button>
      </footer>
    </Layout>
  );
}
