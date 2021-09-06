import { microfy } from '@libs/formatter';
import { FormLabel, FormLayout, Layout } from '@station/ui';
import { NumberInput } from '@station/ui';
import { TextInput } from '@station/ui';
import { HumanAddr, terraswap, Token, u, UST } from '@libs/types';
import { SendTokenInfo, TxResultRendering } from '@libs/webapp-fns';
import {
  useSendForm,
  useSendTx,
  useTerraTokenInfo,
} from '@libs/webapp-provider';
import { Button } from '@material-ui/core';
import { useConnectedWallet } from '@terra-dev/use-wallet';
import big, { BigSource } from 'big.js';
import React, { ChangeEvent, useCallback, useMemo } from 'react';
import { Observable } from 'rxjs';

export interface SendTokenProps {
  asset: terraswap.AssetInfo;
  onCancel: () => void;
  onProceed: (stream: Observable<TxResultRendering>) => void;
}

export function SendToken({ asset, onCancel, onProceed }: SendTokenProps) {
  const { data: tokenInfo } = useTerraTokenInfo(asset);

  return asset && tokenInfo ? (
    <Form
      assetInfo={asset}
      tokenInfo={tokenInfo}
      onCancel={onCancel}
      onProceed={onProceed}
    />
  ) : null;
}

function Form({
  onCancel,
  onProceed,
  assetInfo,
  tokenInfo,
}: SendTokenInfo & {
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
    <Layout>
      <FormLayout>
        <FormLabel label="To address">
          <TextInput
            fullWidth
            value={states.toAddr}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
              updateInput({ toAddr: target.value })
            }
            error={!!states.invalidToAddr}
            helperText={states.invalidToAddr}
          />
        </FormLabel>

        <FormLabel label="Amount">
          <NumberInput<Token>
            fullWidth
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
          Update
        </Button>
      </footer>
    </Layout>
  );
}
