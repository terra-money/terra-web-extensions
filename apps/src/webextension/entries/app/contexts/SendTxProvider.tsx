import { cw20, Token } from '@libs/types';
import {
  WebConnectorCreateTxFailed,
  WebConnectorLedgerError,
  WebConnectorNetworkInfo,
  WebConnectorTxFailed,
  WebConnectorTxStatus,
  WebConnectorUserDenied,
} from '@terra-dev/web-connector-interface';
import {
  createLedgerKey,
  EncryptedWallet,
  executeTxWithInternalWallet,
  executeTxWithLedgerWallet,
  LedgerWallet,
} from '@terra-dev/web-extension-backend';
import { CreateTxOptions } from '@terra-money/terra.js';
import {
  ConnectType,
  CreateTxFailed,
  TxFailed,
  TxResult,
  TxUnspecifiedError,
  UserDenied,
  Wallet,
  WalletContext,
  WalletStatus,
} from '@terra-money/use-wallet';
import React, { ReactNode, useMemo, useState } from 'react';
import styled from 'styled-components';
import { SubLayout } from 'webextension/components/layouts/SubLayout';
import { SignTxWithEncryptedWallet } from 'webextension/components/views/SignTxWithEncryptedWallet';
import { SignTxWithLedgerWallet } from 'webextension/components/views/SignTxWithLedgerWallet';

export interface SendTxProviderProps {
  children: ReactNode;
  wallet: EncryptedWallet | LedgerWallet;
  network: WebConnectorNetworkInfo;
  tokenInfo: cw20.TokenInfoResponse<Token>;
}

export function SendTxProvider({
  children,
  wallet,
  network,
  tokenInfo,
}: SendTxProviderProps) {
  const [resolver, setResolver] = useState<ReactNode>(null);

  const states = useMemo<Wallet>(() => {
    return {
      availableConnectTypes: [ConnectType.WEB_CONNECT],
      availableInstallTypes: [],
      availableConnections: [
        { type: ConnectType.WEB_CONNECT, name: 'extension-internal', icon: '' },
      ],
      status: WalletStatus.WALLET_CONNECTED,
      network,
      wallets: [
        {
          connectType: ConnectType.WEB_CONNECT,
          terraAddress: wallet.terraAddress,
          design: wallet.design,
        },
      ],
      install: () => {
        throw new Error('not implemented!');
      },
      connect: () => {
        throw new Error('not implemented!');
      },
      connectReadonly: () => {
        throw new Error('not implemented!');
      },
      disconnect: () => {
        throw new Error('not implemented!');
      },
      sign: () => {
        throw new Error('not implemented!');
      },
      post: (tx: CreateTxOptions): Promise<TxResult> => {
        return new Promise<TxResult>((resolve, reject) => {
          setResolver(
            <Layer>
              <PostResolver
                tokenInfo={tokenInfo}
                tx={tx}
                wallet={wallet}
                network={network}
                onReject={(error) => {
                  reject(error);
                  setResolver(null);
                }}
                onResolve={(txResult) => {
                  resolve(txResult);
                  setResolver(null);
                }}
                onComplete={() => {
                  setResolver(null);
                }}
              />
            </Layer>,
          );
        });
      },
      recheckStatus: () => {
        throw new Error('not implemented!');
      },
      isChromeExtensionCompatibleBrowser: () => {
        throw new Error('not implemented!');
      },
    };
  }, [network, tokenInfo, wallet]);

  return (
    <WalletContext.Provider value={states}>
      {children}
      {resolver}
    </WalletContext.Provider>
  );
}

function PostResolver({
  tokenInfo,
  tx,
  network,
  wallet,
  onResolve,
  onReject,
  onComplete,
}: {
  tokenInfo: cw20.TokenInfoResponse<Token>;
  tx: CreateTxOptions;
  wallet: EncryptedWallet | LedgerWallet;
  network: WebConnectorNetworkInfo;
  onReject: (error: unknown) => void;
  onResolve: (txResult: TxResult) => void;
  onComplete: () => void;
}) {
  if ('usbDevice' in wallet) {
    return (
      <SubLayout title={`Send ${tokenInfo.symbol}`} disableMaxWidth>
        <SignTxWithLedgerWallet
          wallet={wallet}
          network={network}
          tx={tx}
          date={new Date()}
          createLedgerKey={createLedgerKey}
          onDeny={() => onReject(new UserDenied())}
          onProceed={({ key, close }, resolvedTx) => {
            executeTxWithLedgerWallet(
              wallet,
              network,
              resolvedTx,
              key,
            ).subscribe({
              next: (result) => {
                if (result.status === WebConnectorTxStatus.SUCCEED) {
                  onResolve({
                    ...resolvedTx,
                    result: result.payload,
                    success: true,
                  });
                  close();
                } else if (result.status === WebConnectorTxStatus.DENIED) {
                  onReject(new UserDenied());
                  close();
                } else if (result.status === WebConnectorTxStatus.FAIL) {
                  onReject(toWalletError(resolvedTx, result.error));
                  close();
                }
              },
              error: (error) => {
                onReject(toWalletError(resolvedTx, error));
                close();
              },
              complete: onComplete,
            });
          }}
        />
      </SubLayout>
    );
  }

  if ('encryptedWallet' in wallet) {
    return (
      <SubLayout title={`Send ${tokenInfo.symbol}`} disableMaxWidth>
        <SignTxWithEncryptedWallet
          wallet={wallet}
          network={network}
          tx={tx}
          date={new Date()}
          onDeny={() => onReject(new UserDenied())}
          onProceed={(decryptedWallet, resolvedTx) => {
            executeTxWithInternalWallet(
              decryptedWallet,
              network,
              resolvedTx,
            ).subscribe({
              next: (result) => {
                if (result.status === WebConnectorTxStatus.SUCCEED) {
                  onResolve({
                    ...resolvedTx,
                    result: result.payload,
                    success: true,
                  });
                } else if (result.status === WebConnectorTxStatus.DENIED) {
                  onReject(new UserDenied());
                } else if (result.status === WebConnectorTxStatus.FAIL) {
                  onReject(toWalletError(resolvedTx, result.error));
                }
              },
              error: (error) => {
                onReject(toWalletError(resolvedTx, error));
              },
              complete: onComplete,
            });
          }}
        />
      </SubLayout>
    );
  }

  return <div>Unknown case!</div>;
}

function toWalletError(tx: CreateTxOptions, error: unknown) {
  if (error instanceof WebConnectorUserDenied) {
    return new UserDenied();
  } else if (error instanceof WebConnectorCreateTxFailed) {
    return new CreateTxFailed(tx, error.message);
  } else if (error instanceof WebConnectorTxFailed) {
    return new TxFailed(tx, error.txhash, error.message, error.raw_message);
  } else if (error instanceof WebConnectorLedgerError) {
    // TODO replace to TxLedgerError
    return new CreateTxFailed(tx, `${error.code}: ${error.message}`);
  } else {
    return new TxUnspecifiedError(
      tx,
      error instanceof Error ? error.message : String(error),
    );
  }
}

const Layer = styled.div`
  background-color: #ffffff;

  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;

  overflow-y: auto;
`;
