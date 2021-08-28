import {
  SerializedCreateTxOptions,
  WebExtensionNetworkInfo,
} from '@terra-dev/web-extension';

export interface TxRequest {
  id: string;
  terraAddress: string;
  network: WebExtensionNetworkInfo;
  tx: SerializedCreateTxOptions;
  hostname: string;
  date: Date;
}

export function toURLSearchParams({
  id,
  terraAddress,
  network,
  tx,
  hostname,
  date,
}: TxRequest): string {
  const params = new URLSearchParams();

  params.set('id', id);
  params.set('terra-address', terraAddress);
  params.set('network', btoa(JSON.stringify(network)));
  params.set('tx', btoa(JSON.stringify(tx)));
  params.set('hostname', hostname);
  params.set('date', date.getTime().toString());

  return params.toString();
}

export function fromURLSearchParams(search: string): TxRequest | undefined {
  const params = new URLSearchParams(search);

  const id = params.get('id');
  const terraAddress = params.get('terra-address');
  const txBase64 = params.get('tx');
  const networkBase64 = params.get('network');
  const hostname = params.get('hostname');
  const date = params.get('date');

  if (
    !id ||
    !terraAddress ||
    !txBase64 ||
    !networkBase64 ||
    !hostname ||
    !date
  ) {
    console.error(`Can't find TxRequest on the search`, params);
    return undefined;
  }

  const tx: SerializedCreateTxOptions = JSON.parse(atob(txBase64));
  const network: WebExtensionNetworkInfo = JSON.parse(atob(networkBase64));

  return {
    id,
    terraAddress,
    network,
    tx,
    hostname,
    date: new Date(parseInt(date)),
  };
}
