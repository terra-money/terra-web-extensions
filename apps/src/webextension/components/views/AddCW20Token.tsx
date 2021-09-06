import { CW20Addr } from '@libs/types';
import { CW20Icon, cw20TokenInfoQuery } from '@libs/webapp-fns';
import { useCW20IconsQuery, useTerraWebapp } from '@libs/webapp-provider';
import { FormLayout, Layout, TextInput } from '@station/ui';
import { useWallet } from '@terra-dev/use-wallet';
import { AccAddress } from '@terra-money/terra.js';
import React, { ChangeEvent, ReactNode, useEffect, useState } from 'react';
import { useCW20Tokens } from 'webextension/queries/useCW20Tokens';
import { useTokenIcon } from 'webextension/queries/useTokenIcon';

export interface AddCW20TokenResult {
  tokenAddr: string;
}

export interface AddCW20TokenProps {
  onAdd: (result: AddCW20TokenResult) => void;
  onClose: () => void;
  children?: ReactNode;
}

export function AddCW20Token({ onAdd, onClose, children }: AddCW20TokenProps) {
  const existsTokens = useCW20Tokens();

  // ---------------------------------------------
  // states
  // ---------------------------------------------
  const [search, setSearch] = useState<string>('');

  // ---------------------------------------------
  // queries
  // ---------------------------------------------
  const tokens = useFindTokens(search);

  return (
    <Layout>
      {children}

      <FormLayout>
        <TextInput
          fullWidth
          placeholder="Search symbol or address..."
          value={search}
          onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
            setSearch(target.value)
          }
        />
      </FormLayout>

      <ul>
        {tokens.map(({ token, symbol, icon }) => {
          const exists = existsTokens.includes(token);
          return (
            <li
              key={token}
              style={{
                textDecoration: exists ? 'line-through' : undefined,
                cursor: exists ? undefined : 'pointer',
              }}
              onClick={
                exists
                  ? undefined
                  : () =>
                      onAdd({
                        tokenAddr: token,
                      })
              }
            >
              {JSON.stringify({ symbol })}
            </li>
          );
        })}
      </ul>
    </Layout>
  );
}

function useFindTokens(search: string): CW20Icon[] {
  const { mantleEndpoint, mantleFetch } = useTerraWebapp();

  const { network } = useWallet();
  const { data: cw20Tokens } = useCW20IconsQuery();

  const getTokenIcon = useTokenIcon();

  const [tokenList, setTokenList] = useState<CW20Icon[]>(() => []);

  useEffect(() => {
    if (AccAddress.validate(search)) {
      const tokenAddr: CW20Addr = search as CW20Addr;

      cw20TokenInfoQuery(tokenAddr, mantleEndpoint, mantleFetch).then(
        ({ tokenInfo }) => {
          setTokenList([
            {
              token: tokenAddr,
              icon: getTokenIcon(
                {
                  token: {
                    contract_addr: tokenAddr,
                  },
                },
                tokenInfo,
              ),
              symbol: tokenInfo.symbol,
              protocol: tokenInfo.name,
            },
          ]);
        },
      );
    } else if (search.trim().length === 0) {
      setTokenList(
        cw20Tokens?.[network.name]
          ? Object.values(cw20Tokens[network.name])
          : [],
      );
    } else {
      setTokenList(
        cw20Tokens?.[network.name]
          ? Object.values(cw20Tokens[network.name]).filter(
              ({ symbol }) =>
                symbol.toLowerCase().indexOf(search.toLowerCase()) > -1,
            )
          : [],
      );
    }
  }, [
    cw20Tokens,
    getTokenIcon,
    mantleEndpoint,
    mantleFetch,
    network.name,
    search,
  ]);

  return tokenList;
}
