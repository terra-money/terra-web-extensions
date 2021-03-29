import React from 'react';
import { render } from 'react-dom';
import { HashRouter } from 'react-router-dom';

function Main() {
  return <div>Tx</div>;
}

render(
  <HashRouter>
    <Main />
  </HashRouter>,
  document.querySelector('#app'),
);
