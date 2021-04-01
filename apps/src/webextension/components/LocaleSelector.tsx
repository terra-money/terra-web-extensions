import React from 'react';
import { useLocales } from '../contexts/locales';

export function LocaleSelector() {
  const { locale, locales, updateLocale } = useLocales();

  return (
    <div>
      <ul>
        {locales.map((l) => (
          <li key={l}>
            <span onClick={() => updateLocale(l)}>
              [{l === locale ? 'X' : ' '}] {l}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
