/**
 * @example
 * name: 'mainnet',
 * chainID: 'columbus-4',
 */
export interface Network {
  name: string;
  chainID: string;
  fcd: string;
  lcd: string;
  ws: string;
}
