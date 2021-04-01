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
import { GuardSpinner } from 'react-spinners-kit';
import { useConstants } from '../../contexts/constants';
import { useContractAddress } from '../../contexts/contract';
import { pollTxInfo } from './queries/txInfos';
import { useUserBalances } from './queries/userBalances';

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

    execute({
      terraAddress: selectedWallet.terraAddress,
      network: clientStates.network,
      tx,
    }).subscribe((txResult) => {
      switch (txResult.status) {
        case TxStatus.SUCCEED:
          pollTxInfo(client, txResult.payload.txhash).then(() => {
            refetch();
            setInProgress(false);
          });
          break;
        case TxStatus.FAIL:
        case TxStatus.DENIED:
          setInProgress(false);
      }
    });
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

    execute({
      terraAddress: selectedWallet.terraAddress,
      network: clientStates.network,
      tx,
    }).subscribe((txResult) => {
      switch (txResult.status) {
        case TxStatus.SUCCEED:
          pollTxInfo(client, txResult.payload.txhash).then(() => {
            refetch();
            setInProgress(false);
          });
          break;
        case TxStatus.FAIL:
        case TxStatus.DENIED:
          setInProgress(false);
      }
    });
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
