import { browser, Runtime } from 'webextension-polyfill-ts';



export async function getBackgroundPort(name: string): Promise<Runtime.Port> {
  return new Promise<Runtime.Port>(resolve => {
    browser.runtime.onConnect.addListener(port => {
      if (port.name === name) {
        resolve(port);
      }
    });
  });
}

export async function getAppPort(extensionId: string, name: string): Promise<Runtime.Port> {
  return new Promise<Runtime.Port>(resolve => {
    //browser.runtime.connect({name})
    
    browser.runtime.onConnect.addListener(port => {
      if (port.name === name) {
        resolve(port);
      }
    });
  });
}