export class WalletUserDenied extends Error {
  constructor() {
    super('User Denied');
    this.name = 'WalletUserDenied';
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

export class WalletCreateTxFailed extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WalletCreateTxFailed';
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

export class WalletTxFailed extends Error {
  constructor(
    public readonly txhash: string | undefined,
    message: string,
    public readonly raw_message: any,
  ) {
    super(message);
    this.name = 'WalletTxFailed';
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

export class WalletTxUnspecifiedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WalletTxUnspecifiedError';
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

export class WalletLedgerError extends Error {
  constructor(public readonly code: number, message: string) {
    super(message);
    this.name = 'WalletLedgerError';
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

// ---------------------------------------------
// functions
// ---------------------------------------------
export function isWalletError(error: unknown): boolean {
  return (
    error instanceof WalletUserDenied ||
    error instanceof WalletCreateTxFailed ||
    error instanceof WalletTxFailed ||
    error instanceof WalletLedgerError ||
    error instanceof WalletTxUnspecifiedError
  );
}

export function createTxErrorFromJson(
  json: any,
):
  | WalletUserDenied
  | WalletCreateTxFailed
  | WalletTxFailed
  | WalletLedgerError
  | WalletTxUnspecifiedError {
  switch (json.name) {
    case 'WalletUserDenied':
      return new WalletUserDenied();
    case 'WalletCreateTxFailed':
      return new WalletCreateTxFailed(json.message);
    case 'WalletLedgerError':
      return new WalletLedgerError(json.code, json.message);
    case 'WalletTxFailed':
      return new WalletTxFailed(json.txhash, json.message, json.raw_message);
    default:
      return new WalletTxUnspecifiedError(
        'message' in json ? json.message : String(json),
      );
  }
}
