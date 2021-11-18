import { WalletInfo } from '@terra-dev/wallet-interface';
import { USBDeviceInfo } from '../models/USBDeviceInfo';

export interface LedgerWallet extends WalletInfo {
  usbDevice: USBDeviceInfo;
}
