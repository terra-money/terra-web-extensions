import { terraswapPairQuery } from '@libs/app-fns/queries/terraswap/pair';
import { TEST_CONTRACT_ADDRESS, TEST_LCD_CLIENT } from '@libs/app-fns/test-env';
import { CW20Addr } from '@libs/types';

describe('terraswapPairQuery()', () => {
  test('should get pair info of cw20 contract', async () => {
    const lunaBlunaPair = await terraswapPairQuery(
      TEST_CONTRACT_ADDRESS.terraswap.factory,
      [
        {
          token: {
            contract_addr:
              'terra1u0t35drzyy0mujj8rkdyzhe264uls4ug3wdp3x' as CW20Addr,
          },
        },
        {
          native_token: {
            denom: 'uluna',
          },
        },
      ],
      TEST_LCD_CLIENT,
    );

    const ancUstPair = await terraswapPairQuery(
      TEST_CONTRACT_ADDRESS.terraswap.factory,
      [
        {
          token: {
            contract_addr:
              'terra1747mad58h0w4y589y3sk84r5efqdev9q4r02pc' as CW20Addr,
          },
        },
        {
          native_token: {
            denom: 'uusd',
          },
        },
      ],
      TEST_LCD_CLIENT,
    );

    console.log('pair.test.ts..()', lunaBlunaPair, ancUstPair);
  });
});
