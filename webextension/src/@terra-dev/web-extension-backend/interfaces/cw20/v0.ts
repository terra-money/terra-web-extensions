import { AccAddress } from '@terra-money/terra.js';
import { CW20StorageData, writeCW20Storage } from './v1';

export async function migrateCW20StorageV0(): Promise<() => void> {
  const tokensData = localStorage.getItem('tokens');

  if (!tokensData) {
    return () => {};
  }

  try {
    const tokens = JSON.parse(tokensData);

    const chainIDs = Object.keys(tokens);

    const nextStorage: CW20StorageData = {
      cw20Tokens: {},
    };

    for (const chainID of chainIDs) {
      const cw20Addrs = [];
      const items = Object.values(tokens[chainID]) as any[];

      for (const item of items) {
        if ('token' in item && AccAddress.validate(item.token)) {
          cw20Addrs.push(item.token);
        }
      }

      if (cw20Addrs.length > 0) {
        nextStorage.cw20Tokens[chainID] = cw20Addrs;
      }
    }

    await writeCW20Storage(nextStorage);
  } catch (error) {
    console.error(`Failed migration [cw20/v0]`, error);
  }

  return () => {
    localStorage.removeItem('tokens');
  };
}
