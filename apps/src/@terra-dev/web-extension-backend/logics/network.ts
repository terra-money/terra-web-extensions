import { WebExtensionNetworkInfo } from '@terra-dev/web-extension-interface';

export enum NetworkNameInvalid {
  SAME_NAME_EXISTS = 'SAME_NAME_EXISTS',
}

export function validateNetworkName(
  name: string,
  networks: WebExtensionNetworkInfo[],
): NetworkNameInvalid | null {
  if (name.length === 0) {
    return null;
  }

  return networks.length > 0 &&
    networks.some((itemNetwork) => itemNetwork.name === name)
    ? NetworkNameInvalid.SAME_NAME_EXISTS
    : null;
}

export enum NetworkLcdURLInvalid {
  INVALID_URL = 'INVALID_URL',
}

export function validateNetworkLcdURL(
  lcd: string,
): NetworkLcdURLInvalid | null {
  return lcd.startsWith('https://') || lcd.startsWith('http://')
    ? null
    : NetworkLcdURLInvalid.INVALID_URL;
}
