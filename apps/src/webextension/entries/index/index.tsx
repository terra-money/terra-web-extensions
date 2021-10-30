import React from 'react';
import { render } from 'react-dom';
import { HashRouter } from 'react-router-dom';
import { ErrorBoundary } from 'webextension/components/common/ErrorBoundary';
import { LocalesProvider } from 'webextension/contexts/locales';
import { Main } from 'webextension/entries/popup';

render(
  <HashRouter>
    <ErrorBoundary>
      <LocalesProvider>
        <Main />
      </LocalesProvider>
    </ErrorBoundary>
  </HashRouter>,
  document.querySelector('#app'),
);
