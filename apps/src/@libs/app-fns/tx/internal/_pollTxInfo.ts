import { WasmClient } from '@libs/query-client';
import { TxResult } from '@terra-dev/wallet-types';
import { TxResultRendering, TxStreamPhase } from '../../models/tx';
import { pollTxInfo, TxInfoData } from '../../queries/txInfo';
import { TxHelper } from './TxHelper';

interface Params {
  helper: TxHelper;
  wasmClient: WasmClient;
  onTxSucceed?: () => void;
}

export function _pollTxInfo({ helper, wasmClient, onTxSucceed }: Params) {
  return ({ value: txResult }: TxResultRendering<TxResult>) => {
    return pollTxInfo({
      wasmClient,
      tx: helper.savedTx,
      txhash: txResult.result.txhash,
    }).then((txInfo) => {
      onTxSucceed?.();

      return {
        value: txInfo,

        phase: TxStreamPhase.SUCCEED,
        receipts: [helper.txHashReceipt(), helper.txFeeReceipt()],
      } as TxResultRendering<TxInfoData>;
    });
  };
}
