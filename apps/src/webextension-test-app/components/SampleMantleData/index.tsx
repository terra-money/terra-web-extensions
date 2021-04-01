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
  Operator,
  streamPipe,
  StreamStatus,
  useStream,
} from '@terra-dev/stream-pipe';
import {
  useTerraConnect,
  useWalletSelect,
} from '@terra-dev/terra-connect-react';
import { Tx, TxResult, TxStatus } from '@terra-dev/tx';
import { Coins, Int, MsgExecuteContract, StdFee } from '@terra-money/terra.js';
import React, { useCallback, useMemo } from 'react';
import { GuardSpinner } from 'react-spinners-kit';
import { useConstants } from '../../contexts/constants';
import { useContractAddress } from '../../contexts/contract';
import { pollTxInfo, TxInfos } from './queries/txInfos';
import { useUserBalances } from './queries/userBalances';

export function SampleMantleData() {
  const { clientStates, execute } = useTerraConnect();

  const { selectedWallet } = useWalletSelect();

  const client = useApolloClient();

  const address = useContractAddress();

  const { gasFee, gasAdjustment } = useConstants();

  const {
    data: { uUSD, uaUST },
    refetch,
  } = useUserBalances();

  const txStream = useMemo(
    () =>
      streamPipe(
        // execute transaction
        execute,
        // poll txInfo if txResult is succeed
        ((txResult: TxResult) =>
          txResult.status === TxStatus.SUCCEED
            ? pollTxInfo(client, txResult.payload.txhash)
            : txResult) as Operator<TxResult, TxInfos | TxResult>,
        // side effect if result is txInfos(=Array)
        (result) => {
          if (Array.isArray(result)) {
            refetch();
          }
          return result;
        },
      ),
    [client, execute, refetch],
  );

  const [execTx, txResult] = useStream(txStream);

  const deposit = useCallback(() => {
    if (!clientStates?.network || !selectedWallet) return;

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

    execTx({
      terraAddress: selectedWallet.terraAddress,
      network: clientStates?.network,
      tx,
    });
  }, [
    address.moneyMarket.market,
    clientStates?.network,
    execTx,
    gasAdjustment,
    gasFee,
    selectedWallet,
  ]);

  const withdraw = useCallback(() => {
    if (!clientStates?.network || !selectedWallet) return;

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

    execTx({
      terraAddress: selectedWallet.terraAddress,
      network: clientStates?.network,
      tx,
    });
  }, [
    address.cw20.aUST,
    address.moneyMarket.market,
    clientStates?.network,
    execTx,
    gasAdjustment,
    gasFee,
    selectedWallet,
  ]);

  if (!selectedWallet) {
    return <section>No Wallets (Please add a wallet)</section>;
  }

  return (
    <section>
      <h3>Balances</h3>
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

      <h3>Anchor Depost / Withdraw</h3>
      {txResult.status === StreamStatus.IN_PROGRESS && <GuardSpinner />}
      {txResult.status === StreamStatus.DONE && (
        <div>
          <h4>Tx Succeed</h4>
          <button onClick={txResult.reset}>Exit Result</button>
          <pre>{JSON.stringify(txResult.result, null, 2)}</pre>
        </div>
      )}
      {txResult.status === StreamStatus.ERROR && (
        <div>
          <h4>Tx Fail</h4>
          <button onClick={txResult.reset}>Exit Error</button>
          <pre>{String(txResult.error)}</pre>
        </div>
      )}
      {txResult.status === StreamStatus.READY && (
        <div>
          <button onClick={deposit}>Deposit 10 UST</button>
          <button onClick={withdraw}>Withdraw 10 aUST</button>
        </div>
      )}
    </section>
  );
}
