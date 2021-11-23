import {
  useWalletSelect,
  useWebExtensionConnector,
} from '@station/web-extension-react';
import {
  WebExtensionSignBytesPayload,
  WebExtensionStatus,
  WebExtensionTxResult,
  WebExtensionTxStatus,
} from '@terra-dev/web-extension-interface';
import { PublicKey } from '@terra-money/terra.js';
import jscrypto from 'jscrypto';
import React, { useCallback, useState } from 'react';
import secp256k1 from 'secp256k1';

const BYTES = Buffer.from('hello world');

export function SignBytesExample() {
  const { states, signBytes } = useWebExtensionConnector();

  const { selectedWallet } = useWalletSelect();

  const [txResult, setTxResult] =
    useState<WebExtensionTxResult<WebExtensionSignBytesPayload> | null>(null);

  const [txError, setTxError] = useState<string | null>(null);

  const [verify, setVerify] = useState<string | null>(null);

  const [inProgress, setInProgress] = useState<boolean>(false);

  const send = useCallback(() => {
    if (states.type !== WebExtensionStatus.READY || !selectedWallet) {
      return;
    }

    setTxResult(null);
    setTxError(null);
    setVerify(null);
    setInProgress(true);

    signBytes(selectedWallet.terraAddress, BYTES).subscribe({
      next: (result) => {
        setTxResult(result);
        setTxError(null);

        if (result.status === WebExtensionTxStatus.SUCCEED) {
          const signature = Uint8Array.from(
            Buffer.from(result.payload.signature, 'base64'),
          );

          const publicKey = PublicKey.fromData(
            result.payload.public_key!,
          ).toProto();

          if ('key' in publicKey) {
            const verifyResult = secp256k1.ecdsaVerify(
              signature,
              Buffer.from(
                jscrypto.SHA256.hash(
                  new jscrypto.Word32Array(BYTES),
                ).toString(),
                'hex',
              ),
              publicKey.key,
            );

            setVerify(verifyResult ? 'Verify OK' : 'Verify failed');
          } else {
            setVerify(`Can't find publicKey.key`);
          }
        }
      },
      error: (error) => {
        setTxResult(null);
        setTxError(error instanceof Error ? error.message : String(error));
        setVerify(null);
        setInProgress(false);
      },
      complete: () => {
        setInProgress(false);
      },
    });
  }, [selectedWallet, signBytes, states.type]);

  return (
    <div>
      {txResult && <pre>{JSON.stringify(txResult, null, 2)}</pre>}

      {txError && <pre>{txError}</pre>}

      {verify && <pre>{verify}</pre>}

      {(!!txResult || !!txError || !!verify) && (
        <div>
          <button
            onClick={() => {
              setTxResult(null);
              setTxError(null);
              setVerify(null);
            }}
          >
            Clear result
          </button>
        </div>
      )}

      {!txResult && !txError && !verify && selectedWallet && !inProgress && (
        <div>
          <button onClick={send}>
            Sign bytes with {selectedWallet.terraAddress}
          </button>
        </div>
      )}
    </div>
  );
}
