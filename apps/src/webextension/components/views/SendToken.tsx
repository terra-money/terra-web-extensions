import { SendTokenInfo, TxResultRendering } from '@libs/app-fns';
import { useSendForm, useSendTx } from '@libs/app-provider';
import { formatUInput, formatUToken, microfy } from '@libs/formatter';
import { cw20, HumanAddr, terraswap, Token, u, UST } from '@libs/types';
import { EmptyNumberInput } from '@libs/ui';
import {
  Button,
  FormRightSectionLabel,
  FormSuggest,
  Message,
  SingleLineFormContainer,
} from '@station/ui';
import { useConnectedWallet } from '@terra-dev/use-wallet';
import big, { BigSource } from 'big.js';
import React, { ChangeEvent, useCallback, useMemo } from 'react';
import { Observable } from 'rxjs';
import { FormFooter } from '../layouts/FormFooter';
import { FormMain } from '../layouts/FormMain';

export interface SendTokenProps {
  className?: string;
  asset: terraswap.AssetInfo;
  tokenInfo: cw20.TokenInfoResponse<Token> | undefined;
  onCancel: () => void;
  onProceed: (stream: Observable<TxResultRendering>) => void;
}

export function SendToken({
  className,
  asset,
  tokenInfo,
  onCancel,
  onProceed,
}: SendTokenProps) {
  return asset && tokenInfo ? (
    <Form
      className={className}
      assetInfo={asset}
      tokenInfo={tokenInfo}
      onCancel={onCancel}
      onProceed={onProceed}
    />
  ) : null;
}

function Form({
  className,
  onCancel,
  onProceed,
  assetInfo,
  tokenInfo,
}: SendTokenInfo & {
  className?: string;
  onCancel: () => void;
  onProceed: (stream: Observable<TxResultRendering>) => void;
}) {
  const sendParams = useMemo(
    () => ({
      tokenInfo: {
        assetInfo,
        tokenInfo,
      },
    }),
    [assetInfo, tokenInfo],
  );

  const connectedWallet = useConnectedWallet();

  const postTx = useSendTx();

  const [updateInput, states] = useSendForm<Token>(sendParams);

  const initForm = useCallback(() => {
    updateInput({
      amount: '' as Token,
      toAddr: '',
      memo: '',
    });
  }, [updateInput]);

  const proceed = useCallback(
    async (
      asset: terraswap.AssetInfo,
      amount: Token,
      toAddr: string,
      memo: string,
      txFee: u<UST<BigSource>>,
      warning: string | null,
    ) => {
      if (warning) {
        const confirmResult = window.confirm(warning);

        if (!confirmResult) {
          return;
        }

        //const confirm = await openConfirm({
        //  description: warning,
        //  agree: 'Send',
        //  disagree: 'Cancel',
        //});
        //
        //if (!confirm) {
        //  return;
        //}
      }

      const stream = postTx?.({
        amount: microfy(amount).toFixed() as u<UST>,
        asset,
        toAddr: toAddr as HumanAddr,
        memo: memo.length > 0 ? memo : undefined,
        txFee: big(txFee).toFixed() as u<UST>,
        onTxSucceed: initForm,
      });

      if (stream) {
        onProceed(stream);
      }
    },
    [initForm, onProceed, postTx],
  );

  return (
    <div className={className}>
      <FormMain>
        <Message variant="danger" style={{ marginBottom: 10 }}>
          Use{' '}
          <a
            href="https://bridge.terra.money/"
            target="_blank"
            rel="noreferrer"
          >
            Terra Bridge
          </a>{' '}
          for cross-chain transfers
        </Message>

        <SingleLineFormContainer
          label="To address"
          invalid={states.invalidToAddr}
        >
          <input
            placeholder="terra1..."
            value={states.toAddr}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
              updateInput({ toAddr: target.value })
            }
          />
        </SingleLineFormContainer>

        <SingleLineFormContainer
          label="Amount"
          suggest={
            <FormSuggest
              label="Available:"
              amount={formatUToken(states.maxAmount)}
              onClick={() =>
                updateInput({ amount: formatUInput(states.maxAmount) })
              }
            />
          }
          rightSection={
            <FormRightSectionLabel>{tokenInfo.symbol}</FormRightSectionLabel>
          }
          invalid={states.invalidAmount}
        >
          <EmptyNumberInput<Token>
            placeholder="0"
            value={states.amount}
            onChange={(nextValue) =>
              updateInput({
                amount: nextValue,
              })
            }
          />
        </SingleLineFormContainer>

        <SingleLineFormContainer
          label="Memo (optional)"
          invalid={states.invalidMemo}
        >
          <input
            value={states.memo}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
              updateInput({ memo: target.value })
            }
          />
        </SingleLineFormContainer>

        {states.warningEmptyMemo && (
          <Message variant="danger">{states.warningEmptyMemo}</Message>
        )}

        {states.warningNextTxFee && (
          <Message variant="warning">{states.warningNextTxFee}</Message>
        )}
      </FormMain>

      <FormFooter>
        <Button variant="danger" size="large" onClick={onCancel}>
          Cancel
        </Button>

        <Button
          variant="primary"
          size="large"
          disabled={
            !connectedWallet ||
            !connectedWallet.availablePost ||
            !states.availableTx ||
            !states.txFee
          }
          onClick={() =>
            states.txFee &&
            proceed(
              assetInfo,
              states.amount,
              states.toAddr,
              states.memo,
              states.txFee,
              states.warningNextTxFee,
            )
          }
        >
          Send
        </Button>
      </FormFooter>
    </div>
  );
}
