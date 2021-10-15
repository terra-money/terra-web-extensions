import { CW20TokenDisplayInfo, cw20TokenInfoQuery } from '@libs/app-fns';
import { useApp, useCW20TokenDisplayInfosQuery } from '@libs/app-provider';
import { truncate } from '@libs/formatter';
import { CW20Addr } from '@libs/types';
import { FormLayout, Layout, MiniButton, TextInput } from '@station/ui';
import { useWallet } from '@terra-dev/use-wallet';
import { AccAddress } from '@terra-money/terra.js';
import React, { ChangeEvent, ReactNode, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useCW20Tokens } from 'webextension/queries/useCW20Tokens';
import { useTokenIcon } from 'webextension/queries/useTokenIcon';

export interface AddCW20TokenProps {
  className?: string;
  onAdd: (tokenAddr: string) => void;
  onRemove: (tokenAddr: string) => void;
  onClose: () => void;
  children?: ReactNode;
}

export function AddCW20Token({
  className,
  onAdd,
  onRemove,
  children,
}: AddCW20TokenProps) {
  const { network } = useWallet();

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
    <Layout className={className}>
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
    </Layout>
  );
}

export function TokenRow({
  added,
  addr,
  name,
  icon,
  link,
  onChange,
}: {
  added: boolean;
  icon: string;
  name: string;
  addr: string;
  link: string;
  onChange: (added: boolean) => void;
}) {
  return (
    <li>
      <div>
        <p>
          <img src={icon} alt={name} /> {name}
        </p>
        <a href={link} target="_blank" rel="noreferrer">
          {truncate(addr)}
        </a>
      </div>
      <div>
        <MiniButton onClick={() => onChange(!added)}>
          {added ? 'Added' : 'Add'}
        </MiniButton>
      </div>
    </li>
  );
}

export const TokenList = styled.ul`
  list-style: none;
  padding: 0;

  display: flex;
  flex-direction: column;
  gap: 10px;

  li {
    border: 1px solid #cccccc;
    border-radius: 3px;
    padding: 10px;

    display: flex;
    justify-content: space-between;
    align-items: center;

    p {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    img {
      height: 1em;
    }
  }
`;

function useFindTokens(search: string): CW20TokenDisplayInfo[] {
  const { queryClient } = useApp();
  const { network } = useWallet();
  const { data: cw20TokenDisplayInfos } = useCW20TokenDisplayInfosQuery();

  const getTokenIcon = useTokenIcon();

  const [tokenList, setTokenList] = useState<CW20TokenDisplayInfo[]>(() => []);

  useEffect(() => {
    if (AccAddress.validate(search)) {
      const tokenAddr: CW20Addr = search as CW20Addr;

      cw20TokenInfoQuery(tokenAddr, queryClient).then(({ tokenInfo }) => {
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
      });
    } else if (search.trim().length === 0) {
      setTokenList(
        cw20TokenDisplayInfos?.[network.name]
          ? Object.values(cw20TokenDisplayInfos[network.name])
          : [],
      );
    } else {
      setTokenList(
        cw20TokenDisplayInfos?.[network.name]
          ? Object.values(cw20TokenDisplayInfos[network.name]).filter(
              ({ symbol }) =>
                symbol.toLowerCase().indexOf(search.toLowerCase()) > -1,
            )
          : [],
      );
    }
  }, [cw20TokenDisplayInfos, getTokenIcon, network.name, search, queryClient]);

  return tokenList;
}
