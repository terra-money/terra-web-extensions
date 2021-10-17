export class WebConnectorUserDenied extends Error {
  constructor() {
    super('User Denied');
    this.name = 'WebConnectorUserDenied';
  }

  toString = () => {
    return `[${this.name}]`;
  };

  toJSON = () => {
    return {
      name: this.name,
    };
  };
}

export class WebConnectorCreateTxFailed extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebConnectorCreateTxFailed';
  }

  toString = () => {
    return `[${this.name} message="${this.message}"]`;
  };

  toJSON = () => {
    return {
      name: this.name,
      message: this.message,
    };
  };
}

export class WebConnectorTxFailed extends Error {
  constructor(
    public readonly txhash: string | undefined,
    message: string,
    public readonly raw_message: any,
  ) {
    super(message);
    this.name = 'WebConnectorTxFailed';
  }

  toString = () => {
    return `[${this.name} txhash="${this.txhash}" message="${
      this.message
    }"]\n${JSON.stringify(this.raw_message, null, 2)}`;
  };

  toJSON = () => {
    return {
      name: this.name,
      txhash: this.txhash,
      message: this.message,
      raw_message: this.raw_message,
    };
  };
}

export class WebConnectorTxUnspecifiedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebConnectorTxUnspecifiedError';
  }

  toString = () => {
    return `[${this.name} message="${this.message}"]`;
  };

  toJSON = () => {
    return {
      name: this.name,
      message: this.message,
    };
  };
}

export class WebConnectorLedgerError extends Error {
  constructor(public readonly code: number, message: string) {
    super(message);
    this.name = 'WebConnectorLedgerError';
  }

  toString = () => {
    return `[${this.name} code="${this.code}" message="${this.message}"]`;
  };

  toJSON = () => {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
    };
  };
}

export function isWebConnectorError(error: unknown): boolean {
  return (
    error instanceof WebConnectorUserDenied ||
    error instanceof WebConnectorCreateTxFailed ||
    error instanceof WebConnectorTxFailed ||
    error instanceof WebConnectorLedgerError ||
    error instanceof WebConnectorTxUnspecifiedError
  );
}

export function createTxErrorFromJson(
  json: any,
):
  | WebConnectorUserDenied
  | WebConnectorCreateTxFailed
  | WebConnectorTxFailed
  | WebConnectorLedgerError
  | WebConnectorTxUnspecifiedError {
  switch (json.name) {
    case 'WebConnectorUserDenied':
      return new WebConnectorUserDenied();
    case 'WebConnectorCreateTxFailed':
      return new WebConnectorCreateTxFailed(json.message);
    case 'WebConnectorLedgerError':
      return new WebConnectorLedgerError(json.code, json.message);
    case 'WebConnectorTxFailed':
      return new WebConnectorTxFailed(
        json.txhash,
        json.message,
        json.raw_message,
      );
    default:
      return new WebConnectorTxUnspecifiedError(
        'message' in json ? json.message : String(json),
      );
  }
}
