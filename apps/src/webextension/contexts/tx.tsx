import {
  ConnectType,
  Wallet,
  WalletContext,
  WalletStatus,
} from '@terra-dev/use-wallet';
import {
  CreateTxFailed,
  TxFailed,
  TxResult,
  TxUnspecifiedError,
  UserDenied,
} from '@terra-dev/wallet-types';
import {
  WebExtensionCreateTxFailed,
  WebExtensionLedgerError,
  WebExtensionNetworkInfo,
  WebExtensionTxFailed,
  WebExtensionTxStatus,
  WebExtensionUserDenied,
} from '@terra-dev/web-extension';
import {
  EncryptedWallet,
  executeTxWithInternalWallet,
  executeTxWithLedgerWallet,
  LedgerWallet,
} from '@terra-dev/web-extension-backend';
import { CreateTxOptions } from '@terra-money/terra.js';
import React, { ReactNode, useMemo, useState } from 'react';
import styled from 'styled-components';
import { SignTxWithEncryptedWallet } from 'webextension/components/views/SignTxWithEncryptedWallet';
import { SignTxWithLedgerWallet } from 'webextension/components/views/SignTxWithLedgerWallet';

export interface TxProviderProps {
  children: ReactNode;
  wallet: EncryptedWallet | LedgerWallet;
  network: WebExtensionNetworkInfo;
}

export function TxProvider({ children, wallet, network }: TxProviderProps) {
  const [resolver, setResolver] = useState<ReactNode>(null);

  const states = useMemo<Wallet>(() => {
    return {
      availableConnectTypes: [ConnectType.WEBEXTENSION],
      availableInstallTypes: [],
      status: WalletStatus.WALLET_CONNECTED,
      network,
      wallets: [
        {
          connectType: ConnectType.WEBEXTENSION,
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
  }, [network, wallet]);

  return (
    <WalletContext.Provider value={states}>
      {children}
      {resolver}
    </WalletContext.Provider>
  );
}

function PostResolver({
  tx,
  network,
  wallet,
  onResolve,
  onReject,
  onComplete,
}: {
  tx: CreateTxOptions;
  wallet: EncryptedWallet | LedgerWallet;
  network: WebExtensionNetworkInfo;
  onReject: (error: unknown) => void;
  onResolve: (txResult: TxResult) => void;
  onComplete: () => void;
}) {
  if ('usbDevice' in wallet) {
    return (
      <SignTxWithLedgerWallet
        wallet={wallet}
        network={network}
        tx={tx}
        hostname={'foo-network'}
        date={new Date()}
        onDeny={() => onReject(new UserDenied())}
        onProceed={({ key, close }) => {
          executeTxWithLedgerWallet(wallet, network, tx, key).subscribe({
            next: (result) => {
              if (result.status === WebExtensionTxStatus.SUCCEED) {
                onResolve({
                  ...tx,
                  result: result.payload,
                  success: true,
                });
                close();
              } else if (result.status === WebExtensionTxStatus.DENIED) {
                onReject(new UserDenied());
                close();
              } else if (result.status === WebExtensionTxStatus.FAIL) {
                onReject(toWalletError(tx, result.error));
                close();
              }
            },
            error: (error) => {
              onReject(toWalletError(tx, error));
              close();
            },
            complete: onComplete,
          });
        }}
      />
    );
  }

  if ('encryptedWallet' in wallet) {
    return (
      <SignTxWithEncryptedWallet
        wallet={wallet}
        network={network}
        tx={tx}
        hostname={'foo-network'}
        date={new Date()}
        onDeny={() => onReject(new UserDenied())}
        onProceed={(w) => {
          executeTxWithInternalWallet(w, network, tx).subscribe({
            next: (result) => {
              if (result.status === WebExtensionTxStatus.SUCCEED) {
                onResolve({
                  ...tx,
                  result: result.payload,
                  success: true,
                });
              } else if (result.status === WebExtensionTxStatus.DENIED) {
                onReject(new UserDenied());
              } else if (result.status === WebExtensionTxStatus.FAIL) {
                onReject(toWalletError(tx, result.error));
              }
            },
            error: (error) => {
              onReject(toWalletError(tx, error));
            },
            complete: onComplete,
          });
        }}
      />
    );
  }

  return <div>Unknown case!</div>;
}

function toWalletError(tx: CreateTxOptions, error: unknown) {
  if (error instanceof WebExtensionUserDenied) {
    return new UserDenied();
  } else if (error instanceof WebExtensionCreateTxFailed) {
    return new CreateTxFailed(tx, error.message);
  } else if (error instanceof WebExtensionTxFailed) {
    return new TxFailed(tx, error.txhash, error.message, error.raw_message);
  } else if (error instanceof WebExtensionLedgerError) {
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

  position: absolute;
  top: 0;
  left: 0;
  right: 0;

  padding: 20px;
`;
