import {
  sendForm,
  SendForm,
  SendFormInput,
  SendTokenInfo,
} from '@libs/app-fns';
import { Token, UST } from '@libs/types';
import { useForm } from '@libs/use-form';
import { useConnectedWallet } from '@terra-dev/use-wallet';
import { useApp } from '../../contexts/app';
import { useGasPrice } from '../../hooks/useGasPrice';
import { useSendBalanceQuery } from '../../queries/send/balance';
import { useTerraNativeBalanceQuery } from '../../queries/terra/nativeBalances';
import { useTax } from '../../queries/terra/tax';

export interface SendFormParams {
  tokenInfo: SendTokenInfo;
}

export function useSendForm<T extends Token>({ tokenInfo }: SendFormParams) {
  const connectedWallet = useConnectedWallet();

  const { wasmClient, constants } = useApp();

  const fixedFee = useGasPrice(constants.fixedGas, 'uusd');

  const { taxRate, maxTax } = useTax<UST>('uusd');

  const uUST = useTerraNativeBalanceQuery<UST>(
    'uusd',
    connectedWallet?.walletAddress,
  );

  const balance = useSendBalanceQuery<T>(
    'native_token' in tokenInfo.assetInfo
      ? tokenInfo.assetInfo.native_token.denom
      : tokenInfo.assetInfo.token.contract_addr,
  );

  const form: SendForm<T> = sendForm;

  return useForm(
    form,
    {
      tokenInfo,
      balance,
      walletAddr: connectedWallet?.walletAddress,
      wasmClient,
      ustBalance: uUST,
      taxRate,
      maxTaxUUSD: maxTax,
      fixedFee,
      maxSpread: 0.1,
      connected: !!connectedWallet,
    },
    () => ({ amount: '', toAddr: '', memo: '' } as SendFormInput<T>),
  );
}
