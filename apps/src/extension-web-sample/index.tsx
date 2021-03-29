/// <reference types="../window"/>

import { TestKeys } from './pages/test-keys';
import React from 'react';
import { render } from 'react-dom';

function App() {
  return (
    <div>
      <TestKeys />
    </div>
  );
}

render(<App />, document.querySelector('#app'));

// Hot Module Replacement
if (module.hot) {
  module.hot.accept();
}
