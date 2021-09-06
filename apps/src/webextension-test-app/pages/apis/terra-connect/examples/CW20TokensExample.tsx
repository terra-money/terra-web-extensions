import { useWebExtension } from '@station/web-extension-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

const ancAddr = {
  mainnet: 'terra14z56l0fp2lsf86zy3hty2z47ezkhnthtr9yq76',
  testnet: 'terra1747mad58h0w4y589y3sk84r5efqdev9q4r02pc',
};

const blunaAddr = {
  mainnet: 'terra1kc87mu460fwkqte29rquh4hc20m54fxwtsx7gp',
  testnet: 'terra1u0t35drzyy0mujj8rkdyzhe264uls4ug3wdp3x',
};

const bethAddr = {
  mainnet: 'terra1dzhzukyezv0etz22ud940z7adyv7xgcjkahuun',
  testnet: 'terra19mkj9nec6e3y5754tlnuz4vem7lzh4n0lc2s3l',
};

export function CW20TokensExample() {
  const { states, hasCW20Tokens, addCW20Tokens } = useWebExtension();

  const [addedStates, setAddedStates] = useState<{
    [tokenAddr: string]: boolean;
  } | null>(null);

  const network = useMemo(() => {
    return states?.network.name === 'mainnet' ? 'mainnet' : 'testnet';
  }, [states?.network.name]);

  const reloadAddedStates = useCallback(async () => {
    if (states?.network) {
      const result = await hasCW20Tokens(
        states.network.chainID,
        ancAddr[network],
        blunaAddr[network],
        bethAddr[network],
      );
      setAddedStates(result);
    }
  }, [hasCW20Tokens, network, states?.network]);

  const add = useCallback(
    async (tokenAddrs: string[]) => {
      if (states?.network) {
        const result = await addCW20Tokens(
          states?.network.chainID,
          ...tokenAddrs,
        );
        console.log(
          'CW20TokensExample.tsx..() result of addCW20Tokens',
          result,
        );
        if (result) {
          await reloadAddedStates();
        }
      }
    },
    [addCW20Tokens, reloadAddedStates, states?.network],
  );

  useEffect(() => {
    reloadAddedStates();
  }, [hasCW20Tokens, network, reloadAddedStates, states]);

  return (
    <div>
      <pre>{JSON.stringify(addedStates, null, 2)}</pre>

      {states && addedStates && (
        <>
          <button
            onClick={() =>
              add([ancAddr[network], blunaAddr[network], bethAddr[network]])
            }
          >
            Add Tokens
          </button>
        </>
      )}
    </div>
  );
}
