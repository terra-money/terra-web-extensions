import { terraTokenUstValueQuery } from '@libs/app-fns';
import { TEST_CONTRACT_ADDRESS, TEST_LCD_CLIENT } from '@libs/app-fns/test-env';
import { CW20Addr, Token, u } from '@libs/types';

describe('tokenUstValue()', () => {
  test('should get ust value of asset', async () => {
    const lunaUstValue = await terraTokenUstValueQuery(
      {
        native_token: {
          denom: 'uluna',
        },
      },
      '1000000' as u<Token>,
      TEST_CONTRACT_ADDRESS.terraswap.factory,
      TEST_LCD_CLIENT,
    );

    const krtUstValue = await terraTokenUstValueQuery(
      {
        native_token: {
          denom: 'ukrw',
        },
      },
      '1000000' as u<Token>,
      TEST_CONTRACT_ADDRESS.terraswap.factory,
      TEST_LCD_CLIENT,
    );

    const blunaUstValue = await terraTokenUstValueQuery(
      {
        token: {
          contract_addr:
            'terra1u0t35drzyy0mujj8rkdyzhe264uls4ug3wdp3x' as CW20Addr,
        },
      },
      '1000000' as u<Token>,
      TEST_CONTRACT_ADDRESS.terraswap.factory,
      TEST_LCD_CLIENT,
    );

    expect(+lunaUstValue!).not.toBeNaN();
    expect(+krtUstValue!).not.toBeNaN();
    expect(blunaUstValue).toBeUndefined();
  });
});
