import { browser } from 'webextension-polyfill-ts';

export function extensionPath(file: string, hash?: string): string {
  return browser.runtime.getURL(`${file}${hash ? '/#/' + hash : ''}`);
}
