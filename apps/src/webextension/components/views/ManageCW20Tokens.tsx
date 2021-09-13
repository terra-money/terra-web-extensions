import { CW20Addr } from '@libs/types';
import { CW20Icon, cw20TokenInfoQuery } from '@libs/webapp-fns';
import { useTerraWebapp } from '@libs/webapp-provider';
import { Button } from '@material-ui/core';
import { Layout } from '@station/ui';
import { useWallet } from '@terra-dev/use-wallet';
import React, { ReactNode, useEffect, useState } from 'react';
import { useCW20Tokens } from 'webextension/queries/useCW20Tokens';
import { useTokenIcon } from 'webextension/queries/useTokenIcon';
import { TokenList, TokenRow } from './AddCW20Token';

export interface ManageCW20TokensProps {
  className?: string;
  initialTokens: string[];
  onRemove: (tokenAddr: string) => void;
  onAdd: (tokenAddr: string) => void;
  onAddAll?: () => void;
  onClose: () => void;
  children?: ReactNode;
}

export function ManageCW20Tokens({
  className,
  initialTokens,
  onRemove,
  onAdd,
  children,
  onAddAll,
  onClose,
}: ManageCW20TokensProps) {
  const { network } = useWallet();

  const existsTokens = useCW20Tokens();

  const tokens = useTokenList(initialTokens);

  return (
    <Layout className={className}>
      {children}

      <TokenList>
        {tokens.map(({ token, symbol, icon }) => {
          const exists = existsTokens.has(token);
          return (
            <TokenRow
              key={token}
              added={exists}
              icon={icon}
              name={symbol}
              addr={token}
              link={`https://finder.terra.money/${network.chainID}/address/${token}`}
              onChange={(nextAdded) =>
                nextAdded ? onAdd(token) : onRemove(token)
              }
            />
          );
        })}
      </TokenList>

      {onAddAll && (
        <footer>
          <Button variant="contained" color="secondary" onClick={onClose}>
            Cancel
          </Button>

          <Button variant="contained" color="primary" onClick={onAddAll}>
            Add all tokens
          </Button>
        </footer>
      )}
    </Layout>
  );
}

function useTokenList(tokens: string[]) {
  const { mantleEndpoint, mantleFetch } = useTerraWebapp();

  const getTokenIcon = useTokenIcon();

  const [tokenList, setTokenList] = useState<CW20Icon[]>(() => []);

  useEffect(() => {
    setTokenList([]);

    Promise.all(
      tokens.map((tokenAddr) => {
        return cw20TokenInfoQuery(
          tokenAddr as CW20Addr,
          mantleEndpoint,
          mantleFetch,
        ).then(({ tokenInfo }) => {
          return {
            token: tokenAddr as CW20Addr,
            icon: getTokenIcon({
              token: {
                contract_addr: tokenAddr as CW20Addr,
              },
            }),
            symbol: tokenInfo.symbol,
            protocol: tokenInfo.name,
          };
        });
      }),
    ).then((nextTokenList) => {
      setTokenList(nextTokenList);
    });
  }, [getTokenIcon, mantleEndpoint, mantleFetch, tokens]);

  return tokenList;
}
