import { WebExtensionNetworkInfo } from '@terra-dev/web-extension';
import { useEffect, useState } from 'react';
import { FALLBACK_NETWORKS } from 'webextension/env';

function parseData(
  data: Record<string, WebExtensionNetworkInfo>,
): WebExtensionNetworkInfo[] {
  return Object.keys(data)
    .filter((name) => name !== 'localterra')
    .map((name) => data[name]);
}

const STORAGE_KEY = 'networks';

let cachedDataString: string = localStorage.getItem(STORAGE_KEY) ?? '';
let cache: WebExtensionNetworkInfo[] =
  cachedDataString !== ''
    ? parseData(JSON.parse(cachedDataString))
    : FALLBACK_NETWORKS;

export function getDefaultNetworks(): Promise<WebExtensionNetworkInfo[]> {
  return fetch('https://assets.terra.money/chains.json')
    .then((res) => res.json())
    .then((data: Record<string, WebExtensionNetworkInfo>) => {
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

export function useDefaultNetworks(): WebExtensionNetworkInfo[] {
  const [data, setData] = useState<WebExtensionNetworkInfo[]>(() => cache);

  useEffect(() => {
    getDefaultNetworks().then(setData);
  }, []);

  return data;
}
