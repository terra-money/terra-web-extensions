import { TextField } from '@material-ui/core';
import { FormLayout } from '@libs/station-ui/components/FormLayout';
import React, { ChangeEvent, useEffect, useState } from 'react';
import {
  useValidateNetworkLcdURL,
  useValidateNetworkName,
} from 'webextension/backend/logics/network';
import { defaultNetworks } from '../../env';

export interface CreateNewNetworkResult {
  name: string;
  chainID: string;
  lcd: string;
}

export interface CreateNewNetworkFormProps {
  onChange: (_: CreateNewNetworkResult | null) => void;
}

export function CreateNewNetworkForm({ onChange }: CreateNewNetworkFormProps) {
  const [name, setName] = useState<string>('');

  const [chainID, setChainID] = useState<string>(
    () => defaultNetworks[0].chainID,
  );

  const [lcd, setLcd] = useState<string>(() => defaultNetworks[0].lcd);

  const invalidName = useValidateNetworkName(name, defaultNetworks);

  const invalidLcd = useValidateNetworkLcdURL(lcd);

  useEffect(() => {
    if (!!invalidName || !!invalidLcd) {
      onChange(null);
    } else if (name.length > 0 && chainID.length > 4 && lcd.length > 0) {
      onChange({
        name,
        chainID,
        lcd,
      });
    } else {
      onChange(null);
    }
  }, [chainID, invalidLcd, invalidName, lcd, name, onChange]);

  return (
    <>
      <FormLayout>
        <TextField
          type="text"
          size="small"
          label="NETWORK NAME"
          InputLabelProps={{ shrink: true }}
          value={name}
          error={!!invalidName}
          helperText={invalidName}
          onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
            setName(target.value)
          }
        />

        <TextField
          type="text"
          size="small"
          label="CHAIN ID"
          InputLabelProps={{ shrink: true }}
          value={chainID}
          onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
            setChainID(target.value)
          }
        />

        <TextField
          type="text"
          size="small"
          label="LCD"
          InputLabelProps={{ shrink: true }}
          value={lcd}
          error={!!invalidLcd}
          helperText={invalidLcd}
          onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
            setLcd(target.value)
          }
        />
      </FormLayout>
    </>
  );
}
