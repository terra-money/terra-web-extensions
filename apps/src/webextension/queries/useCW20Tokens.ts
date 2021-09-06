import { useWallet } from '@terra-dev/use-wallet';
import {
  CW20StorageData,
  observeCW20Storage,
} from '@terra-dev/web-extension-backend';
import { useEffect, useMemo, useState } from 'react';

export function useCW20Tokens(): Set<string> {
  const { network } = useWallet();

  const [cw20Tokens, setCW20Tokens] = useState<CW20StorageData>(() => ({
    cw20Tokens: {},
  }));

  useEffect(() => {
    const subscription = observeCW20Storage().subscribe({
      next: setCW20Tokens,
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return useMemo(() => {
    return new Set(cw20Tokens.cw20Tokens[network.chainID]) ?? new Set();
  }, [cw20Tokens.cw20Tokens, network.chainID]);
}
