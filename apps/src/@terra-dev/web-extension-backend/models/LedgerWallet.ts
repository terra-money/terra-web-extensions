import { WebExtensionWalletInfo } from '@terra-dev/web-extension-interface';
import { USBDeviceInfo } from '../models/USBDeviceInfo';

export interface LedgerWallet extends WebExtensionWalletInfo {
  usbDevice: USBDeviceInfo;
}
