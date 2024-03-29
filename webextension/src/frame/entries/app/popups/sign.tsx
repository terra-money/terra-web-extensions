import {
  deserializeTx,
  WebExtensionTxFail,
  WebExtensionTxStatus,
  WebExtensionTxUnspecifiedError,
  WebExtensionUserDenied,
} from '@terra-dev/web-extension-interface';
import {
  approveHostnames,
  createLedgerKey,
  EncryptedWallet,
  findWallet,
  txRequestFromURLSearchParams,
  getSavedPassword,
  LedgerKeyResponse,
  LedgerWallet,
  readHostnamesStorage,
  removeSavedPassword,
  savePassword,
  signWithEncryptedWallet,
  signWithLedgerWallet,
  TxRequest,
  Wallet,
} from '@terra-dev/web-extension-backend';
import { CreateTxOptions } from '@terra-money/terra.js';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { browser } from 'webextension-polyfill-ts';
import { ApproveHostname } from 'frame/components/views/ApproveHostname';
import { CanNotFindTx } from 'frame/components/views/CanNotFindTx';
import { CanNotFindWallet } from 'frame/components/views/CanNotFindWallet';
import { InProgress } from 'frame/components/views/InProgress';
import { SignTxWithEncryptedWallet } from 'frame/components/views/SignTxWithEncryptedWallet';
import { SignTxWithLedgerWallet } from 'frame/components/views/SignTxWithLedgerWallet';
import { UnknownCase } from 'frame/components/views/UnknownCase';
import { useAllowedCommandId } from 'frame/contexts/commands';
import { TX_PORT_PREFIX, WHITELIST_HOSTNAMES } from 'frame/env';

export function TxSignPopup() {
  // ---------------------------------------------
  // read hash urls
  // ---------------------------------------------
  const { search } = useLocation();

  const txRequest = useMemo(() => {
    return txRequestFromURLSearchParams(search);
  }, [search]);

  useAllowedCommandId(txRequest?.id, '/error/abnormal-approach');

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
      name: TX_PORT_PREFIX + txRequest.id,
    });

    port.postMessage({
      status: WebExtensionTxStatus.DENIED,
    });

    port.disconnect();
  }, [txRequest]);

  const cantFindWallet = useCallback(() => {
    if (!txRequest) {
      throw new Error(`Can't find tx information!`);
    }

    const port = browser.runtime.connect(undefined, {
      name: TX_PORT_PREFIX + txRequest.id,
    });

    port.postMessage({
      status: WebExtensionTxStatus.FAIL,
      error: new WebExtensionTxUnspecifiedError(
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

    if (WHITELIST_HOSTNAMES.includes(txRequest.hostname)) {
      setNeedApproveHostname(false);
    } else {
      readHostnamesStorage().then(({ approvedHostnames }) => {
        if (
          !approvedHostnames.some(
            (itemHostname) => itemHostname === txRequest.hostname,
          )
        ) {
          setNeedApproveHostname(true);
        }
      });
    }
  }, [txRequest]);

  useEffect(() => {
    window.addEventListener('beforeunload', deny);
  }, [deny]);

  // ---------------------------------------------
  // presentation
  // ---------------------------------------------
  if (!txRequest) {
    return (
      <Center>
        <CanNotFindTx className="content" />
      </Center>
    );
  }

  if (wallet === undefined) {
    return (
      <Center>
        <CanNotFindWallet
          className="content"
          chainID={txRequest.network.chainID}
          terraAddress={txRequest.terraAddress}
          onConfirm={cantFindWallet}
        />
      </Center>
    );
  } else if (wallet === null) {
    return (
      <Center>
        <InProgress className="content" title="Finding wallet" />
      </Center>
    );
  }

  if (needApproveHostname) {
    return (
      <Center>
        <ApproveHostname
          className="content"
          hostname={txRequest.hostname}
          onCancel={deny}
          onConfirm={approveHostname}
        />
      </Center>
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

const Center = styled.div`
  .content {
    height: 100vh;
    max-height: 600px;
  }
`;

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
    async ({ key, close }: LedgerKeyResponse, resolvedTx: CreateTxOptions) => {
      const port = browser.runtime.connect(undefined, {
        name: TX_PORT_PREFIX + txRequest.id,
      });

      signWithLedgerWallet(
        wallet,
        txRequest.network,
        resolvedTx,
        key,
      ).subscribe({
        next: (result) => {
          if (result.status === WebExtensionTxStatus.SUCCEED) {
            port.postMessage(result);
            close();
          } else if (result.status === WebExtensionTxStatus.DENIED) {
            port.postMessage({
              ...result,
              error: new WebExtensionUserDenied().toJSON(),
            });
            close();
          } else if (result.status === WebExtensionTxStatus.FAIL) {
            port.postMessage({
              ...result,
              error: result.error.toJSON(),
            });
            close();
          }
        },
        error: (error) => {
          port.postMessage({
            status: WebExtensionTxStatus.FAIL,
            error,
          } as WebExtensionTxFail);
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
    [txRequest.closeWindowAfterTx, txRequest.id, txRequest.network, wallet],
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

const DAY = 1000 * 60 * 60 * 24;

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

  const [savedPassword, setSavedPassword] = useState<0 | string | undefined>(0);

  useEffect(() => {
    getSavedPassword(txRequest.terraAddress).then(setSavedPassword);
  }, [txRequest.terraAddress]);

  const proceed = useCallback(
    async (
      decryptedWallet: Wallet,
      resolvedTx: CreateTxOptions,
      password: string | null,
    ) => {
      const port = browser.runtime.connect(undefined, {
        name: TX_PORT_PREFIX + txRequest.id,
      });

      let waitPasswordSaving: Promise<void>;

      signWithEncryptedWallet(
        decryptedWallet,
        txRequest.network,
        resolvedTx,
      ).subscribe({
        next: (result) => {
          if (result.status === WebExtensionTxStatus.SUCCEED) {
            port.postMessage(result);

            if (password) {
              waitPasswordSaving = savePassword(
                txRequest.terraAddress,
                password,
                Date.now() + DAY,
              );
            } else {
              waitPasswordSaving = removeSavedPassword(txRequest.terraAddress);
            }
          } else if (result.status === WebExtensionTxStatus.DENIED) {
            port.postMessage({
              ...result,
              error: new WebExtensionUserDenied().toJSON(),
            });
          } else if (result.status === WebExtensionTxStatus.FAIL) {
            port.postMessage({
              ...result,
              error: result.error.toJSON(),
            });
          }
        },
        error: (error) => {
          port.postMessage({
            status: WebExtensionTxStatus.FAIL,
            error,
          } as WebExtensionTxFail);
        },
        complete: () => {
          port.disconnect();
          if (txRequest.closeWindowAfterTx) {
            Promise.resolve(waitPasswordSaving).then(() => {
              window.close();
            });
          }
        },
      });
    },
    [
      txRequest.closeWindowAfterTx,
      txRequest.id,
      txRequest.network,
      txRequest.terraAddress,
    ],
  );

  if (savedPassword === 0) {
    return null;
  }

  return (
    <SignTxWithEncryptedWallet
      className={className}
      wallet={wallet}
      network={txRequest.network}
      tx={tx}
      hostname={txRequest.hostname}
      date={txRequest.date}
      savedPassword={savedPassword}
      onDeny={deny}
      onProceed={proceed}
    />
  );
}
