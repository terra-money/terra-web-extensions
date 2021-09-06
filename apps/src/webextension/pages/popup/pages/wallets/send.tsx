import { CW20Addr, NativeDenom, terraswap } from '@libs/types';
import { TxResultRendering } from '@libs/webapp-fns';
import React, { useCallback, useMemo, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Observable } from 'rxjs';
import { RenderTx } from 'webextension/components/views/RenderTx';
import { SendToken } from 'webextension/components/views/SendToken';
import { useStore } from 'webextension/contexts/store';
import { TxProvider } from 'webextension/contexts/tx';
import {
  FindWalletStatus,
  useFindWallet,
} from 'webextension/queries/useFindWallet';

export function WalletSend({
  history,
  match,
}: RouteComponentProps<{ terraAddress: string; token: string }>) {
  const wallet = useFindWallet(match.params.terraAddress);

  const { selectedNetwork } = useStore();

  const asset = useMemo<terraswap.AssetInfo>(() => {
    const token = match.params.token;

    return token.length > 10
      ? {
          token: {
            contract_addr: token as CW20Addr,
          },
        }
      : {
          native_token: {
            denom: token as NativeDenom,
          },
        };
  }, [match.params.token]);

  const cancel = useCallback(() => {
    history.push('/');
  }, [history]);

  if (
    wallet === FindWalletStatus.IN_PROGRESS ||
    wallet === FindWalletStatus.NOT_FOUND ||
    !selectedNetwork
  ) {
    return null;
  }

  return (
    <TxProvider wallet={wallet} network={selectedNetwork}>
      <Component asset={asset} onBack={cancel} />
    </TxProvider>
  );
}

function Component({
  asset,
  onBack,
}: {
  asset: terraswap.AssetInfo;
  onBack: () => void;
}) {
  const [stream, setStream] = useState<Observable<TxResultRendering> | null>(
    null,
  );

  if (stream) {
    return (
      <RenderTx
        stream={stream}
        onComplete={() => {
          setStream(null);
          onBack();
        }}
      />
    );
  }

  return <SendToken asset={asset} onCancel={onBack} onProceed={setStream} />;
}
