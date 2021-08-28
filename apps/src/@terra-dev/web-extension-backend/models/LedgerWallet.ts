import { WalletInfo } from '@terra-dev/web-extension';
import { USBDeviceInfo } from '../models/USBDeviceInfo';

export interface LedgerWallet extends WalletInfo {
  usbDevice: USBDeviceInfo;
}
