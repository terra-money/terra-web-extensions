declare module 'terra-web-extension' {
  const fn: (
    url: string,
    param?: {
      extensionPaths?: string[];
      enableInfoBar?: boolean;
      puppeteerLaunchOptions?: object;
      configPath?: string;
    },
  ) => void;

  export = fn;
}
