import React from 'react';
import { render } from 'react-dom';
import { HashRouter } from 'react-router-dom';

function Main() {
  const queries = window.location.search;

  return <div>Tx!!! {queries}</div>;
}

render(
  <HashRouter>
    <Main />
  </HashRouter>,
  document.querySelector('#app'),
);
