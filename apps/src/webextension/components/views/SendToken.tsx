import { SendTokenInfo, TxResultRendering } from '@libs/app-fns';
import { useSendForm, useSendTx, useTerraTokenInfo } from '@libs/app-provider';
import { formatUInput, formatUToken, microfy } from '@libs/formatter';
import { cw20, HumanAddr, terraswap, Token, u, UST } from '@libs/types';
import { Button, InputAdornment } from '@material-ui/core';
import { Warning } from '@material-ui/icons';
import {
  FormLabel,
  FormLabelAside,
  FormLayout,
  Layout,
  MessageBox,
  MiniButton,
  NumberInput,
  TextInput,
} from '@station/ui';
import { useConnectedWallet } from '@terra-dev/use-wallet';
import big, { BigSource } from 'big.js';
import React, { ChangeEvent, ReactNode, useCallback, useMemo } from 'react';
import { Observable } from 'rxjs';

export interface SendTokenProps {
  className?: string;
  asset: terraswap.AssetInfo;
  onCancel: () => void;
  onProceed: (stream: Observable<TxResultRendering>) => void;
  children?: (tokenInfo: cw20.TokenInfoResponse<Token>) => ReactNode;
}

export function SendToken({
  className,
  asset,
  onCancel,
  onProceed,
  children,
}: SendTokenProps) {
  const { data: tokenInfo } = useTerraTokenInfo(asset);

  return asset && tokenInfo ? (
    <Form
      className={className}
      assetInfo={asset}
      tokenInfo={tokenInfo}
      onCancel={onCancel}
      onProceed={onProceed}
      children={children?.(tokenInfo)}
    />
  ) : null;
}

function Form({
  className,
  onCancel,
  onProceed,
  assetInfo,
  tokenInfo,
  children,
}: SendTokenInfo & {
  className?: string;
  onCancel: () => void;
  onProceed: (stream: Observable<TxResultRendering>) => void;
  children: ReactNode;
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
    <Layout className={className}>
      {children}

      <MessageBox style={{ marginBottom: 10 }}>
        <Warning /> Use{' '}
        <a href="https://bridge.terra.money/" target="_blank" rel="noreferrer">
          Terra Bridge
        </a>{' '}
        for cross-chain transfers
      </MessageBox>

      <FormLayout>
        <FormLabel label="To address">
          <TextInput
            fullWidth
            placeholder="terra1..."
            value={states.toAddr}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
              updateInput({ toAddr: target.value })
            }
            error={!!states.invalidToAddr}
            helperText={states.invalidToAddr}
          />
        </FormLabel>

        <FormLabel
          label="Amount"
          aside={
            <FormLabelAside>
              <MiniButton
                onClick={() =>
                  updateInput({ amount: formatUInput(states.maxAmount) })
                }
              >
                Available: {formatUToken(states.maxAmount)}
              </MiniButton>
            </FormLabelAside>
          }
        >
          <NumberInput<Token>
            fullWidth
            placeholder="0"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {tokenInfo.symbol}
                </InputAdornment>
              ),
            }}
            value={states.amount}
            onChange={(nextValue) =>
              updateInput({
                amount: nextValue,
              })
            }
            error={!!states.invalidAmount}
            helperText={states.invalidAmount}
          />
        </FormLabel>

        <FormLabel label="Memo (optional)">
          <TextInput
            fullWidth
            value={states.memo}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
              updateInput({ memo: target.value })
            }
            error={!!states.invalidMemo}
            helperText={states.invalidMemo}
          />
        </FormLabel>
      </FormLayout>

      <p>{states.warningEmptyMemo ?? states.warningNextTxFee}</p>

      <footer>
        <Button variant="contained" color="secondary" onClick={onCancel}>
          Cancel
        </Button>

        <Button
          variant="contained"
          color="primary"
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
      </footer>
    </Layout>
  );
}
