import {
  deserializeTx,
  WebConnectorTxFail,
  WebConnectorTxStatus,
  WebConnectorTxUnspecifiedError,
  WebConnectorUserDenied,
} from '@terra-dev/web-connector-interface';
import {
  approveHostnames,
  createLedgerKey,
  EncryptedWallet,
  executeTxWithInternalWallet,
  executeTxWithLedgerWallet,
  findWallet,
  fromURLSearchParams,
  LedgerKeyResponse,
  LedgerWallet,
  readHostnamesStorage,
  TxRequest,
  Wallet,
} from '@terra-dev/web-extension-backend';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { browser } from 'webextension-polyfill-ts';
import { ApproveHostname } from 'webextension/components/views/ApproveHostname';
import { CanNotFindTx } from 'webextension/components/views/CanNotFindTx';
import { CanNotFindWallet } from 'webextension/components/views/CanNotFindWallet';
import { SignTxWithEncryptedWallet } from 'webextension/components/views/SignTxWithEncryptedWallet';
import { SignTxWithLedgerWallet } from 'webextension/components/views/SignTxWithLedgerWallet';
import { UnknownCase } from 'webextension/components/views/UnknownCase';
import { txPortPrefix } from 'webextension/env';

export function TxPopup() {
  // ---------------------------------------------
  // read hash urls
  // ---------------------------------------------
  const { search } = useLocation();

  const txRequest = useMemo(() => {
    return fromURLSearchParams(search);
  }, [search]);

  // ---------------------------------------------
  // states
  // ---------------------------------------------
  // null - in progress checking
  // undefined - there is no wallet
  const [wallet, setWallet] = useState<
    EncryptedWallet | LedgerWallet | undefined | null
  >(null);

  const [needApproveHostname, setNeedApproveHostname] =
    useState<boolean>(false);

  // ---------------------------------------------
  // callbacks
  // ---------------------------------------------
  const deny = useCallback(() => {
    if (!txRequest) {
      throw new Error(`Can't find tx information!`);
    }

    const port = browser.runtime.connect(undefined, {
      name: txPortPrefix + txRequest.id,
    });

    port.postMessage({
      status: WebConnectorTxStatus.DENIED,
    });

    port.disconnect();
  }, [txRequest]);

  const cantFindWallet = useCallback(() => {
    if (!txRequest) {
      throw new Error(`Can't find tx information!`);
    }

    const port = browser.runtime.connect(undefined, {
      name: txPortPrefix + txRequest.id,
    });

    port.postMessage({
      status: WebConnectorTxStatus.FAIL,
      error: new WebConnectorTxUnspecifiedError(
        `Can't find the wallet "${txRequest.terraAddress}"`,
      ),
    });

    port.disconnect();
  }, [txRequest]);

  const approveHostname = useCallback(async () => {
    if (!txRequest) {
      return null;
    }

    await approveHostnames(txRequest.hostname);

    setNeedApproveHostname(false);
  }, [txRequest]);

  // ---------------------------------------------
  // effects
  // ---------------------------------------------
  // initialize
  useEffect(() => {
    if (!txRequest) return;

    findWallet(txRequest.terraAddress).then((nextWallet) =>
      setWallet(nextWallet),
    );

    readHostnamesStorage().then(({ approvedHostnames }) => {
      if (
        !approvedHostnames.some(
          (itemHostname) => itemHostname === txRequest.hostname,
        )
      ) {
        setNeedApproveHostname(true);
      }
    });
  }, [txRequest]);

  // ---------------------------------------------
  // presentation
  // ---------------------------------------------
  if (!txRequest) {
    return <CanNotFindTx />;
  }

  if (!wallet) {
    return (
      <CanNotFindWallet
        chainID={txRequest.network.chainID}
        terraAddress={txRequest.terraAddress}
        onConfirm={cantFindWallet}
      />
    );
  }

  if (needApproveHostname) {
    return (
      <ApproveHostname
        hostname={txRequest.hostname}
        onCancel={deny}
        onConfirm={approveHostname}
      />
    );
  }

  if ('usbDevice' in wallet) {
    return (
      <LedgerWalletTxForm txRequest={txRequest} wallet={wallet} onDeny={deny} />
    );
  }

  if ('encryptedWallet' in wallet) {
    return (
      <EncryptedWalletTxForm
        txRequest={txRequest}
        wallet={wallet}
        onDeny={deny}
      />
    );
  }

  return <UnknownCase detail={JSON.stringify(txRequest)} onConfirm={deny} />;
}

