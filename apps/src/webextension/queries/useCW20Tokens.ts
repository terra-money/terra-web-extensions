import { useWallet } from '@terra-dev/use-wallet';
import {
  CW20StorageData,
  observeCW20Storage,
} from '@terra-dev/web-extension-backend';
import { useEffect, useMemo, useState } from 'react';

export function useCW20Tokens() {
  const { network } = useWallet();

  const [cw20Tokens, setCW20Tokens] = useState<CW20StorageData>(() => ({
    cw20Tokens: {},
  }));

  useEffect(() => {
    observeCW20Storage().subscribe({
      next: setCW20Tokens,
    });
  }, []);

  return useMemo(() => {
    return cw20Tokens.cw20Tokens[network.chainID] ?? [];
  }, [cw20Tokens.cw20Tokens, network.chainID]);
}
