import { getParser } from 'bowser';

const chrome =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.0 Safari/537.36';
const edge =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36 Edg/89.0.774.63';
const firefox =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:87.0) Gecko/20100101 Firefox/87.0';
const safari =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15';

const mobileChrome =
  'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.0 Mobile Safari/537.36';
const mobileSafari =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1';

describe('browser-detect', () => {
  test('should match browsers', () => {
    [chrome, edge, firefox, safari].forEach((userAgent) => {
      const browser = getParser(userAgent);
      expect(
        browser.satisfies({
          desktop: {
            chrome: '>70',
            edge: '>80',
            firefox: '>80',
            safari: '>=14',
          },
        }),
      ).toBeTruthy();
    });

    [mobileChrome, mobileSafari].forEach((userAgent) => {
      const browser = getParser(userAgent);
      expect(
        browser.satisfies({
          desktop: {
            chrome: '>70',
            edge: '>80',
            firefox: '>80',
            safari: '>=14',
          },
        }),
      ).toBeFalsy();
    });
  });
});
