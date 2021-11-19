import { Button, SingleLineFormContainer } from '@station/ui';
import { WebExtensionNetworkInfo } from '@terra-dev/web-extension-interface';
import {
  validateNetworkLcdURL,
  validateNetworkName,
} from '@terra-dev/web-extension-backend';
import React, { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { FormFooter } from 'webextension/components/layouts/FormFooter';
import { FormMain } from 'webextension/components/layouts/FormMain';

export interface CreateNetworkResult {
  name: string;
  chainID: string;
  lcd: string;
}

export interface CreateNetworkProps {
  className?: string;
  networks: WebExtensionNetworkInfo[];
  onCreate: (result: CreateNetworkResult) => void;
}

export function CreateNetwork({
  className,
  networks,
  onCreate,
}: CreateNetworkProps) {
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
    <div className={className}>
      <FormMain>
        <SingleLineFormContainer label="Network name" invalid={invalidName}>
          <input
            type="text"
            value={name}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
              setName(target.value)
            }
          />
        </SingleLineFormContainer>

        <SingleLineFormContainer label="Chain ID">
          <input
            type="text"
            value={chainID}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
              setChainID(target.value)
            }
          />
        </SingleLineFormContainer>

        <SingleLineFormContainer label="LCD" invalid={invalidLcd}>
          <input
            type="text"
            value={lcd}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
              setLcd(target.value)
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
            chainID.length === 0 ||
            lcd.length === 0 ||
            !!invalidName ||
            !!invalidLcd
          }
          onClick={create}
        >
          Create network
        </Button>
      </FormFooter>
    </div>
  );
}
