import {
  CW20BuyTokenForm,
  cw20BuyTokenForm,
  CW20BuyTokenFormInput,
} from '@libs/app-fns';
import { CW20Addr, HumanAddr, Rate, Token, UST } from '@libs/types';
import { useForm } from '@libs/use-form';
import { useConnectedWallet } from '@terra-dev/use-wallet';
import { useApp } from '../../contexts/app';
import { useGasPrice } from '../../hooks/useGasPrice';
import { useTerraNativeBalanceQuery } from '../../queries/terra/nativeBalances';
import { useTax } from '../../queries/terra/tax';

export interface CW20BuyTokenFormParams {
  ustTokenPairAddr: HumanAddr;
  tokenAddr: CW20Addr;
}

export function useCW20BuyTokenForm<T extends Token>({
  ustTokenPairAddr,
  tokenAddr,
}: CW20BuyTokenFormParams) {
  const connectedWallet = useConnectedWallet();

  const { wasmClient, constants } = useApp();

  const fixedFee = useGasPrice(constants.fixedGas, 'uusd');

  const { taxRate, maxTax } = useTax<UST>('uusd');

  const uUST = useTerraNativeBalanceQuery<UST>(
    'uusd',
    connectedWallet?.walletAddress,
  );

  const form: CW20BuyTokenForm<T> = cw20BuyTokenForm;

  return useForm(
    form,
    {
      ustTokenPairAddr,
      tokenAddr,
      wasmClient,
      ustBalance: uUST,
      taxRate,
      maxTaxUUSD: maxTax,
      fixedFee,
      connected: !!connectedWallet,
    },
    () =>
      ({
        ustAmount: '' as UST,
        maxSpread: '0.01' as Rate,
      } as CW20BuyTokenFormInput<T>),
  );
}
