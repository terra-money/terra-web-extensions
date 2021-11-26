declare module 'terra-web-extension' {
  const fn: (
    url: string,
    param?: {
      extensionPaths?: string[];
      puppeteerLaunchOptions?: object;
      configPath?: string;
    },
  ) => void;

  export = fn;
}
