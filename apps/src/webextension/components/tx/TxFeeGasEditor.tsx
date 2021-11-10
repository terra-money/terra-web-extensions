import { GasPrice } from '@libs/app-fns';
import { useTerraNativeBalancesWithAssetInfo } from '@libs/app-provider';
import { d6InputFormatter, formatUToken } from '@libs/formatter';
import { HumanAddr, NativeDenom, Token, u } from '@libs/types';
import { FormSelect, FormText, SingleLineFormContainer } from '@station/ui';
import { Coin, CreateTxOptions, Fee } from '@terra-money/terra.js';
import big, { Big } from 'big.js';
import React, { useCallback, useMemo, useState } from 'react';

export function TxFeeGasEditor({
  gasPrice,
  terraAddress,
  originTx,
  tx,
  onChange,
}: {
  gasPrice: GasPrice;
  terraAddress: HumanAddr;
  originTx: CreateTxOptions;
  tx: CreateTxOptions;
  onChange: (nextTx: CreateTxOptions) => void;
}) {
  const balances = useTerraNativeBalancesWithAssetInfo(terraAddress);

  const originFee = useMemo(() => {
    return originTx.fee!;
  }, [originTx.fee]);

  const originCoin = useMemo(() => {
    return originFee.amount.toArray()[0];
  }, [originFee.amount]);

  const availableTokens = useMemo(() => {
    return balances.filter(({ amount, info }) => {
      try {
        return big(amount).gt(
          big(originFee.gas_limit).mul(
            //@ts-ignore
            gasPrice[info.native_token.denom as any] ?? 0,
          ),
        );
      } catch {
        return false;
      }
    });
  }, [balances, gasPrice, originFee.gas_limit]);

  const selectDenoms = useMemo(() => {
    return availableTokens.map(({ info }) => {
      return {
        label: info.native_token.denom.substr(1).toUpperCase(),
        value: info.native_token.denom,
      };
    });
  }, [availableTokens]);

  const [selectedDenom, setSelectedDenom] = useState(() => {
    return originCoin.denom;
  });

  const selectedGas = useMemo<u<Token<Big>>>(() => {
    //@ts-ignore
    return big(originFee.gas_limit).mul(gasPrice[selectedDenom]) as u<
      Token<Big>
    >;
  }, [originFee.gas_limit, gasPrice, selectedDenom]);

  const onSelectDenom = useCallback(
    (nextDenom: NativeDenom) => {
      setSelectedDenom(nextDenom);

      if (originCoin.denom === nextDenom) {
        onChange(originTx);
      } else {
        //@ts-ignore
        const originDenomGasPrice = gasPrice[originCoin.denom];
        const nextGasInOriginDenom = big(originFee.gas_limit).mul(
          originDenomGasPrice,
        ) as u<Token<Big>>;

        //@ts-ignore
        const nextDenomGasPrice =
          nextDenom === 'ujpy' ? 16.37 : gasPrice[nextDenom];
        const nextGasInNextDenom = big(originFee.gas_limit).mul(
          nextDenomGasPrice,
        ) as u<Token<Big>>;

        const nextTax = big(originCoin.amount.toString()).minus(
          nextGasInOriginDenom,
        ) as u<Token<Big>>;

        const nextTx = {
          ...tx,
          fee: new Fee(originFee.gas_limit, [
            new Coin(originCoin.denom, d6InputFormatter(nextTax)),
            new Coin(nextDenom, d6InputFormatter(nextGasInNextDenom)),
          ]),
        };

        //console.log(
        //  'SignTxWithEncryptedWallet.tsx..()',
        //  JSON.stringify(
        //    {
        //      originGas: originFee.gas_limit + 'gas',
        //      originFee: originFee.amount.toJSON(),
        //      nextDenom,
        //      nextTax: d6InputFormatter(nextTax) + originCoin.denom,
        //      nextGas: d6InputFormatter(nextGasInNextDenom) + nextDenom,
        //      //@ts-ignore
        //      nextGasPrice: gasPrice[nextDenom],
        //      nextGasInOriginDenom:
        //        d6InputFormatter(nextGasInOriginDenom) + originCoin.denom,
        //    },
        //    null,
        //    2,
        //  ),
        //);

        onChange(nextTx);
      }
    },
    [
      gasPrice,
      onChange,
      originCoin.amount,
      originCoin.denom,
      originFee.gas_limit,
      originTx,
      tx,
    ],
  );

  if (selectDenoms.length === 0) {
    return null;
  }

  return (
    <SingleLineFormContainer
      leftSection={
        <FormSelect
          data={selectDenoms}
          value={selectedDenom}
          onChange={onSelectDenom}
        />
      }
    >
      <FormText>{formatUToken(selectedGas)}</FormText>
    </SingleLineFormContainer>
  );
}
