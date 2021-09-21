import { sendTx } from '@libs/app-fns';
import { HumanAddr, terraswap, Token, u, UST } from '@libs/types';
import { useConnectedWallet } from '@terra-dev/use-wallet';
import { useCallback } from 'react';
import { useApp } from '../../contexts/app';
import { TERRA_TX_KEYS } from '../../env';
import { useGasPrice } from '../../hooks/useGasPrice';
import { useRefetchQueries } from '../../hooks/useRefetchQueries';
import { useTax } from '../../queries/terra/tax';

export interface SendTxParams {
  amount: u<Token>;
  toAddr: HumanAddr;
  asset: terraswap.AssetInfo;
  memo?: string;
  txFee: u<UST>;

  onTxSucceed?: () => void;
}

export function useSendTx() {
  const connectedWallet = useConnectedWallet();

  const { wasmClient, txErrorReporter, constants } = useApp();

  const fixedFee = useGasPrice(constants.fixedGas, 'uusd');

  const refetchQueries = useRefetchQueries();

  const { taxRate, maxTax } = useTax<UST>('uusd');

  const stream = useCallback(
    ({ asset, memo, toAddr, amount, txFee, onTxSucceed }: SendTxParams) => {
      if (!connectedWallet || !connectedWallet.availablePost) {
        throw new Error(`Can't post!`);
      }

      return sendTx({
        txFee,
        asset,
        memo,
        toAddr,
        amount,
        walletAddr: connectedWallet.walletAddress,
        taxRate,
        maxTaxUUSD: maxTax,
        fixedFee,
        gasWanted: constants.gasWanted,
        gasAdjustment: constants.gasAdjustment,
        wasmClient,
        txErrorReporter,
        onTxSucceed: () => {
          onTxSucceed?.();
          refetchQueries(TERRA_TX_KEYS.SEND);
        },
        network: connectedWallet.network,
        post: connectedWallet.post,
      });
    },
    [
      connectedWallet,
      constants.gasAdjustment,
      constants.gasWanted,
      fixedFee,
      maxTax,
      refetchQueries,
      taxRate,
      txErrorReporter,
      wasmClient,
    ],
  );

  return connectedWallet ? stream : null;
}
