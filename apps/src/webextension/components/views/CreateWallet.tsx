import { FormLayout, FormSection } from '@libs/station-ui';
import { WalletCardDesignSelector } from '@libs/wallet-card/components/WalletCardDesignSelector';
import {
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Tooltip,
} from '@material-ui/core';
import { Warning } from '@material-ui/icons';
import {
  createMnemonicKey,
  validatePasswordConfirm,
  validateWalletName,
  validateWalletPassword,
} from '@terra-dev/web-extension-backend';
import { MnemonicKey } from '@terra-money/terra.js';
import React, {
  ChangeEvent,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react';
import styled from 'styled-components';
import { MnemonicViewer } from 'webextension/components/form/MnemonicViewer';
import { useStore } from 'webextension/contexts/store';
import { cardDesigns } from 'webextension/env';

export interface CreateWalletResult {
  name: string;
  design: string;
  password: string;
  mk: MnemonicKey;
}

export interface CreateWalletProps {
  onCancel: () => void;
  onCreate: (result: CreateWalletResult) => void;
  children?: ReactNode;
}

export function CreateWallet({
  onCreate,
  onCancel,
  children,
}: CreateWalletProps) {
  // ---------------------------------------------
  // queries
  // ---------------------------------------------
  const { wallets } = useStore();

  const mk = useMemo(() => {
    return createMnemonicKey();
  }, []);

  // ---------------------------------------------
  // states
  // ---------------------------------------------
  const [name, setName] = useState<string>('');

  const [design, setDesign] = useState<string>(
    () => cardDesigns[Math.floor(Math.random() * cardDesigns.length)],
  );

  const [password, setPassword] = useState<string>('');

  const [passwordConfirm, setPasswordConfirm] = useState<string>('');

  const [writtenMnemonic, setWrittenMnemonic] = useState<boolean>(false);

  // ---------------------------------------------
  // logics
  // ---------------------------------------------
  const invalidName = useMemo(() => {
    return validateWalletName(name, wallets);
  }, [name, wallets]);

  const invalidPassword = useMemo(() => {
    return validateWalletPassword(password);
  }, [password]);

  const invalidPasswordConfirm = useMemo(() => {
    return validatePasswordConfirm(password, passwordConfirm);
  }, [password, passwordConfirm]);

  // ---------------------------------------------
  // callbacks
  // ---------------------------------------------
  const create = useCallback(() => {
    onCreate({
      name,
      design,
      password,
      mk,
    });
  }, [onCreate, name, design, password, mk]);

  // ---------------------------------------------
  // presentation
  // ---------------------------------------------
  return (
    <FormSection>
      {children}

      <WalletCardDesignSelector
        style={{ margin: '1em auto 3em auto' }}
        name={name}
        design={design}
        terraAddress="XXXXXXXXXXXXXXXXXXXXXXX"
        designs={cardDesigns}
        onChange={setDesign}
        cardWidth={210}
      />

      <FormLayout>
        <TextField
          variant="outlined"
          type="text"
          size="small"
          label="Wallet name"
          placeholder="Enter 5-20 alphanumeric characters"
          InputLabelProps={{ shrink: true }}
          value={name}
          error={!!invalidName}
          helperText={invalidName}
          onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
            setName(target.value)
          }
        />

        <TextField
          variant="outlined"
          type="password"
          size="small"
          label="Password"
          placeholder="Must be at least 10 characters"
          InputLabelProps={{ shrink: true }}
          value={password}
          error={!!invalidPassword}
          helperText={invalidPassword}
          onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
            setPassword(target.value)
          }
        />

        <TextField
          variant="outlined"
          type="password"
          size="small"
          label="Confirm password"
          placeholder="Confirm your password"
          InputLabelProps={{ shrink: true }}
          value={passwordConfirm}
          error={!!invalidPasswordConfirm}
          helperText={invalidPasswordConfirm}
          onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
            setPasswordConfirm(target.value)
          }
        />
      </FormLayout>

      <MnemonicViewer mk={mk} />

      <Tooltip
        title={
          <>
            We cannot recover your information for you. If you lose your seed
            phrase it's GONE FOREVER. Terra Station does not store your
            mnemonic.
          </>
        }
      >
        <WarningMnemonic>
          <Warning /> What if I lost my seed phrase?
        </WarningMnemonic>
      </Tooltip>

      <FormControlLabel
        control={
          <Checkbox
            value={writtenMnemonic}
            onChange={(_, checked) => setWrittenMnemonic(checked)}
          />
        }
        label={
          <p style={{ fontSize: 11 }}>
            I have securely <strong>WRITTEN DOWN MY SEED</strong>. I understand
            that lost seeds cannot be recovered.
          </p>
        }
      />

      <footer>
        <Button variant="contained" color="secondary" onClick={onCancel}>
          Cancel
        </Button>

        <Button
          variant="contained"
          color="primary"
          disabled={
            name.length === 0 ||
            password.length === 0 ||
            passwordConfirm.length === 0 ||
            !!invalidName ||
            !!invalidPassword ||
            !!invalidPasswordConfirm
          }
          onClick={create}
        >
          Next
        </Button>
      </footer>
    </FormSection>
  );
}

const WarningMnemonic = styled.div`
  margin: 1em 0;

  svg {
    font-size: 1em;
  }
`;
