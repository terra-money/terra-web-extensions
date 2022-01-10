import { TxResultRendering } from '@libs/app-fns';
import { useTerraTokenInfo } from '@libs/app-provider';
import { cw20, CW20Addr, NativeDenom, terraswap, Token } from '@libs/types';
import React, { useCallback, useMemo, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Observable } from 'rxjs';
import { SubLayout } from 'frame/components/layouts/SubLayout';
import { RenderTx } from 'frame/components/views/RenderTx';
import { SendToken } from 'frame/components/views/SendToken';
import { useStore } from 'frame/contexts/store';
import { SendTxProvider } from 'frame/entries/app/contexts/SendTxProvider';
import { FindWalletStatus, useFindWallet } from 'frame/queries/useFindWallet';

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

  const { data: tokenInfo } = useTerraTokenInfo(asset);

  const cancel = useCallback(() => {
    history.push(`/`);
  }, [history]);

  const complete = useCallback(() => {
    history.push(
      `/wallet/${match.params.terraAddress}/token/${match.params.token}`,
    );
  }, [history, match.params.terraAddress, match.params.token]);

  if (
    wallet === FindWalletStatus.IN_PROGRESS ||
    wallet === FindWalletStatus.NOT_FOUND ||
    !selectedNetwork
  ) {
    return null;
  }

  if (!tokenInfo) {
    return null;
  }

  return (
    <SendTxProvider
      tokenInfo={tokenInfo}
      wallet={wallet}
      network={selectedNetwork}
    >
      <Component
        tokenInfo={tokenInfo}
        asset={asset}
        onBack={cancel}
        onComplete={complete}
      />
    </SendTxProvider>
  );
}

function Component({
  asset,
  tokenInfo,
  onBack,
  onComplete,
}: {
  asset: terraswap.AssetInfo;
  tokenInfo: cw20.TokenInfoResponse<Token>;
  onBack: () => void;
  onComplete: () => void;
}) {
  const [stream, setStream] = useState<Observable<TxResultRendering> | null>(
    null,
  );

  if (stream) {
    return (
      <SubLayout title={`Send ${tokenInfo?.symbol}`}>
        <RenderTx
          stream={stream}
          onComplete={() => {
            setStream(null);
            onComplete();
          }}
        />
      </SubLayout>
    );
  }

  return (
    <SubLayout title={`Send ${tokenInfo?.symbol}`} onBack={onBack}>
      <SendToken
        asset={asset}
        tokenInfo={tokenInfo}
        onCancel={onBack}
        onProceed={setStream}
      />
    </SubLayout>
  );
}
