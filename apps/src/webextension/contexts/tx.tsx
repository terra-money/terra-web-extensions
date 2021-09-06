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
      post: (tx: CreateTxOptions): Promise<TxResult> => {
        return new Promise<TxResult>((resolve, reject) => {
          console.log('tx.tsx..() ????');
          setResolver(
            <PostResolver
              tx={tx}
              wallet={wallet}
              network={network}
              onReject={reject}
              onResolve={resolve}
              onComplete={() => setResolver(null)}
            />,
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

  console.log('tx.tsx..TxProvider()', resolver);

  return (
    <WalletContext.Provider value={states}>
      {children}
      {resolver && <div>What???</div>}
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
  console.log('tx.tsx..PostResolver() !!!!!');

  if ('usbDevice' in wallet) {
    return (
      <SignTxWithLedgerWallet
        wallet={wallet}
        network={network}
        tx={tx}
        hostname={'foo-network'}
        date={new Date()}
        onDeny={() => onReject(new UserDenied())}
        onProceed={(ledgerKey) => {
          executeTxWithLedgerWallet(wallet, network, tx, ledgerKey).subscribe({
            next: (result) => {
              console.log('wallet-provider.tsx..next()', result);
              if (result.status === WebExtensionTxStatus.SUCCEED) {
                onResolve({
                  ...tx,
                  result: result.payload,
                  success: true,
                });
              }
            },
            error: (error) => {
              if (error instanceof WebExtensionUserDenied) {
                onReject(new UserDenied());
              } else if (error instanceof WebExtensionCreateTxFailed) {
                onReject(new CreateTxFailed(tx, error.message));
              } else if (error instanceof WebExtensionTxFailed) {
                onReject(
                  new TxFailed(
                    tx,
                    error.txhash,
                    error.message,
                    error.raw_message,
                  ),
                );
              } else {
                onReject(
                  new TxUnspecifiedError(
                    tx,
                    'message' in error ? error.message : String(error),
                  ),
                );
              }
              onReject(error);
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
        onDeny={() => new UserDenied()}
        onProceed={(w) => {
          executeTxWithInternalWallet(w, network, tx).subscribe({
            next: (result) => {
              console.log('wallet-provider.tsx..next()', result);
              if (result.status === WebExtensionTxStatus.SUCCEED) {
                onResolve({
                  ...tx,
                  result: result.payload,
                  success: true,
                });
              }
            },
            error: (error) => {
              if (error instanceof WebExtensionUserDenied) {
                onReject(new UserDenied());
              } else if (error instanceof WebExtensionCreateTxFailed) {
                onReject(new CreateTxFailed(tx, error.message));
              } else if (error instanceof WebExtensionTxFailed) {
                onReject(
                  new TxFailed(
                    tx,
                    error.txhash,
                    error.message,
                    error.raw_message,
                  ),
                );
              } else {
                onReject(
                  new TxUnspecifiedError(
                    tx,
                    'message' in error ? error.message : String(error),
                  ),
                );
              }
              onReject(error);
            },
            complete: onComplete,
          });
        }}
      />
    );
  }

  return <div>Unknown case!</div>;
}
