export class WebExtensionUserDenied extends Error {
  constructor() {
    super('User Denied');
    this.name = 'WebExtensionUserDenied';
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

export class WebExtensionCreateTxFailed extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebExtensionCreateTxFailed';
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

export class WebExtensionTxFailed extends Error {
  constructor(
    public readonly txhash: string | undefined,
    message: string,
    public readonly raw_message: any,
  ) {
    super(message);
    this.name = 'WebExtensionTxFailed';
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

export class WebExtensionTxUnspecifiedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebExtensionTxUnspecifiedError';
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

export function createTxErrorFromJson(
  json: any,
):
  | WebExtensionUserDenied
  | WebExtensionCreateTxFailed
  | WebExtensionTxFailed
  | WebExtensionTxUnspecifiedError {
  switch (json.name) {
    case 'WebExtensionUserDenied':
      return new WebExtensionUserDenied();
    case 'WebExtensionCreateTxFailed':
      return new WebExtensionCreateTxFailed(json.message);
    case 'WebExtensionTxFailed':
      return new WebExtensionTxFailed(
        json.txhash,
        json.message,
        json.raw_message,
      );
    default:
      return new WebExtensionTxUnspecifiedError(
        'message' in json ? json.message : String(json),
      );
  }
}
