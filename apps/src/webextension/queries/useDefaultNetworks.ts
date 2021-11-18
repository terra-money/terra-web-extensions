import { WalletNetworkInfo } from '@terra-dev/wallet-interface';
import { useEffect, useState } from 'react';
import { FALLBACK_NETWORKS } from 'webextension/env';

function parseData(
  data: Record<string, WalletNetworkInfo>,
): WalletNetworkInfo[] {
  return Object.keys(data)
    .filter((name) => name !== 'localterra')
    .map((name) => data[name]);
}

const STORAGE_KEY = 'networks';

let cachedDataString: string = localStorage.getItem(STORAGE_KEY) ?? '';
let cache: WalletNetworkInfo[] =
  cachedDataString !== ''
    ? parseData(JSON.parse(cachedDataString))
    : FALLBACK_NETWORKS;

export function getDefaultNetworks(): Promise<WalletNetworkInfo[]> {
  return fetch('https://assets.terra.money/chains.json')
    .then((res) => res.json())
    .then((data: Record<string, WalletNetworkInfo>) => {
      const dataString = JSON.stringify(data);

      if (cachedDataString === dataString) {
        return cache;
      }

      const result = parseData(data);

      cache = result;
      cachedDataString = dataString;
      localStorage.setItem(STORAGE_KEY, dataString);

      return result;
    })
    .catch((error) => {
      console.error(error);
      return cache;
    });
}

export function useDefaultNetworks(): WalletNetworkInfo[] {
  const [data, setData] = useState<WalletNetworkInfo[]>(() => cache);

  useEffect(() => {
    getDefaultNetworks().then(setData);
  }, []);

  return data;
}
