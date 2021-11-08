import { TerraBalancesWithTokenInfo } from '@libs/app-fns';
import { formatUToken } from '@libs/formatter';
import { ListBox } from '@station/ui';
import React from 'react';
import { MdChevronRight } from 'react-icons/md';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FormMain } from '../layouts/FormMain';

export interface TokenInfoProps {
  className?: string;
  terraAddress: string;
  token: TerraBalancesWithTokenInfo['tokens'][number];
}

export function TokenInfo({ className, terraAddress, token }: TokenInfoProps) {
  return (
    <div className={className}>
      <FormMain>
        <ul style={{ marginBottom: 20 }}>
          <li>token name: {token.info?.name}</li>
          <li>token symbol: {token.info?.symbol}</li>
          <li>
            balance: {formatUToken(token.balance)} {token.info?.symbol}
          </li>
        </ul>

        <ListBox enableItemInteraction disableItemPadding>
          <ToolListItem>
            <Link
              to={`/wallet/${terraAddress}/send/${
                'native_token' in token.asset
                  ? token.asset.native_token.denom
                  : token.asset.token.contract_addr
              }`}
            >
              <span>Send</span>
              <MdChevronRight />
            </Link>
          </ToolListItem>
          <ToolListItem>
            <a
              href="https://station.terra.money/swap"
              target="_blank"
              rel="noreferrer"
            >
              <span>Swap</span>
              <MdChevronRight />
            </a>
          </ToolListItem>
          {'native_token' in token.asset &&
            token.asset.native_token.denom === 'uusd' && <USTItem />}
        </ListBox>
      </FormMain>
    </div>
  );
}

function USTItem() {
  return (
    <ToolListItem>
      <a
        href="https://app.anchorprotocol.com/earn"
        target="_blank"
        rel="noreferrer"
      >
        <span>Deposit</span>
        <MdChevronRight />
      </a>
    </ToolListItem>
  );
}

const ToolListItem = styled.li`
  a {
    padding: 0 20px;
    height: 60px;

    display: flex;
    justify-content: space-between;
    align-items: center;

    text-decoration: none;

    color: inherit;

    font-size: 14px;
    font-weight: 700;
  }
`;
