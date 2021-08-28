import { WebExtensionNetworkInfo } from '@terra-dev/web-extension';
import { useEffect, useMemo, useState } from 'react';
import { readNetworkStorage } from '../storages/network';

export enum NetworkNameInvalid {
  SAME_NAME_EXISTS = 'SAME_NAME_EXISTS',
}

export function useValidateNetworkName(
  name: string,
  defaultNetworks: WebExtensionNetworkInfo[],
): NetworkNameInvalid | null {
  const [currentNetworks, setCurrentNetworks] = useState<
    WebExtensionNetworkInfo[]
  >(defaultNetworks);

  useEffect(() => {
    readNetworkStorage().then(({ networks }) =>
      setCurrentNetworks([...defaultNetworks, ...networks]),
    );
  }, [defaultNetworks]);

  return useMemo<NetworkNameInvalid | null>(() => {
    if (name.length === 0) {
      return null;
    }

    return currentNetworks.length > 0 &&
      currentNetworks.some((itemNetwork) => itemNetwork.name === name)
      ? NetworkNameInvalid.SAME_NAME_EXISTS
      : null;
  }, [currentNetworks, name]);
}

export enum NetworkLcdURLInvalid {
  INVALID_URL = 'INVALID_URL',
}

export function useValidateNetworkLcdURL(
  lcd: string,
): NetworkLcdURLInvalid | null {
  return useMemo(() => {
    return lcd.startsWith('https://') || lcd.startsWith('http://')
      ? null
      : NetworkLcdURLInvalid.INVALID_URL;
  }, [lcd]);
}
