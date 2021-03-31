import { createHookMsg } from '@anchor-protocol/anchor.js/dist/utils/cw20/create-hook-msg';
import {
  AnimateNumber,
  demicrofy,
  formatAUSTWithPostfixUnits,
  formatUSTWithPostfixUnits,
  MICRO,
} from '@anchor-protocol/notation';
import { aUST, UST } from '@anchor-protocol/types';
import { useApolloClient } from '@apollo/client';
import {
  useTerraConnect,
  useWalletSelect,
} from '@terra-dev/terra-connect-react';
import { Tx, TxStatus } from '@terra-dev/tx';
import { Coins, Int, MsgExecuteContract, StdFee } from '@terra-money/terra.js';
import React, { useCallback, useState } from 'react';
import { pollTxInfo } from './queries/txInfos';
import { useConstants } from '../../contexts/constants';
import { useContractAddress } from '../../contexts/contract';
import { useUserBalances } from './queries/userBalances';
import { GuardSpinner, SpiralSpinner } from 'react-spinners-kit';

export function SampleMantleData() {
  const [inProgress, setInProgress] = useState<boolean>(false);

  const { clientStates, execute } = useTerraConnect();

  const { selectedWallet } = useWalletSelect();

  const client = useApolloClient();

  const address = useContractAddress();

  const { gasFee, gasAdjustment } = useConstants();

  const {
    data: { uUSD, uaUST },
    refetch,
  } = useUserBalances();

  const deposit = useCallback(() => {
    if (!clientStates?.network || !selectedWallet) return;

    setInProgress(true);

    const tx: Tx = {
      fee: new StdFee(
        gasFee,
        new Coins({
          uusd: new Int(MICRO).toString(),
        }),
      ),
      gasAdjustment,
      msgs: [
        new MsgExecuteContract(
          selectedWallet.terraAddress,
          address.moneyMarket.market,
          {
            deposit_stable: {},
          },
          new Coins({
            uusd: new Int(10 * MICRO).toString(),
          }),
        ),
      ],
    };

    execute(selectedWallet.terraAddress, clientStates.network, tx).subscribe(
      (txResult) => {
        if (txResult.status === TxStatus.SUCCEED) {
          pollTxInfo(client, txResult.payload.txhash).then(() => {
            refetch();
            setInProgress(false);
          });
        }
      },
      (error) => console.error(error),
    );
  }, [
    address.moneyMarket.market,
    client,
    clientStates?.network,
    execute,
    gasAdjustment,
    gasFee,
    refetch,
    selectedWallet,
  ]);

  const withdraw = useCallback(() => {
    if (!clientStates?.network || !selectedWallet) return;

    setInProgress(true);

    const tx: Tx = {
      fee: new StdFee(
        gasFee,
        new Coins({
          uusd: new Int(MICRO).toString(),
        }),
      ),
      gasAdjustment,
      msgs: [
        new MsgExecuteContract(selectedWallet.terraAddress, address.cw20.aUST, {
          send: {
            contract: address.moneyMarket.market,
            amount: new Int(10 * MICRO).toString(),
            msg: createHookMsg({
              redeem_stable: {},
            }),
          },
        }),
      ],
    };

    execute(selectedWallet.terraAddress, clientStates.network, tx).subscribe(
      (txResult) => {
        console.log(txResult);
        if (txResult.status === TxStatus.SUCCEED) {
          pollTxInfo(client, txResult.payload.txhash).then(() => {
            refetch();
            setInProgress(false);
          });
        }
      },
      (error) => console.error(error),
    );
  }, [
    address.cw20.aUST,
    address.moneyMarket.market,
    client,
    clientStates?.network,
    execute,
    gasAdjustment,
    gasFee,
    refetch,
    selectedWallet,
  ]);

  return (
    <section>
      <h2>Balances</h2>
      <ul>
        <li>
          UST:{' '}
          <AnimateNumber format={formatUSTWithPostfixUnits}>
            {uUSD ? demicrofy(uUSD) : (0 as UST<number>)}
          </AnimateNumber>
        </li>
        <li>
          aUST:{' '}
          <AnimateNumber format={formatAUSTWithPostfixUnits}>
            {uaUST ? demicrofy(uaUST) : (0 as aUST<number>)}
          </AnimateNumber>
        </li>
      </ul>

      <h2>Anchor Depost / Withdraw</h2>
      {inProgress ? (
        <GuardSpinner />
      ) : (
        <div>
          <button onClick={deposit}>Deposit 10 UST</button>
          <button onClick={withdraw}>Withdraw 10 aUST</button>
        </div>
      )}
    </section>
  );
}
