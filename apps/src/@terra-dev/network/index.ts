/**
 * @example
 * name: 'mainnet',
 * chainID: 'columbus-4',
 * servers: {
 *   lcd: 'https://lcd.terra.dev',
 *   fcd: 'https://fcd.terra.dev',
 *   ws: 'wss://fcd.terra.dev',
 *   mantle: 'https://mantle.terra.dev',
 * }
 */
export interface Network {
  name: string;
  chainID: string;
  servers: {
    lcd: string;
    fcd: string;
    ws: string;
    mantle: string;
  };
}
