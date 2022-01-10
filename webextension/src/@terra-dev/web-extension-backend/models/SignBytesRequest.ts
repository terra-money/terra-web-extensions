export interface SignBytesRequest {
  id: string;
  terraAddress: string;
  bytes: Buffer;
  hostname: string;
  date: Date;
  closeWindowAfterTx: boolean;
}

export function signBytesRequestToURLSearchParams({
  id,
  terraAddress,
  bytes,
  hostname,
  date,
  closeWindowAfterTx,
}: SignBytesRequest): string {
  const params = new URLSearchParams();

  params.set('id', id);
  params.set('terra-address', terraAddress);
  params.set('bytes', bytes.toString('base64'));
  params.set('hostname', hostname);
  params.set('date', date.getTime().toString());
  if (closeWindowAfterTx) {
    params.set('close-window-after-tx', 'yes');
  }

  return params.toString();
}

export function signBytesRequestFromURLSearchParams(
  search: string,
): SignBytesRequest | undefined {
  const params = new URLSearchParams(search);

  const id = params.get('id');
  const terraAddress = params.get('terra-address');
  const bytesBase64 = params.get('bytes');
  const hostname = params.get('hostname');
  const date = params.get('date');

  if (!id || !terraAddress || !bytesBase64 || !hostname || !date) {
    console.error(`Can't find SignBytesRequest on the search`, params);
    return undefined;
  }

  const bytes = Buffer.from(bytesBase64, 'base64');
  const closeWindowAfterTx: boolean =
    params.get('close-window-after-tx') === 'yes';

  return {
    id,
    terraAddress,
    bytes,
    hostname,
    date: new Date(parseInt(date)),
    closeWindowAfterTx,
  };
}
