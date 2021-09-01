import { FormSection } from '@libs/station-ui/components/FormSection';
import { Button } from '@material-ui/core';
import { WebExtensionNetworkInfo } from '@terra-dev/web-extension';
import { addNetwork } from '@terra-dev/web-extension-backend';
import React, { useCallback, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import {
  CreateNewNetworkForm,
  CreateNewNetworkResult,
} from '../../components/form/CreateNewNetworkForm';

export function NetworkCreate({ history }: RouteComponentProps<{}>) {
  const [result, setResult] = useState<CreateNewNetworkResult | null>(null);

  const create = useCallback(async () => {
    if (!result) {
      throw new Error(`Don't call when result is empty!`);
    }

    const network: WebExtensionNetworkInfo = {
      name: result.name,
      chainID: result.chainID,
      lcd: result.lcd,
    };

    await addNetwork(network);

    history.push('/');
  }, [history, result]);

  return (
    <FormSection>
      <header>
        <h1>Add New Network</h1>
      </header>

      <CreateNewNetworkForm onChange={setResult} />

      <footer>
        <Button variant="contained" color="secondary" component={Link} to="/">
          Cancel
        </Button>

        <Button
          variant="contained"
          color="primary"
          disabled={!result}
          onClick={create}
        >
          Create Network
        </Button>
      </footer>
    </FormSection>
  );
}
