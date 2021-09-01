import {
  CW20StorageData,
  observeCW20Storage,
} from '@terra-dev/web-extension-backend';
import { useEffect, useMemo, useState } from 'react';
import { useNetworks } from './useNetworks';

export function useCW20Tokens() {
  const { selectedNetwork } = useNetworks();

  const [cw20Tokens, setCW20Tokens] = useState<CW20StorageData>(() => ({
    cw20Tokens: {},
  }));

  useEffect(() => {
    observeCW20Storage().subscribe({
      next: setCW20Tokens,
    });
  }, []);

  return useMemo(() => {
    if (!selectedNetwork) {
      return [];
    }

    return cw20Tokens.cw20Tokens[selectedNetwork.chainID] ?? [];
  }, [cw20Tokens.cw20Tokens, selectedNetwork]);
}
