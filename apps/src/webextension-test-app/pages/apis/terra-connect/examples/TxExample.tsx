import { createHookMsg } from '@anchor-protocol/anchor.js/dist/utils/cw20/create-hook-msg';
import {
  AnimateNumber,
  demicrofy,
  formatAUSTWithPostfixUnits,
  formatUSTWithPostfixUnits,
} from '@anchor-protocol/notation';
import { aUST, UST } from '@anchor-protocol/types';
import { useApolloClient } from '@apollo/client';
import { streamPipe, StreamStatus, useStream } from '@terra-dev/stream-pipe';
import {
  WebExtensionCreateTxFailed,
  WebExtensionTxFailed,
  WebExtensionTxStatus,
  WebExtensionTxUnspecifiedError,
  WebExtensionUserDenied,
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
import big from 'big.js';
import { useConstants } from 'common/contexts/constants';
import { useContractAddress } from 'common/contexts/contract';
import { pollTxInfo } from 'common/queries/txInfos';
import { useUserBalances } from 'common/queries/userBalances';
import React, { useCallback, useMemo } from 'react';

export function TxExample() {
  // ---------------------------------------------
  // dependencies
  // ---------------------------------------------
  const { states, post } = useWebExtension();

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
        // -> Observable(TxProgress | TxSucceed)
        post,
        // poll txInfo if txResult is succeed
        // -> Observable(TxProgress | TxSucceed | TxInfos)
        (txResult) =>
          txResult.status === WebExtensionTxStatus.SUCCEED
            ? pollTxInfo(client, txResult.payload.txhash)
            : txResult,
        // side effect (refetch user balances) if result is txInfos(=Array)
        // -> Observable(TxProgress | TxSucceed | TxInfos)
        (result, firstParam) => {
          // + and you can get the operation's first parameter (is parameter of the post) by operator's second parameter
          console.log('First parameter was:', firstParam);

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
    if (!states?.network || !selectedWallet) return;

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
      network: states?.network,
      tx,
    });
  }, [
    address.moneyMarket.market,
    states?.network,
    execTx,
    gasAdjustment,
    gasFee,
    selectedWallet,
  ]);

  const withdraw = useCallback(() => {
    if (!states?.network || !selectedWallet) return;

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
      network: states?.network,
      tx,
    });
  }, [
    address.cw20.aUST,
    address.moneyMarket.market,
    states?.network,
    execTx,
    gasAdjustment,
    gasFee,
    selectedWallet,
  ]);

  const makeError = useCallback(() => {
    if (!states?.network || !selectedWallet) return;

    const tx: CreateTxOptions = {
      fee: new StdFee(
        big(uUSD ?? 0)
          .plus(10000000)
          .toNumber(),
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
      network: states?.network,
      tx,
    });
  }, [
    states?.network,
    selectedWallet,
    uUSD,
    gasAdjustment,
    address.moneyMarket.market,
    execTx,
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
          <p>
            {txResult.error instanceof WebExtensionUserDenied
              ? 'error is WebExtensionUserDenied'
              : txResult.error instanceof WebExtensionCreateTxFailed
              ? 'error is WebExtensionCreateTxFailed'
              : txResult.error instanceof WebExtensionTxFailed
              ? 'error is WebExtensionTxFailed'
              : txResult.error instanceof WebExtensionTxUnspecifiedError
              ? 'error is WebExtensionTxUnspecifiedError'
              : 'Unknown error'}
          </p>
          <pre>
            {txResult.error instanceof Error
              ? txResult.error.toString()
              : String(txResult.error)}
          </pre>
        </div>
      )}

      {txResult.status === StreamStatus.READY && (
        <div>
          <button onClick={deposit}>Deposit 10 UST</button>
          <button onClick={withdraw}>Withdraw 10 aUST</button>
          <button onClick={makeError}>Make Error</button>
        </div>
      )}
    </div>
  );
}
