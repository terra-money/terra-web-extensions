import { createHookMsg } from '@anchor-protocol/anchor.js/dist/utils/cw20/create-hook-msg';
import {
  AnimateNumber,
  demicrofy,
  formatAUSTWithPostfixUnits,
  formatUSTWithPostfixUnits,
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
  WebExtensionTxResult,
  WebExtensionTxStatus,
} from '@terra-dev/web-extension';
import {
  useWalletSelect,
  useWebExtension,
} from '@terra-dev/web-extension-react';
import {
  Coins,
  CreateTxOptions,
  Int,
  MsgExecuteContract,
  StdFee,
} from '@terra-money/terra.js';
import { useConstants } from 'common/contexts/constants';
import { useContractAddress } from 'common/contexts/contract';
import { pollTxInfo, TxInfos } from 'common/queries/txInfos';
import { useUserBalances } from 'common/queries/userBalances';
import React, { useCallback, useMemo } from 'react';

export function TxExample() {
  // ---------------------------------------------
  // dependencies
  // ---------------------------------------------
  const { clientStates, post } = useWebExtension();

  const { selectedWallet } = useWalletSelect();

  const client = useApolloClient();

  // contract addresses
  const address = useContractAddress();

  // constants
  const { gasFee, gasAdjustment } = useConstants();

  // user balances (graphql query)
  const {
    data: { uUSD, uaUST },
    refetch: refetchUserBalances,
  } = useUserBalances({ selectedWallet });

  // ---------------------------------------------
  // operators
  // ---------------------------------------------
  // create composited stream
  const txStream = useMemo(
    () =>
      streamPipe(
        // execute transaction
        // -> Observable(TxProgress | TxSucceed | TxFail | TxDenied)
        post,
        // poll txInfo if txResult is succeed
        // -> Observable(TxProgress | TxSucceed | TxFail | TxDenied | TxInfos)
        ((txResult: WebExtensionTxResult) =>
          txResult.status === WebExtensionTxStatus.SUCCEED
            ? pollTxInfo(client, txResult.payload.txhash)
            : txResult) as Operator<
          WebExtensionTxResult,
          TxInfos | WebExtensionTxResult
        >,
        // side effect (refetch user balances) if result is txInfos(=Array)
        // -> Observable(TxProgress | TxSucceed | TxFail | TxDenied | TxInfos)
        (result) => {
          if (Array.isArray(result)) {
            refetchUserBalances();
          }
          return result;
        },
      ),
    [client, post, refetchUserBalances],
  );

  // bind to react
  const [execTx, txResult] = useStream(txStream);

  // ---------------------------------------------
  // Anchor transactions
  // ---------------------------------------------
  const deposit = useCallback(() => {
    if (!clientStates?.network || !selectedWallet) return;

    const tx: CreateTxOptions = {
      fee: new StdFee(
        gasFee,
        new Coins({
          uusd: new Int(1000000).toString(),
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
            uusd: new Int(10 * 1000000).toString(),
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

    const tx: CreateTxOptions = {
      fee: new StdFee(
        gasFee,
        new Coins({
          uusd: new Int(1000000).toString(),
        }),
      ),
      gasAdjustment,
      msgs: [
        new MsgExecuteContract(selectedWallet.terraAddress, address.cw20.aUST, {
          send: {
            contract: address.moneyMarket.market,
            amount: new Int(10 * 1000000).toString(),
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

  // ---------------------------------------------
  // presentation
  // ---------------------------------------------
  if (!selectedWallet) {
    return <section>No Wallets (Please add a wallet)</section>;
  }

  return (
    <div>
      <h5>Balances</h5>
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

      <h5>Anchor Depost / Withdraw</h5>

      {txResult.status === StreamStatus.IN_PROGRESS && (
        <div>Tx In Progress...</div>
      )}

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
    </div>
  );
}
