import _en from './en.json';
import _ko from './ko.json';

export type LanguageCode = 'en-US' | 'ko-KR';
export const languageCodes: LanguageCode[] = ['en-US', 'ko-KR'];

export const en: Record<string, string> = _en;
export const ko: Record<string, string> = {
  ..._en,
  ..._ko,
};

export function isLanguageCode(value: string): value is LanguageCode {
  switch (value) {
    case 'en':
    case 'ko':
      return true;
  }
  return false;
}
