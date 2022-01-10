import { browser } from 'webextension-polyfill-ts';

async function reloadExtension(id: string) {
  const extensions = await browser.management.getAll();

  for (const extension of extensions) {
    if (
      extension.installType === 'development' &&
      extension.enabled &&
      extension.id === id
    ) {
      await browser.management.setEnabled(id, false);
      await browser.management.setEnabled(id, true);
    }
  }
}

async function reloadTabsByHostname(hostname: string) {
  const tabs = await browser.tabs.query({});
  for (const tab of tabs) {
    if (tab.url?.indexOf(hostname) === 0) {
      await browser.tabs.reload(tab.id);
    }
  }
}

async function reload() {
  const data = await browser.storage.local.get();
  if (!data) return;
  data.extensionIds.forEach(reloadExtension);
  data.hostnames.forEach(reloadTabsByHostname);
}

browser.commands.onCommand.addListener((command) => {
  switch (command) {
    case 'reload':
      reload();
      break;
  }
});

chrome.browserAction.onClicked.addListener(() => {
  reload();
});
