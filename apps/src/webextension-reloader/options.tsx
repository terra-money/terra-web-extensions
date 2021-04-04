import React, { useCallback, useEffect, useState } from 'react';
import { render } from 'react-dom';
import styled from 'styled-components';
import { browser } from 'webextension-polyfill-ts';

function AppBase({ className }: { className?: string }) {
  const [extensionIds, setExtensionIds] = useState<string>('');
  const [hostnames, setHostnames] = useState<string>('');

  useEffect(() => {
    browser.storage.local.get().then((data) => {
      setExtensionIds(data?.extensionIds.join('\n') ?? '');
      setHostnames(data?.hostnames.join('\n') ?? '');
    });
  }, []);

  const save = useCallback(async () => {
    const next = {
      extensionIds: extensionIds.split('\n'),
      hostnames: hostnames.split('\n'),
    };
    await browser.storage.local.set(next);
  }, [extensionIds, hostnames]);

  return (
    <section className={className}>
      <h1>Extension IDs</h1>
      <textarea
        value={extensionIds}
        placeholder="mlgfiiampliobiacdbmdmhhlibolenhc&#13;&#10;eckadffbahhkgbnmekloiopkaedioffl"
        onChange={({ target }) => setExtensionIds(target.value)}
      />

      <h1>Host Names</h1>
      <textarea
        value={hostnames}
        placeholder="http://localhost:8001&#13;&#10;https://dev.com"
        onChange={({ target }) => setHostnames(target.value)}
      />

      <footer>
        <button onClick={save}>Save</button>
      </footer>
    </section>
  );
}

const App = styled(AppBase)`
  textarea {
    width: 100%;
    max-width: 500px;
    height: 100px;
  }

  footer {
    margin-top: 1em;
  }
`;

render(<App />, document.querySelector('#app'));
