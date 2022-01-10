import { cw20, NativeDenom, Token, u } from '@libs/types';

export function nativeTokenInfoQuery<T extends Token>(
  denom: NativeDenom,
): cw20.TokenInfoResponse<T> | undefined {
  switch (denom) {
    //case 'uust':
    case 'uusd':
      return {
        decimals: 6,
        name: 'UST',
        symbol: 'UST',
        total_supply: '0' as u<T>,
      };
    case 'uluna':
      return {
        decimals: 6,
        name: 'LUNA',
        symbol: 'LUNA',
        total_supply: '0' as u<T>,
      };
    //case 'ukrt':
    case 'ukrw':
      return {
        decimals: 6,
        name: 'KRT',
        symbol: 'KRT',
        total_supply: '0' as u<T>,
      };
    case 'uaud':
      return {
        decimals: 6,
        name: 'AUT',
        symbol: 'AUT',
        total_supply: '0' as u<T>,
      };
    case 'ucad':
      return {
        decimals: 6,
        name: 'CAT',
        symbol: 'CAT',
        total_supply: '0' as u<T>,
      };
    case 'uchf':
      return {
        decimals: 6,
        name: 'CHT',
        symbol: 'CHT',
        total_supply: '0' as u<T>,
      };
    case 'ucny':
      return {
        decimals: 6,
        name: 'CNT',
        symbol: 'CNT',
        total_supply: '0' as u<T>,
      };
    case 'udkk':
      return {
        decimals: 6,
        name: 'DKT',
        symbol: 'DKT',
        total_supply: '0' as u<T>,
      };
    case 'ueur':
      return {
        decimals: 6,
        name: 'EUT',
        symbol: 'EUT',
        total_supply: '0' as u<T>,
      };
    case 'ugbp':
      return {
        decimals: 6,
        name: 'GBT',
        symbol: 'GBT',
        total_supply: '0' as u<T>,
      };
    case 'uhkd':
      return {
        decimals: 6,
        name: 'HKT',
        symbol: 'HKT',
        total_supply: '0' as u<T>,
      };
    case 'uidr':
      return {
        decimals: 6,
        name: 'IDT',
        symbol: 'IDT',
        total_supply: '0' as u<T>,
      };
    case 'uinr':
      return {
        decimals: 6,
        name: 'INT',
        symbol: 'INT',
        total_supply: '0' as u<T>,
      };
    case 'ujpy':
      return {
        decimals: 6,
        name: 'JPT',
        symbol: 'JPT',
        total_supply: '0' as u<T>,
      };
    case 'umnt':
      return {
        decimals: 6,
        name: 'MNT',
        symbol: 'MNT',
        total_supply: '0' as u<T>,
      };
    case 'unok':
      return {
        decimals: 6,
        name: 'NOT',
        symbol: 'NOT',
        total_supply: '0' as u<T>,
      };
    case 'uphp':
      return {
        decimals: 6,
        name: 'PHT',
        symbol: 'PHT',
        total_supply: '0' as u<T>,
      };
    case 'usdr':
      return {
        decimals: 6,
        name: 'SDT',
        symbol: 'SDT',
        total_supply: '0' as u<T>,
      };
    case 'usek':
      return {
        decimals: 6,
        name: 'SET',
        symbol: 'SET',
        total_supply: '0' as u<T>,
      };
    case 'usgd':
      return {
        decimals: 6,
        name: 'SGT',
        symbol: 'SGT',
        total_supply: '0' as u<T>,
      };
    case 'uthb':
      return {
        decimals: 6,
        name: 'THT',
        symbol: 'THT',
        total_supply: '0' as u<T>,
      };
  }

  return undefined;
}