function LedgerWalletTxForm({
  className,
  txRequest,
  wallet,
  onDeny,
}: {
  className?: string;
  txRequest: TxRequest;
  wallet: LedgerWallet;
  onDeny: (params: { id: string }) => void;
}) {
  const tx = useMemo(() => {
    return deserializeTx(txRequest.tx);
  }, [txRequest.tx]);

  const deny = useCallback(() => {
    onDeny(txRequest);
    if (txRequest.closeWindowAfterTx) {
      window.close();
    }
  }, [onDeny, txRequest]);

  const proceed = useCallback(
    async ({ key, close }: LedgerKeyResponse) => {
      const port = browser.runtime.connect(undefined, {
        name: txPortPrefix + txRequest.id,
      });

      executeTxWithLedgerWallet(wallet, txRequest.network, tx, key).subscribe({
        next: (result) => {
          if (result.status === WebConnectorTxStatus.SUCCEED) {
            port.postMessage(result);
            close();
          } else if (result.status === WebConnectorTxStatus.DENIED) {
            port.postMessage({
              ...result,
              error: new WebConnectorUserDenied().toJSON(),
            });
            close();
          } else if (result.status === WebConnectorTxStatus.FAIL) {
            port.postMessage({
              ...result,
              error: result.error.toJSON(),
            });
            close();
          }
        },
        error: (error) => {
          port.postMessage({
            status: WebConnectorTxStatus.FAIL,
            error,
          } as WebConnectorTxFail);
          close();
        },
        complete: () => {
          port.disconnect();
          if (txRequest.closeWindowAfterTx) {
            window.close();
          }
        },
      });
    },
    [tx, txRequest.closeWindowAfterTx, txRequest.id, txRequest.network, wallet],
  );

  return (
    <SignTxWithLedgerWallet
      className={className}
      wallet={wallet}
      network={txRequest.network}
      tx={tx}
      hostname={txRequest.hostname}
      date={txRequest.date}
      onDeny={deny}
      onProceed={proceed}
      createLedgerKey={createLedgerKey}
    />
  );
}

function EncryptedWalletTxForm({
  className,
  txRequest,
  wallet,
  onDeny,
}: {
  className?: string;
  txRequest: TxRequest;
  wallet: EncryptedWallet;
  onDeny: (params: { id: string }) => void;
}) {
  const tx = useMemo(() => {
    return deserializeTx(txRequest.tx);
  }, [txRequest.tx]);

  const deny = useCallback(() => {
    onDeny(txRequest);
  }, [onDeny, txRequest]);

  const proceed = useCallback(
    async (decryptedWallet: Wallet) => {
      const port = browser.runtime.connect(undefined, {
        name: txPortPrefix + txRequest.id,
      });

      executeTxWithInternalWallet(
        decryptedWallet,
        txRequest.network,
        tx,
      ).subscribe({
        next: (result) => {
          if (result.status === WebConnectorTxStatus.SUCCEED) {
            port.postMessage(result);
          } else if (result.status === WebConnectorTxStatus.DENIED) {
            port.postMessage({
              ...result,
              error: new WebConnectorUserDenied().toJSON(),
            });
          } else if (result.status === WebConnectorTxStatus.FAIL) {
            port.postMessage({
              ...result,
              error: result.error.toJSON(),
            });
          }
        },
        error: (error) => {
          port.postMessage({
            status: WebConnectorTxStatus.FAIL,
            error,
          } as WebConnectorTxFail);
        },
        complete: () => {
          port.disconnect();
          if (txRequest.closeWindowAfterTx) {
            window.close();
          }
        },
      });
    },
    [tx, txRequest.closeWindowAfterTx, txRequest.id, txRequest.network],
  );

  return (
    <SignTxWithEncryptedWallet
      className={className}
      wallet={wallet}
      network={txRequest.network}
      tx={tx}
      hostname={txRequest.hostname}
      date={txRequest.date}
      onDeny={deny}
      onProceed={proceed}
    />
  );
}
