import Transport from '@ledgerhq/hw-transport';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import { WebExtensionLedgerError } from '@terra-dev/web-extension';
import TerraLedgerApp, {
  PublicKeyResponse,
} from '@terra-money/ledger-terra-js';
import { Observable } from 'rxjs';
import { LedgerWallet, pickUSBDeviceInfo } from '../models';

const TERRA_APP_PATH: [number, number, number, number, number] = [
  44,
  330,
  0,
  0,
  0,
];
const TERRA_APP_HRP: string = 'terra';

export function isLedgerSupportBrowser(): boolean {
  return (
    typeof USBDevice !== 'undefined' && typeof navigator.usb !== 'undefined'
  );
}

export function observeConnectedLedgerList(): Observable<USBDevice[]> {
  return new Observable((subscriber) => {
    const devices: USBDevice[] = [];

    const subscription = TransportWebUSB.listen({
      next: ({ type, descriptor }) => {
        if (type === 'add') {
          devices.push(descriptor);
        } else if (type === 'remove') {
          const deviceIndex = devices.findIndex(
            ({ serialNumber, vendorId, productId }) =>
              descriptor.serialNumber === serialNumber ||
              (descriptor.vendorId === vendorId &&
                descriptor.productId === productId),
          );

          devices.splice(deviceIndex, 1);
        }

        subscriber.next([...devices]);
      },
      error: (error) => {
        console.error(error);
      },
      complete: () => {},
    });

    return () => {
      subscription.unsubscribe();
      subscriber.unsubscribe();
    };
  });
}

export async function getConnectedLedgerList(): Promise<USBDevice[]> {
  return TransportWebUSB.list();
}

export async function createTransport(): Promise<Transport> {
  const transport = await TransportWebUSB.create();

  if (transport) {
    return transport;
  } else {
    throw new Error(`Can't connect`);
  }
}

export async function connectLedger(): Promise<LedgerWallet | undefined> {
  const transport = await createTransport();
  const app = new TerraLedgerApp(transport);

  await app.initialize();

  if (!(transport instanceof TransportWebUSB)) {
    throw new Error(`transport is not a TransportWebUSB instance`);
  }

  const publicKey:
    | PublicKeyResponse
    | {
        return_code: number;
        error_message: string;
      } = await app.getAddressAndPubKey(TERRA_APP_PATH, TERRA_APP_HRP);

  if ('bech32_address' in publicKey) {
    console.log('ledger.ts..connectLedger()', publicKey);

    const usbDevice = pickUSBDeviceInfo(transport.device);

    const wallet: LedgerWallet = {
      name: usbDevice.productName ?? 'Ledger',
      terraAddress: publicKey.bech32_address,
      usbDevice,
      design: 'ledger',
    };

    await transport.close();

    return wallet;
  } else if ('return_code' in publicKey) {
    throw new WebExtensionLedgerError(
      publicKey.return_code,
      publicKey.error_message,
    );
  }
}
