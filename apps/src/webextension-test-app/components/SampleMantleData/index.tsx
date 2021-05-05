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
import { streamPipe, StreamStatus, useStream } from '@terra-dev/stream-pipe';
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
import { pollTxInfo } from 'common/queries/txInfos';
import { useUserBalances } from 'common/queries/userBalances';
import React, { useCallback, useMemo } from 'react';
import { GuardSpinner } from 'react-spinners-kit';

export function SampleMantleData() {
  const { states, post } = useWebExtension();

  const { selectedWallet } = useWalletSelect();

  const client = useApolloClient();

  const address = useContractAddress();

  const { gasFee, gasAdjustment } = useConstants();

  const {
    data: { uUSD, uaUST },
    refetch,
  } = useUserBalances({ selectedWallet });

  const txStream = useMemo(
    () =>
      streamPipe(
        // execute transaction
        post,
        // poll txInfo if txResult is succeed
        (txResult: WebExtensionTxResult) =>
          txResult.status === WebExtensionTxStatus.SUCCEED
            ? pollTxInfo(client, txResult.payload.txhash)
            : txResult,
        // side effect if result is txInfos(=Array)
        (result) => {
          if (Array.isArray(result)) {
            refetch();
          }
          return result;
        },
      ),
    [client, post, refetch],
  );

  const [execTx, txResult] = useStream(txStream);

  const deposit = useCallback(() => {
    if (!states?.network || !selectedWallet) return;

    const tx: CreateTxOptions = {
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
      {txResult.status === StreamStatus.IN_PROGRESS && (
        <div>
          <div>
            <GuardSpinner />
          </div>
          <pre>{JSON.stringify(txResult.result, null, 2)}</pre>
        </div>
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
    </section>
  );
}
