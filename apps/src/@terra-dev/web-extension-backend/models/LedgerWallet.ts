import { WebConnectorWalletInfo } from '@terra-dev/web-connector-interface';
import { USBDeviceInfo } from '../models/USBDeviceInfo';

export interface LedgerWallet extends WebConnectorWalletInfo {
  usbDevice: USBDeviceInfo;
}
