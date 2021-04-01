import React, {
  Consumer,
  Context,
  createContext,
  ReactNode,
  useContext,
  useMemo,
} from 'react';
import { getBrowserLocale, useLocale } from 'use-locale';
import { en, ko, LanguageCode, languageCodes } from '../locales';

export interface LocalesProviderProps {
  children: ReactNode;
}

export interface Locales {
  locale: LanguageCode;
  locales: LanguageCode[];
  updateLocale: (next: LanguageCode) => void;
}

// @ts-ignore
const LocalesContext: Context<Locales> = createContext<Locales>();

export function LocalesProvider({ children }: LocalesProviderProps) {
  const browserLocale = useMemo(
    () => getBrowserLocale<LanguageCode>({ fallbackLanguageCodes: ['en-US'] }),
    [],
  );

  const { locale, updateLocale } = useLocale<LanguageCode>(browserLocale);

  return (
    <LocalesContext.Provider
      value={{ locale, locales: languageCodes, updateLocale }}
    >
      {children}
    </LocalesContext.Provider>
  );
}

export function useLocales(): Locales {
  return useContext(LocalesContext);
}

export function useIntlProps(): {
  locale: string;
  messages: Record<string, string>;
} {
  const { locale } = useContext(LocalesContext);

  return {
    locale: locale.substr(0, 2),
    messages: locale === 'ko-KR' ? ko : en,
  };
}

export const LocalesConsumer: Consumer<Locales> = LocalesContext.Consumer;
