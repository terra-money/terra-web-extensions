import { Button } from '@material-ui/core';
import { FormLabel, FormLayout, Layout, TextInput } from '@station/ui';
import {
  validateNetworkLcdURL,
  validateNetworkName,
} from '@terra-dev/web-extension-backend';
import React, {
  ChangeEvent,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { useStore } from 'webextension/contexts/store';

export interface CreateNetworkResult {
  name: string;
  chainID: string;
  lcd: string;
}

export interface CreateNetworkProps {
  onCancel: () => void;
  onCreate: (result: CreateNetworkResult) => void;
  children?: ReactNode;
}

export function CreateNetwork({
  onCreate,
  onCancel,
  children,
}: CreateNetworkProps) {
  // ---------------------------------------------
  // queries
  // ---------------------------------------------
  const { networks } = useStore();

  // ---------------------------------------------
  // states
  // ---------------------------------------------
  const [name, setName] = useState<string>('');

  const [chainID, setChainID] = useState<string>(() => networks[0].chainID);

  const [lcd, setLcd] = useState<string>(() => networks[0].lcd);

  // ---------------------------------------------
  // logics
  // ---------------------------------------------
  const invalidName = useMemo(() => {
    return validateNetworkName(name, networks);
  }, [name, networks]);

  const invalidLcd = useMemo(() => {
    return validateNetworkLcdURL(lcd);
  }, [lcd]);

  // ---------------------------------------------
  // callbacks
  // ---------------------------------------------
  const create = useCallback(() => {
    onCreate({
      name,
      chainID,
      lcd,
    });
  }, [chainID, lcd, name, onCreate]);

  // ---------------------------------------------
  // presentation
  // ---------------------------------------------
  return (
    <Layout>
      {children}

      <FormLayout>
        <FormLabel label="Network name">
          <TextInput
            fullWidth
            value={name}
            error={!!invalidName}
            helperText={invalidName}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
              setName(target.value)
            }
          />
        </FormLabel>

        <FormLabel label="Chain ID">
          <TextInput
            fullWidth
            value={chainID}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
              setChainID(target.value)
            }
          />
        </FormLabel>

        <FormLabel label="LCD">
          <TextInput
            fullWidth
            value={lcd}
            error={!!invalidLcd}
            helperText={invalidLcd}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
              setLcd(target.value)
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
            chainID.length === 0 ||
            lcd.length === 0 ||
            !!invalidName ||
            !!invalidLcd
          }
          onClick={create}
        >
          Next
        </Button>
      </footer>
    </Layout>
  );
}
