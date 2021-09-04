import Transport from '@ledgerhq/hw-transport';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import { WebExtensionLedgerError } from '@terra-dev/web-extension';
import TerraLedgerApp, {
  PublicKeyResponse,
} from '@terra-money/ledger-terra-js';
import {
  Key,
  PublicKey,
  StdSignature,
  StdSignMsg,
} from '@terra-money/terra.js';
import { Observable } from 'rxjs';
import { signatureImport } from 'secp256k1';
import { LedgerWallet, pickUSBDeviceInfo } from '../models';

export const TERRA_APP_PATH: [number, number, number, number, number] = [
  44, 330, 0, 0, 0,
];
export const TERRA_APP_HRP: string = 'terra';

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

export async function createLedgerKey(): Promise<LedgerKey> {
  const transport = await createTransport();
  const app = new TerraLedgerApp(transport);

  await app.initialize();

  const publicKey = await app.getAddressAndPubKey(
    TERRA_APP_PATH,
    TERRA_APP_HRP,
  );

  const publicKeyBuffer = Buffer.from(publicKey.compressed_pk as any);

  const key = new LedgerKey(publicKeyBuffer, app);

  return key;
}

export class LedgerKey extends Key {
  constructor(publicKey: Buffer | undefined, private app: TerraLedgerApp) {
    super(publicKey);
  }

  sign(payload: Buffer): Promise<Buffer> {
    throw new Error('');
  }

  createSignature = async (tx: StdSignMsg): Promise<StdSignature> => {
    const publicKeyBuffer = this.publicKey;

    if (!publicKeyBuffer) {
      throw new Error(`Can't get publicKey`);
    }

    const serializedTx = tx.toJSON();

    const signature = await this.app.sign(TERRA_APP_PATH, serializedTx);
    const signatureBuffer = Buffer.from(
      signatureImport(Buffer.from(signature.signature.data)),
    );

    if (!signatureBuffer) {
      throw new Error(`Can't get signature`);
    }

    return new StdSignature(
      signatureBuffer.toString('base64'),
      PublicKey.fromData({
        type: 'tendermint/PubKeySecp256k1',
        value: publicKeyBuffer.toString('base64'),
      }),
    );
  };
}
