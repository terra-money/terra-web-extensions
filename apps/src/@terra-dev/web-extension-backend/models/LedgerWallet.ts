import { WebExtensionWalletInfo } from '@terra-dev/web-extension';
import { USBDeviceInfo } from '../models/USBDeviceInfo';

export interface LedgerWallet extends WebExtensionWalletInfo {
  usbDevice: USBDeviceInfo;
}
