import * as Sentry from '@sentry/browser';
import { Integrations } from '@sentry/tracing';
import React from 'react';
import { render } from 'react-dom';
import { Title } from './components/Title';

if (process.env.NODE_ENV !== 'development' && process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: 1.0,
  });
}

function App() {
  return <Title text="Hello World!" />;
}

render(<App />, document.querySelector('#app'));

if (process.env.NODE_ENV === 'development') {
  import('web-vitals').then(
    ({
      getCLS,
      getFID,
      getFCP,
      getLCP,
      getTTFB,
    }: typeof import('web-vitals')) => {
      getCLS(console.log);
      getFID(console.log);
      getFCP(console.log);
      getLCP(console.log);
      getTTFB(console.log);
    },
  );
} else {
  // @see https://github.com/GoogleChrome/web-vitals#send-the-results-to-google-analytics
}

// Hot Module Replacement
if (module.hot) {
  module.hot.accept();
}
