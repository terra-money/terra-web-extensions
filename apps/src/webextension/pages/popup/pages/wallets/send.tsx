import { CW20Addr, NativeDenom, terraswap } from '@libs/types';
import { TxResultRendering } from '@libs/webapp-fns';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Observable } from 'rxjs';
import { SendToken } from 'webextension/components/views/SendToken';

export function WalletSend({
  history,
  match,
}: RouteComponentProps<{ terraAddress: string; token: string }>) {
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

  const [stream, setStream] = useState<Observable<TxResultRendering> | null>(
    null,
  );

  useEffect(() => {
    stream?.subscribe(console.log);
  }, [stream]);

  if (stream) {
    return null;
  }

  return <SendToken asset={asset} onCancel={cancel} onProceed={setStream} />;
}
