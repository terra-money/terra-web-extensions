import { CW20TokenDisplayInfo, cw20TokenInfoQuery } from '@libs/app-fns';
import { useApp } from '@libs/app-provider';
import { CW20Addr } from '@libs/types';
import { Button } from '@station/ui2';
import { useWallet } from '@terra-dev/use-wallet';
import React, { useEffect, useState } from 'react';
import { useCW20Tokens } from 'webextension/queries/useCW20Tokens';
import { useTokenIcon } from 'webextension/queries/useTokenIcon';
import { FormFooter } from '../layouts/FormFooter';
import { TokenList, TokenRow } from './AddCW20Token';

export interface ManageCW20TokensProps {
  className?: string;
  initialTokens: string[];
  onRemove: (tokenAddr: string) => void;
  onAdd: (tokenAddr: string) => void;
  onAddAll?: () => void;
  onClose: () => void;
}

export function ManageCW20Tokens({
  className,
  initialTokens,
  onRemove,
  onAdd,
  onAddAll,
  onClose,
}: ManageCW20TokensProps) {
  const { network } = useWallet();

  const existsTokens = useCW20Tokens();

  const tokens = useTokenList(initialTokens);

  return (
    <div className={className}>
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
        <FormFooter>
          <Button variant="danger" size="large" onClick={onClose}>
            Cancel
          </Button>

          <Button variant="primary" size="large" onClick={onAddAll}>
            Add all tokens
          </Button>
        </FormFooter>
      )}
    </div>
  );
}

function useTokenList(tokens: string[]) {
  const { queryClient } = useApp();

  const getTokenIcon = useTokenIcon();

  const [tokenList, setTokenList] = useState<CW20TokenDisplayInfo[]>(() => []);

  useEffect(() => {
    setTokenList([]);

    Promise.all(
      tokens.map((tokenAddr) => {
        return cw20TokenInfoQuery(tokenAddr as CW20Addr, queryClient).then(
          ({ tokenInfo }) => {
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
          },
        );
      }),
    ).then((nextTokenList) => {
      setTokenList(nextTokenList);
    });
  }, [getTokenIcon, tokens, queryClient]);

  return tokenList;
}
