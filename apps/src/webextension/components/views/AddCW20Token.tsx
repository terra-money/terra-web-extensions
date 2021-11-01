import { CW20TokenDisplayInfo, cw20TokenInfoQuery } from '@libs/app-fns';
import { useApp, useCW20TokenDisplayInfosQuery } from '@libs/app-provider';
import { truncate } from '@libs/formatter';
import { CW20Addr } from '@libs/types';
import { CircleButton, SearchTextInput } from '@station/ui';
import { useWallet } from '@terra-dev/use-wallet';
import { AccAddress } from '@terra-money/terra.js';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { MdDone, MdOutlineLaunch } from 'react-icons/md';
import styled from 'styled-components';
import { useTokenIcon } from 'webextension/queries/useTokenIcon';

export interface AddCW20TokenProps {
  className?: string;
  existsTokens: Set<string>;
  onAdd: (tokenAddr: string) => void;
  onRemove: (tokenAddr: string) => void;
  onClose: () => void;
}

export function AddCW20Token({
  className,
  existsTokens,
  onAdd,
  onRemove,
}: AddCW20TokenProps) {
  const { network } = useWallet();

  // ---------------------------------------------
  // states
  // ---------------------------------------------
  const [search, setSearch] = useState<string>('');

  // ---------------------------------------------
  // queries
  // ---------------------------------------------
  const tokens = useFindTokens(search);

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        maxHeight: '100%',
      }}
    >
      <SearchTextInput
        placeholder="Search symbol or address..."
        value={search}
        onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
          setSearch(target.value)
        }
      />

      <TokenList style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {tokens
          .filter(
            ({ symbol }) => symbol.toLowerCase().indexOf('delisted') === -1,
          )
          .map(({ token, symbol, icon }) => {
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
    </div>
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
  const [hide, setHide] = useState<boolean>(false);

  return hide ? null : (
    <li>
      <div className="icon-wrapper">
        <img src={icon} alt={name} onError={() => setHide(true)} />
      </div>
      <div className="label-wrapper">
        <div>{name}</div>
        <div>
          <a href={link} target="_blank" rel="noreferrer">
            {truncate(addr)} <MdOutlineLaunch />
          </a>
        </div>
      </div>
      <div className="button-wrapper">
        {added ? (
          <CircleButton variant="primary" onClick={() => onChange(!added)}>
            <MdDone />
          </CircleButton>
        ) : (
          <CircleButton variant="dim" onClick={() => onChange(!added)}>
            +
          </CircleButton>
        )}
      </div>
    </li>
  );
}

export const TokenList = styled.ul`
  list-style: none;
  padding: 0;

  display: flex;
  flex-direction: column;

  li {
    padding: 12px 0;

    color: var(--color-content-text);

    display: flex;
    justify-content: space-between;
    align-items: center;

    .icon-wrapper {
      padding-right: 12px;

      img {
        width: 24px;
      }
    }

    .label-wrapper {
      flex: 1;

      font-size: 14px;
      font-weight: bold;

      a {
        font-size: 11px;
        font-weight: normal;
        text-decoration: none;

        svg {
          vertical-align: middle;
        }
      }
    }

    &:not(:last-child) {
      border-bottom: 1px solid var(--color-listbox-border);
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
