import { useWebExtensionConnector } from '@station/web-extension-react';
import {
  WebExtensionStates,
  WebExtensionStatus,
} from '@terra-dev/web-extension-interface';
import bowser from 'bowser';
import React from 'react';

export function CurrentStatus() {
  const { states, requestApproval } = useWebExtensionConnector();

  return (
    <section>
      <p>{JSON.stringify(states)}</p>
      <InstallMessage states={states} />
      {requestApproval && (
        <button onClick={() => requestApproval()}>Connect</button>
      )}
    </section>
  );
}

function InstallMessage({ states }: { states: WebExtensionStates }) {
  if (
    states.type !== WebExtensionStatus.NO_AVAILABLE ||
    states.isConnectorExists
  ) {
    return null;
  }

  const browser = bowser.getParser(navigator.userAgent);

  if (browser.getBrowserName(true) === 'safari') {
    return (
      <ol>
        <li>
          Download file{' '}
          <a href="/safari-webextension.zip" download>
            safari-webextension.zip
          </a>
        </li>
        <li>Check Safari Menubar / Allow Unsigned Extensions</li>
        <li>Unzip</li>
        <li>Run the .app file</li>
      </ol>
    );
  }

  return (
    <ol>
      <li>
        Download file{' '}
        <a href="/webextension.zip" download>
          webextension.zip
        </a>
      </li>
      <li>Unzip</li>
      {browser.getBrowserName(true) === 'firefox' ? (
        <>
          <li>Go to "about:debugging"</li>
          <li>Click "This FireFox"</li>
          <li>Click "Load Temporary Add-on"</li>
        </>
      ) : (
        <>
          <li>Go to "chrome:extensions"</li>
          <li>Enable "Developer Mode"</li>
          <li>Click "Load unpacked"</li>
        </>
      )}
      <li>Choose the unpacked directory</li>
    </ol>
  );
}
